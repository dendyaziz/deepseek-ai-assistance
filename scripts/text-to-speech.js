class TextToSpeech {
    constructor() {
        this.synth = window.speechSynthesis;
        this.indicator = document.getElementById("indicator");
        this.caption = document.getElementById("caption");
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.source = null;
        this.animationFrame = null;
    }

    async speak(text, lang = "id-ID") {
        if (!this.synth) {
            console.error("Text-to-Speech is not supported in this browser.");
            return;
        }

        if (this.synth.speaking) {
            console.warn("Already speaking...");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.5;
        utterance.pitch = 1;
        utterance.volume = 1;

        try {
            await this.startMicrophone(); // Start microphone audio analysis
        } catch (error) {
            console.warn("Microphone access denied:", error);
        }

        return new Promise((resolve, reject) => {
            utterance.onend = () => {
                setTimeout(() => {
                    this.stopMicrophone(); // Stop microphone when speech ends
                    this.caption.innerText = ''
                    resolve()
                }, 500)
            };
            utterance.onerror = (event) => {
                this.stopMicrophone();
                console.error("Speech error:", event.error);
                reject(event.error);
            };

            this.synth.speak(utterance);

            this.caption.innerText = `"${text}"`
        });
    }

    stop() {
        if (this.synth.speaking) {
            this.synth.cancel();
            this.stopMicrophone();
            console.log("Speech stopped.");
        }
    }

    async startMicrophone() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Microphone not supported.");
        }

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.microphone = stream;
        this.source = this.audioContext.createMediaStreamSource(stream);

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 512; // Frequency resolution
        this.source.connect(this.analyser);

        this.animateIndicator();
    }

    stopMicrophone() {
        if (this.microphone) {
            this.microphone.getTracks().forEach(track => track.stop());
            this.microphone = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.resetIndicator();
    }

    animateIndicator() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const animate = () => {
            if (!this.microphone) {
                this.resetIndicator();
                return;
            }

            this.analyser.getByteFrequencyData(dataArray);
            const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            const scale = 1 + volume / 200; // Scale based on volume
            const opacity = 0.5 + (volume / 150); // Opacity based on volume

            this.indicator.style.transform = `scale(${scale})`;
            this.indicator.style.opacity = opacity;

            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    resetIndicator() {
        this.indicator.style.transform = "scale(1)";
        this.indicator.style.opacity = "0.5";
    }
}
