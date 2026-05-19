import { AzureChatOpenAI } from "@langchain/openai"
import { createAgent, tool } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import * as z from "zod";
import { retrieve, rollDice } from "./tools.js";


const checkpointer = new MemorySaver();
const model = new AzureChatOpenAI({ temperature: 0.2 });

const myToolResponse = z.object({
    message: z.string().describe("The message to the user"),
    toolsUsed: z.array(z.string()).describe("List with names of tools used in the response, without the word function"),
    source: z.string().optional()

});

const agent = createAgent({
    model,
    tools: [retrieve],
    responseFormat: myToolResponse,
    checkpointer,
    systemPrompt: `Je bent StudyBuddy.

Gedrag:
- Beantwoord vragen met de retrieve tool en gebruik de make_quiz tool om gelijk daarna een quiz te maken over de informatie van de retrieve tool
- vertel altijd de bron waar je de informatie vandaan gehaald heb (bestandsnaam & pagina)
- Geef nette markdown output
- Geef altijd de bron van het document (bestandsnaam) en de pagina waar je het kan vinden
`})

export async function callAgent(prompt) {


    let result = await agent.invoke(
        { messages: [{ role: "user", content: prompt }] },
        { configurable: { thread_id: "1" } }
    )

    const finalMessage = result.structuredResponse;

    return {
        message: finalMessage.message,
        toolsUsed: finalMessage.toolsUsed,
        source: result.messages?.at(-1)?.tool_calls?.[0]?.output?.source
    };

}
