
// app/api/messages/route.ts
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const POST = async (req: Request) => {
    const { chatId } = await req.json();
    
    if (!chatId) {
        return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    const _messages = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId));

    return NextResponse.json(_messages);
};
