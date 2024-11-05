import { Pinecone } from "@pinecone-database/pinecone"; // Adjusted import for PineconeClient
import { downloadFromCloudinary } from "./cloudinary-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getEmbeddings } from "./embeddings"; // Ensure you have this function imported
import md5 from "md5";
import { PineconeRecord } from "@pinecone-database/pinecone";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";


import { convertToAscii } from "./utils";

// Initialize the Pinecone client
export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadCloudinaryIntoPinecone(fileKey: string, url: string) {
    console.log("Downloading file from Cloudinary...");
    const file_name = await downloadFromCloudinary(fileKey, url);
    console.log(`Downloaded file: ${file_name}`);
  
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    const documents=await Promise.all(pages.map(prepareDocument));


     // 3. vectorise and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("ask-pdf");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

  return documents[0];

  }

  async function embedDocument(doc: Document) {
    try {
      const embeddings = await getEmbeddings(doc.pageContent);
      const hash = md5(doc.pageContent);
  
      return {
        id: hash,
        values: embeddings,
        metadata: {
          text: doc.metadata.text,
          pageNumber: doc.metadata.pageNumber,
        },
      } as PineconeRecord;
    } catch (error) {
      console.log("error embedding document", error);
      throw error;
    }
  }
  
  export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder();
    return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
  };

  async function prepareDocument(page: PDFPage) {
    const { pageContent, metadata } = page; // Use const for destructuring
    const cleanedPageContent = pageContent.replace(/\n/g, "");

    // Split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent: cleanedPageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(cleanedPageContent, 36000),
            },
        }),
    ]);

    console.log("the new doc is ", docs);
    return docs;
}

  // async function prepareDocument(page: PDFPage) {
  //   let { pageContent, metadata } = page;
  //   pageContent = pageContent.replace(/\n/g, "");
  //   // split the docs
  //   const splitter = new RecursiveCharacterTextSplitter();
  //   const docs = await splitter.splitDocuments([
  //     new Document({
  //       pageContent,
  //       metadata: {
  //         pageNumber: metadata.loc.pageNumber,
  //         text: truncateStringByBytes(pageContent, 36000),
  //       },
  //     }),
  //   ]);

  //   console.log("the new doc is ", docs)
  //   return docs;
  // }






// import { Pinecone } from "@pinecone-database/pinecone"; // Adjusted import for PineconeClient
// import { downloadFromCloudinary } from "./cloudinary-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { getEmbeddings } from "./embeddings"; // Ensure you have this function imported
// import md5 from "md5";

// // Initialize the Pinecone client
// export const getPineconeClient = () => {
//   return new Pinecone({
//     apiKey: process.env.PINECONE_API_KEY!,
//   });
// };

// export async function loadCloudinaryIntoPinecone(fileKey: string, url: string) {
//   console.log("Downloading file from Cloudinary...");
//   const file_name = await downloadFromCloudinary(fileKey, url);
//   console.log(`Downloaded file: ${file_name}`);

//   const loader = new PDFLoader(file_name);
//   const pages = await loader.load();

//   const pineconeClient = getPineconeClient();
//   const index = pineconeClient.index("ask-pdf");

//   // Loop over each page
//   for (let pageNumber = 0; pageNumber < pages.length; pageNumber++) {
//     const pageContent = pages[pageNumber].pageContent;

//     // Split paragraphs based on multiple new lines and trim spaces
//     const paragraphs = pageContent.split(/\n\s*\n+/).map(paragraph => paragraph.trim()).filter(Boolean);

//     // Loop over each paragraph in the current page
//     for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex++) {
//       const paragraph = paragraphs[paragraphIndex];
      
//       console.log(`Processing page ${pageNumber + 1}, paragraph ${paragraphIndex + 1}: ${paragraph}`);

//       try {
//         const embedding = await getEmbeddings(paragraph);
//         if (embedding) {
//           const vectorId = md5(paragraph); // Unique ID for this paragraph
//           console.log(`Embedding for page ${pageNumber + 1}, paragraph ${paragraphIndex + 1}:`, JSON.stringify(embedding));

//           // Upsert embedding into Pinecone
//           await index.upsert([{
//             id: vectorId,
//             values: embedding,
//             metadata: {
//               pageNumber: pageNumber + 1, // Adjust to human-readable numbering
//               paragraphIndex: paragraphIndex + 1, // Adjust to human-readable numbering
//               content: paragraph,
//             },
//           }]);
//         } else {
//           console.warn(`No embedding returned for page ${pageNumber + 1}, paragraph ${paragraphIndex + 1}`);
//         }
//       } catch (error) {
//         console.error(`Error generating embedding for page ${pageNumber + 1}, paragraph ${paragraphIndex + 1}:`, error);
//       }
//     }
//   }
//   return pages;
// }


// import { Pinecone } from "@pinecone-database/pinecone"; // Adjusted import for PineconeClient
// import { downloadFromCloudinary } from "./cloudinary-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { getEmbeddings } from "./embeddings"; // Ensure you have this function imported
// import md5 from "md5";

// // Initialize the Pinecone client
// export const getPineconeClient = () => {
//   return new Pinecone({
//     apiKey: process.env.PINECONE_API_KEY!,
//   });
// };

// export async function loadCloudinaryIntoPinecone(fileKey: string, url: string) {
//   console.log("Downloading file from Cloudinary...");
//   const file_name = await downloadFromCloudinary(fileKey, url);
//   console.log(`Downloaded file: ${file_name}`);

//   const loader = new PDFLoader(file_name);
//   const pages = await loader.load();

//   const pineconeClient = getPineconeClient();
//   const index = pineconeClient.index("ask-pdf");

//   // Loop over each page
//   for (let pageNumber = 0; pageNumber < pages.length; pageNumber++) {
//     const pageContent = pages[pageNumber].pageContent;

//     // Log the page content for debugging
//     console.log(`Page ${pageNumber + 1} content:`, pageContent);

//     // Split paragraphs using regex for better handling
//     const paragraphs = pageContent
//       .split(/\n\s*\n+/) // First split by double newlines
//       .map(paragraph => paragraph.trim())
//       .filter(Boolean)
//       .flatMap(paragraph => paragraph.split(/(?<=[.!?])\s+/)); // Then split by sentence-ending punctuation and whitespace

//     // Loop over each paragraph in the current page
//     for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex++) {
//       const paragraph = paragraphs[paragraphIndex];

//       console.log(`Processing page ${pageNumber + 1}, paragraph ${paragraphIndex + 1}: ${paragraph}`);

//       try {
//         const embedding = await getEmbeddings(paragraph);
//         if (embedding) {
//           const vectorId = md5(paragraph); // Unique ID for this paragraph
//           console.log(`Embedding for page ${pageNumber + 1}, paragraph ${paragraphIndex + 1}:`, JSON.stringify(embedding));

//           // Upsert embedding into Pinecone
//           await index.upsert([{
//             id: vectorId,
//             values: embedding,
//             metadata: {
//               pageNumber: pageNumber + 1, // Adjust to human-readable numbering
//               paragraphIndex: paragraphIndex + 1, // Adjust to human-readable numbering
//               content: paragraph,
//             },
//           }]);
//         } else {
//           console.warn(`No embedding returned for page ${pageNumber + 1}, paragraph ${paragraphIndex + 1}`);
//         }
//       } catch (error) {
//         console.error(`Error generating embedding for page ${pageNumber + 1}, paragraph ${paragraphIndex + 1}:`, error);
//       }
//     }
//   }
//   return pages;
// }









