let useLocalAI = true; // Switch between local and online AI

function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) return;

    // Add user message
    addMessage(userInput, 'user');
    document.getElementById('userInput').value = '';

    // Show loading
    const loadingId = addMessage('Thinking...', 'ai', true);

    if (useLocalAI) {
        // Use LOCAL AI (instant, always works)
        setTimeout(() => {
            removeMessage(loadingId);
            const response = generateLocalResponse(userInput);
            addMessage(response, 'ai');
        }, 500);
    } else {
        // Try online AI
        tryOnlineAI(userInput, loadingId);
    }
}

// LOCAL AI - Always works, no internet needed!
function generateLocalResponse(input) {
    const responses = [
        `I understand you said: "${input}". That's interesting!`,
        `Thanks for asking! "${input}" is a great topic.`,
        `I'm your AI assistant. You asked: "${input}" - let me think about that.`,
        `Great question! "${input}" - I'd love to help you with that.`,
        `I heard you say: "${input}". Can you tell me more?`,
        `Interesting point about "${input}". What else would you like to know?`,
        `You mentioned "${input}". That reminds me of something important!`,
        `Regarding "${input}", I think this is worth discussing further.`,
        `"${input}" - that's a thoughtful question. Let's explore it!`,
        `I appreciate you sharing: "${input}". Tell me more!`
    ];
    
    // Smart responses for common questions
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return "Hello there! 👋 How can I help you today?";
    }
    if (lowerInput.includes('how are you')) {
        return "I'm doing great, thanks for asking! How about you?";
    }
    if (lowerInput.includes('name')) {
        return "I'm your friendly AI assistant! What's your name?";
    }
    if (lowerInput.includes('weather')) {
        return "I can't check real weather, but I hope it's nice where you are! ☀️";
    }
    if (lowerInput.includes('thank')) {
        return "You're welcome! 😊 Is there anything else I can help with?";
    }
    if (lowerInput.includes('bye') || lowerInput.includes('goodbye')) {
        return "Goodbye! Have a wonderful day! 👋";
    }
    if (lowerInput.includes('joke')) {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "What do you call a fake noodle? An impasta!",
            "Why did the bicycle fall over? Because it was two-tired!",
            "What do you call cheese that isn't yours? Nacho cheese!"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Return random response
    return responses[Math.floor(Math.random() * responses.length)];
}

// ONLINE AI - Try free APIs
async function tryOnlineAI(input, loadingId) {
    const freeApis = [
        {
            name: 'HuggingFace GPT-2',
            url: 'https://api-inference.huggingface.co/models/gpt2',
            body: JSON.stringify({ inputs: input }),
            transform: (data) => data[0]?.generated_text || "I'm thinking..."
        },
        {
            name: 'Text Generation',
            url: 'https://text-generator-ai.p.rapidapi.com/text',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': 'free-tier-key',
                'X-RapidAPI-Host': 'text-generator-ai.p.rapidapi.com'
            },
            body: JSON.stringify({ text: input }),
            transform: (data) => data.result || "Hello!"
        }
    ];

    for (const api of freeApis) {
        try {
            console.log(`Trying ${api.name}...`);
            const response = await fetch(api.url, {
                method: 'POST',
                headers: api.headers || { 'Content-Type': 'application/json' },
                body: api.body
            });
            
            if (response.ok) {
                const data = await response.json();
                removeMessage(loadingId);
                addMessage(api.transform(data), 'ai');
                return;
            }
        } catch (error) {
            console.log(`${api.name} failed, trying next...`);
        }
    }
    
    // If all online APIs fail, use local AI
    removeMessage(loadingId);
    addMessage(generateLocalResponse(input), 'ai');
}

// UI Functions (keep these same)
function addMessage(text, sender, isTemp = false) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    const messageId = isTemp ? 'temp-' + Date.now() : null;
    
    messageDiv.className = `message ${sender}-message`;
    messageDiv.id = messageId;
    messageDiv.textContent = text;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return messageId;
}

function removeMessage(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function toggleAI() {
    useLocalAI = !useLocalAI;
    const button = document.getElementById('toggleAI');
    if (useLocalAI) {
        button.textContent = "🔒 Local AI (Using)";
        button.style.background = '#10b981';
    } else {
        button.textContent = "🌐 Online AI (Try)";
        button.style.background = '#3b82f6';
    }
}

// Add this to your index.html button section:
/*
<button id="toggleAI" onclick="toggleAI()" style="margin-left:10px;background:#10b981;">
    🔒 Local AI (Using)
</button>
*/
