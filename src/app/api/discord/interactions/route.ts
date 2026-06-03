import {
  discordBotConfigured,
  getCommandResponse,
} from "@/lib/discord-bot";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json(
      { error: "Discord bot not configured" },
      { status: 503 }
    );
  }

  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  const body = await req.text();

  if (!signature || !timestamp) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const valid = verifyKey(body, signature, timestamp, publicKey);
  if (!valid) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const interaction = JSON.parse(body) as {
    type: number;
    data?: { name?: string };
  };

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const name = interaction.data?.name ?? "help";
    const response = getCommandResponse(name);
    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: response.content || undefined,
        embeds: response.embeds,
      },
    });
  }

  return new NextResponse("Unknown interaction", { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: discordBotConfigured(),
    endpoint: "/api/discord/interactions",
  });
}
