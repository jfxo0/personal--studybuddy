import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

const model = new AzureChatOpenAI({
    temperature: 0.2
})

// const vectorStore = new MemoryVectorStore(embeddings);
const vectorStore = await FaissStore.load("./vectordb", embeddings);
console.log("vectore store loaded")


console.log("searching..")

export async function ask(prompt) {
    // const prompt = "hoe werkt de applicatie"
    const relevantDocs = await vectorStore.similaritySearch(prompt)
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")
    console.log(`found ${relevantDocs.length} releveant documenys`)

    console.log("sending to chatgpt 4.1")
    const response = await model.invoke(`je krijgt de volgende vraag: ${prompt}, beantwoord deze vraag uit ${context}`)
    return { answer: response.content, source: context }
}




let answer = await ask("wie was de doelgroep")
console.log(answer)

let anotheranswer = await ask("zie je nog verbeter punten in het hele document")
console.log(anotheranswer)

let thirdanswer = await ask("kan je het zo kort mogelijk in 1 zin samenvatten")
console.log(thirdanswer)