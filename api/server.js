
import express, { response } from "express"
import { ask } from "./load.js"
import { callAgent } from "./agent.js"
import multer from "multer";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";


const app = express()
app.use(express.json())
app.use(express.static("public"))


const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("document"), async (req, res) => {
    try {
        const loader = new PDFLoader(req.file.path);
        const docs = await loader.load();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const chunks = await splitter.splitDocuments(docs);

        const embeddings = new AzureOpenAIEmbeddings({
            azureOpenAIApiEmbeddingsDeploymentName:
            process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME,
        });

        const vectorStore = new FaissStore(embeddings, {});
        await vectorStore.addDocuments(chunks);
        await vectorStore.save("./vectordb");

        res.json({
            message: `${req.file.originalname} is geüpload en verwerkt.`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Upload verwerken mislukt" });
    }
});

app.post('/api/test', async (req, res) => {
    const result = ask("wat was het doel van de applicatie");
    res.json({ result: result });
})

app.post('/api/chat', async (req, res) => {

    const { prompt } = req.body
    const response = await callAgent(prompt)
    res.json(response);
})

app.listen(3003, () => console.log("server start on 3000"))