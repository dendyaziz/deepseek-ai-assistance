class DeepSeek {
    constructor() {
        this.apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        this.apiKey = '<PUT_YOUR_API_KEY_HERE>';
        this.model = "deepseek-r1-distill-llama-70b";

        this.chatHistory = [
            { role: "system", content: 'Jawab dalam bahasa indonesia 1 kalimat singkat maksimum 20 kata.' }
        ];
        this.timer = document.getElementById("timer");
    }

    async ask(question) {
        // Append user's question to the chat history
        this.chatHistory.push({ role: "user", content: question });

        const payload = {
            model: this.model,
            reasoning_format: 'parsed',
            messages: this.chatHistory, // Send full chat history
        };

        try {
            this.timer.innerText = ''
            const startedAt = new Date()

            const timerInterval = setInterval(() => {
                this.timer.innerText = `API: ${(new Date() - startedAt).toLocaleString('id-ID')}ms`
            }, 10)

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                clearInterval(timerInterval)
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.choices[0].message.content;

            clearInterval(timerInterval)

            // Append system's response to chat history
            this.chatHistory.push({ role: "assistant", content: reply });

            return reply;
        } catch (error) {
            console.error("DeepSeek API Error:", error);
            return "An error occurred while fetching the response.";
        }
    }
}
