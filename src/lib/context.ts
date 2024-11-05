import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
)

{

  try {
    const client = new Pinecone({
     
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.index("ask-pdf");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    const queryResult = await namespace.query({
      topK: 50,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
    console.log("getting the context of the question")
    const queryEmbeddings = await getEmbeddings(query);
  
    // Check if queryEmbeddings is valid
    if (!Array.isArray(queryEmbeddings) || queryEmbeddings.length === 0) {
      console.error("No embeddings found for the query");
      return ""; // Or handle it in another way, like returning a default message
    }
    
    console.log("finding the right match from the generated embeddings")
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  
    console.log("these are the matches");
    console.log(matches);

    const qualifyingDocs = matches.filter(
      (match) => match.score && match.score > 0.1
    );
  
    type Metadata = {
      text: string;
      pageNumber: number;
    };
  
    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
    // 5 vectors
    return docs.join("\n").substring(0, 3000);
  }
  









