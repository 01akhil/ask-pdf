
// import { db } from "@/lib/db";
// import { chats } from "@/lib/db/schema";
// import { loadCloudinaryIntoPinecone } from "@/lib/pinecone";

// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // /api/create-chat
// export async function POST(req: Request, res: Response) {
//   const { userId } = await auth();
//   if (!userId) {
//     return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//   }
//   try {
//     const body = await req.json();
//     const { file_key, file_name,url } = body;
//     console.log(file_key, file_name,url);
//     const pages = await loadCloudinaryIntoPinecone(file_key, url);
//     const chat_id = await db
//       .insert(chats)
//       .values({
//         fileKey: file_key,
//         pdfName: file_name,
//         pdfUrl: url,
//         userId,
//       })
//       .returning({
//         insertedId: chats.id,
//       });

//     return NextResponse.json(
//       {
//         chat_id: chat_id[0].insertedId,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "internal server error" },
//       { status: 500 }
//     );
//   }
// }



import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadCloudinaryIntoPinecone } from "@/lib/pinecone";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// /api/create-chat
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name, url } = body;
    console.log(file_key, file_name, url);

    // If pages is not used, you can remove this line
    await loadCloudinaryIntoPinecone(file_key, url); // Removed assignment to pages

    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: url,
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
