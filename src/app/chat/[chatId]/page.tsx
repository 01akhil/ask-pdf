// @ts-nocheck

import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params }: Props) => {
  // Await the params to access chatId
  const { chatId } = await params; 
  const { userId } = await auth();

  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
    return; // Return to prevent further execution
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  // Redirect if there are no chats
  if (!_chats.length) {
    redirect("/");
    return; // Return to prevent further execution
  }

  const currentChat = _chats.find(chat => chat.id === parseInt(chatId));

  // Redirect if currentChat does not exist
  if (!currentChat) {
    redirect("/");
    return; // Return to prevent further execution
  }

  return (
    <div className="flex max-h-screen overflow-hidden">
      <div className="flex w-full max-h-screen overflow-hidden">
       
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 overflow-y-hidden overflow-x-hidden flex-[5]">
          <PDFViewer pdf_url={currentChat.pdfUrl || ''} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
     
    </div>
  );
};

export default ChatPage;



