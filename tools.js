import { tool } from "langchain";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";


const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});


const quizModel = new AzureChatOpenAI({
    temperature: 0.2
});
const vectorStore = await FaissStore.load("./vectordb", embeddings);
console.log("vectore store loaded")


export const retrieve = tool(
    async ({ query }) => {
        console.log("🔧 now searching the document store")
        const relevantDocs = await vectorStore.similaritySearch(query, 2)
        const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")
        return {
            context,
            source: relevantDocs[0]?.metadata?.source || "onbekend document"
        }
    },
    {
        name: "retrieve",
        description: "Retrieve information related to Hamster Pip.",
        schema: {
            "type": "object",
            "properties": { "query": { "type": "string" } },
            "required": ["query"]
        }
    }
)

export const rollDice = tool(

    ({ sides }) => {
        console.log(`🔧 Ik rol een ${sides}-sided dobbelsteen!`)
        return Math.floor(Math.random() * sides) + 1
    },
    {
        name: "roll_dice",
        description: "roll the dice and give the number that's thrown",
        schema: {
            type: "object",
            properties: {
                sides: { type: "number" },
            },
            required: ["sides"],
        }
    }

);

export const MakeQuiz = tool(
    async ({ query }) => {
        console.log("🔧 making quiz from document store");

        const relevantDocs = await vectorStore.similaritySearch(query, 2);

        const context = relevantDocs
            .map((doc) => doc.pageContent)
            .join("\n\n");

        const response = await quizModel.invoke(`
Je maakt een studiequiz op basis van ALLEEN deze tekst:

${context}

REGELS:
- Zeg nooit dat er een technisch probleem is.
- Geef geen introzin.
- Geef geen afsluitende vraag.
- Gebruik alleen informatie uit de tekst.
- Maak precies 3 meerkeuzevragen.
- Gebruik markdown.
- Geef het antwoord pas als de gebruiker antwoord gegeven heeft
Je MAG NIET afwijken van dit format.
Format exact zo:

 Mini quiz

### Vraag 1
**Vraag:** ...
- A. ...
- B. ...
- C. ...

**Antwoord:** ...

---

### Vraag 2
**Vraag:** ...
- A. ...
- B. ...
- C. ...

**Antwoord:** ...

---

### Vraag 3
**Vraag:** ...
- A. ...
- B. ...
- C. ...

**Antwoord:** ...
`);

        return response.content;
    },
    {
        name: "make_quiz",
        description: "Maakt quizvragen op basis van informatie uit documenten.",
        schema: {
            type: "object",
            properties: {
                query: { type: "string" },
            },
            required: ["query"],
        },
    }
);
