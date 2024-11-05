
// app/api/chat/route.ts

import { getContext } from '@/lib/context';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { NextResponse } from "next/server";
// Set a maximum duration for the response stream
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Parse messages from the request body
    const { messages, chatId } = await req.json();
    
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    // Construct the prompt for the AI
    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question but i will learn about this in future".
      AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    // Configure the Google Gemini model for streaming text responses
    //use gemini-1.5-pro-latest or gemini-1.5-flash
    const result = await streamText({
      model: google('gemini-1.5-flash', {
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
        structuredOutputs: true, // Optional: enable structured output if needed
      }),
      messages: [
        prompt, // Include the constructed prompt
        ...messages.filter((message: any) => message.role === "user"), // Include user messages
      ],
    });

    // Return the streamed response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
