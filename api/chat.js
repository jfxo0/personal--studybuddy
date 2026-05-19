import { callAgent } from "./agent.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    try {
        const { prompt } = req.body;
        const result = await callAgent(prompt);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Er ging iets mis" });
    }
}