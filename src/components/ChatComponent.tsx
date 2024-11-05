// "use client";
// import React from "react";
// import { Input } from "./ui/Input";
// import { useChat } from "ai/react";
// import { Button } from "./ui/button";
// import { Send } from "lucide-react";
// import MessageList from "./MessageList";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { Message } from "ai";

// type Props = { chatId: number };

// const ChatComponent = ({ chatId }: Props) => {
//   const { data, isLoading } = useQuery({
//     queryKey: ["chat", chatId],
//     queryFn: async () => {
//       const response = await axios.post<Message[]>("/api/get-messages", {
//         chatId,
//       });
//       return response.data;
//     },
//   });

//   const { input, handleInputChange, handleSubmit, messages } = useChat({
//     api: "/api/chat",
//     body: {
//       chatId,
//     },
//     initialMessages: data || [],
//   });
//   React.useEffect(() => {
//     const messageContainer = document.getElementById("message-container");
//     if (messageContainer) {
//       messageContainer.scrollTo({
//         top: messageContainer.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [messages]);
//   return (
//     <div
//       className="relative max-h-screen overflow-scroll"
//       id="message-container"
//     >
//       {/* header */}
//       <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
//         <h3 className="text-xl font-bold">Chat</h3>
//       </div>

//       {/* message list */}
//       <MessageList messages={messages} isLoading={isLoading} />

//       <form
//         onSubmit={handleSubmit}
//         className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
//       >
//         <div className="flex">
//           <Input
//             value={input}
//             onChange={handleInputChange}
//             placeholder="Ask any question..."
//             className="w-full"
//           />
//           <Button className="bg-blue-600 ml-2">
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChatComponent;



"use client";
import React from "react";
import { Input } from "./ui/Input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  // Scroll to the bottom when messages change
  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white z-10">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* Message list */}
      <div
        id="message-container"
        className="flex-1 overflow-auto flex flex-col-reverse p-2 space-y-2"
      >
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white flex"
      >
        <div className="flex flex-1">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
