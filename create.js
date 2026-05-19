import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";


const url = "public/documents/klantendocument.pdf";

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

const model = new AzureChatOpenAI({
    temperature: 0.2
})

const loader = new PDFLoader(url)
const docs = await loader.load()

// opsplitsen
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
const chunks = await textSplitter.splitDocuments(docs);

// log
console.log(`Er zijn ${chunks.length} chunks. De eerste chunk is:`);
console.log(chunks[0]);

// const vectorStore = new MemoryVectorStore(embeddings);
const vectorStore = new FaissStore(embeddings, {});
await vectorStore.addDocuments(chunks)
console.log("vector stroe created")
await vectorStore.save("./vectordb")
// console.log(docs)

const prompt = "wat is het doel van de document"
const relevantDocs = await vectorStore.similaritySearch(prompt);
const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")
console.log(`found ${relevantDocs.length} relevent docs`)
console.log(context)

const response = await model.invoke(`Geef met deze tekst ${context} een antwoord op deze vraag ${prompt}. vat alles samen in een korte zin`)

console.log(response.content)