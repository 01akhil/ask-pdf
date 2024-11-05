

// import { text } from "stream/consumers";

import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function getEmbeddings(text) {
    try {
        const text1=text.replace(/\n/g,' ');
        console.log("generating embeddings for the question: ",text1);
        const result = await model.embedContent(text1);
        console.log(result.embedding.values); 
        return result.embedding.values;
    } catch (error) {
        console.error('Error fetching embeddings:', error);
    }
}
