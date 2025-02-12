class SpeechToText {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.transcription = document.getElementById("transcription");
        this.onfinish = null; // Callback when user finishes talking
        this.transcript = "";
        this.init();
    }

    init() {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Your browser does not support Speech Recognition.");
            return;
        }

        this.recognition = new webkitSpeechRecognition(); // For Chrome
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'id-ID'; // Set your preferred language

        this.recognition.onstart = () => {
            this.transcription.innerText = '';
            this.isListening = true;
            this.transcript = "";
        };

        this.recognition.onresult = (event) => {
            this.transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                this.transcript += event.results[i][0].transcript;
            }

            this.transcription.innerText = `"${this.transcript}"`; // Display text
            this.transcription.style.opacity = '0.5';

            if (event.results[event.results.length - 1].isFinal) {
                this.onfinish(this.transcript);
                this.transcription.innerText = `"${this.transcript}"`; // Display text
                this.transcription.style.opacity = '1';
            }
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        this.recognition.onend = (event) => {
            if (!this.isListening) {
                return
            }

            this.isListening = false;
            this.recognition.start()
        };
    }

    start() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.isListening = false
            this.recognition.stop();
        }
    }
}
