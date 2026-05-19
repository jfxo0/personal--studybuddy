import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName:
    process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME,
});

const model = new AzureChatOpenAI({
    temperature: 0.2,
});

const vectorDbPath = path.join(__dirname, "vectordb");

const vectorStore = await FaissStore.load(
    vectorDbPath,
    embeddings
);

console.log("vector store loaded");