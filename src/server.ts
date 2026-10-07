import { createWorkersAI } from "workers-ai-provider";
import { callable, routeAgentRequest } from "agents";
import { AIChatAgent, type OnChatMessageOptions } from "@cloudflare/ai-chat";
import {
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  streamText
} from "ai";
import { searchConcerts, CONCERT_DATABASE } from "./lib/search";

export class ChatAgent extends AIChatAgent<Env> {
  maxPersistedMessages = 100;
  chatRecovery = true;
  waitForMcpConnections = true;

  onStart() {
    this.mcp.configureOAuthCallback({
      customHandler: (result) => {
        if (result.authSuccess) {
          return new Response("<script>window.close();</script>", {
            headers: { "content-type": "text/html" },
            status: 200
          });
        }
        return new Response(
          `Authentication Failed: ${result.authError || "Unknown error"}`,
          { headers: { "content-type": "text/plain" }, status: 400 }
        );
      }
    });
  }

  @callable()
  async addServer(name: string, url: string) {
    return await this.addMcpServer(name, url);
  }

  @callable()
  async removeServer(serverId: string) {
    await this.removeMcpServer(serverId);
  }

  async onChatMessage(_onFinish: unknown, options?: OnChatMessageOptions) {
    const mcpTools = this.mcp.getAITools();
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai("@cf/meta/llama-3.1-8b-instruct", {
        sessionAffinity: this.sessionAffinity
      }),
      system: `You are an expert musicologist assisting Malaysian Philharmonic Orchestra attendees. You recommend concerts based on composers, pieces, and artistic themes.`,
      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages",
        reasoning: "before-last-message"
      }),
      tools: {
        ...mcpTools
      },
      stopWhen: stepCountIs(10),
      abortSignal: options?.abortSignal
    });

    return result.toUIMessageStreamResponse();
  }
}

/**
 * Resolves natural language queries (e.g. "composer who wrote Swan Lake", "that deaf German composer")
 * to the exact composer name using Cloudflare Workers AI.
 */
async function resolveComposerWithLLM(
  query: string,
  env: Env
): Promise<{
  composer: string;
  commentary: string;
  confidence: "high" | "medium" | "low";
}> {
  if (!env.AI) {
    console.warn("env.AI binding is not defined on the Worker environment.");
    return { composer: query, commentary: "", confidence: "low" };
  }

  try {
    const prompt = `You are a musicology expert helping users find orchestra concerts.
The user is searching for a composer using a name, piece title, musical nickname, or description.
User query: "${query}"

Return a JSON object in this exact schema:
{
  "composer": "<Full Standard Name of the Composer or Artist>",
  "commentary": "<Brief 1-sentence note connecting the user query to this composer>",
  "confidence": "high"
}

Examples:
- "composer who wrote Swan Lake" -> {"composer": "Pyotr Ilyich Tchaikovsky", "commentary": "Swan Lake is one of Tchaikovsky's most renowned ballet masterpieces.", "confidence": "high"}
- "that deaf German composer" -> {"composer": "Ludwig van Beethoven", "commentary": "Ludwig van Beethoven famously continued composing iconic symphonies and concertos after losing his hearing.", "confidence": "high"}
- "who wrote Bohemian Rhapsody" -> {"composer": "Queen / Freddie Mercury", "commentary": "Bohemian Rhapsody was composed by Freddie Mercury for Queen in 1975.", "confidence": "high"}
- "Ghibli music guy" -> {"composer": "Joe Hisaishi", "commentary": "Joe Hisaishi composed the legendary orchestral scores for Studio Ghibli films like Totoro and Spirited Away.", "confidence": "high"}`;

    // Native Cloudflare Workers AI call
    const result = (await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content:
            "You are an expert musicologist. Always respond with only a valid JSON object matching the requested schema. Do not include markdown fences or preamble."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 250
    })) as { response?: string } | string;

    const rawText =
      typeof result === "string" ? result : result?.response || "";

    // Extract JSON with regex to avoid syntax errors from markdown fences or leading commentary
    const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.composer) {
        return {
          composer: String(parsed.composer).trim(),
          commentary: String(parsed.commentary || "").trim(),
          confidence: (parsed.confidence as "high" | "medium" | "low") || "high"
        };
      }
    }

    console.warn("Could not parse JSON from Workers AI output:", rawText);
    return {
      composer: query,
      commentary: "",
      confidence: "low"
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
    console.warn("Workers AI resolution failed, falling back:", errorMsg);
    return {
      composer: query,
      commentary: "",
      confidence: "low"
    };
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // API: Get all concerts
    if (url.pathname === "/api/concerts" && request.method === "GET") {
      return Response.json(CONCERT_DATABASE, {
        headers: { "content-type": "application/json" }
      });
    }

    // API: Resolve composer name via LLM
    if (url.pathname === "/api/resolve-composer" && request.method === "POST") {
      try {
        const body = (await request.json()) as { query?: string };
        const query = body.query?.trim();
        if (!query) {
          return Response.json({ error: "Missing query" }, { status: 400 });
        }

        const resolution = await resolveComposerWithLLM(query, env);
        return Response.json(resolution, {
          headers: { "content-type": "application/json" }
        });
      } catch (err) {
        return Response.json(
          { error: `Resolution error: ${String(err)}` },
          { status: 500 }
        );
      }
    }

    // API: Search concerts with LLM resolution and deterministic catalog filtering
    if (url.pathname === "/api/search" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          query?: string;
          referenceDate?: string;
        };
        const query = body.query?.trim() || "";
        if (!query) {
          return Response.json({ error: "Missing query" }, { status: 400 });
        }

        // 1. Direct search check first
        let result = searchConcerts(query, {
          referenceDate: body.referenceDate
        });

        // 2. If direct search has no matches or looks like a descriptive phrase (more than 2 words), run LLM resolver
        if (!result.hasMatches || query.split(" ").length > 2) {
          const resolution = await resolveComposerWithLLM(query, env);
          if (resolution.composer && resolution.composer !== query) {
            const enrichedResult = searchConcerts(query, {
              resolvedComposer: resolution.composer,
              aiCommentary: resolution.commentary,
              referenceDate: body.referenceDate
            });

            if (enrichedResult.hasMatches) {
              result = enrichedResult;
            } else if (result.hasMatches) {
              // keep direct result if it matched
              result.aiCommentary = resolution.commentary;
            } else {
              result = enrichedResult;
            }
          }
        }

        return Response.json(result, {
          headers: { "content-type": "application/json" }
        });
      } catch (err) {
        return Response.json(
          { error: `Search error: ${String(err)}` },
          { status: 500 }
        );
      }
    }

    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
