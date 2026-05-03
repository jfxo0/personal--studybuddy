
import express, { response } from "express"
import { ask } from "./load.js"
import { callAgent } from "./agent.js"

const app = express()
app.use(express.json())
app.use(express.static("public"))

app.post('/api/test', async (req, res) => {
    const result = ask("wat was het doel van de applicatie");
    res.json({ result: result });
})

app.post('/api/chat', async (req, res) => {

    const { prompt } = req.body
    const response = await callAgent(prompt)
    res.json(response);
})

app.listen(3002, () => console.log("server start on 3000"))