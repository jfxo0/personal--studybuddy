import { micromark } from "https://esm.sh/micromark@3?bundle";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.0.6/+esm";


const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const button = document.getElementById("sendButton");

function addMessage(text, sender = "bot") {
    const wrapper = document.createElement("div");

    wrapper.className =
        sender === "user" ? "chat chat-end" : "chat chat-start";

    let content;

    if (sender === "bot") {
        // markdown → html → sanitize
        const html = micromark(String(text));
        content = DOMPurify.sanitize(html);
    } else {
        // user plain text
        content = text;
    }

    wrapper.innerHTML = `
 <div class="chat-bubble max-w-2xl leading-relaxed bg-amber-700">
      ${content}
    </div>
`;

    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
}

const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");

uploadButton.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    addMessage("📄 " + data.message, "bot");
});
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prompt = input.value.trim();
    if (!prompt) return;

    addMessage(prompt, "user");
    input.value = "";

    button.disabled = true;

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        const data = await res.json();

        addMessage(data.message, "bot");
        if (data.source) {
            addMessage(" Bron: " + data.source, "bot");
        }
        if (data.toolsUsed && data.toolsUsed.length > 0) {
            addMessage(
                " Tools: " + data.toolsUsed.join(", "),
                "bot"
            );
        }
        console.log("DATA:", data);

    } catch (err) {
        addMessage("Er ging iets mis met de server", "bot");
    }

    button.disabled = false;
});