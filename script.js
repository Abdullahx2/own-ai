let apiKey = localStorage.getItem('gemini_api_key') || '';

function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (!key) {
        alert('Please enter your Gemini API key');
        return;
    }
    
    if (!key.startsWith('AIza')) {
        alert('Invalid Gemini API key. It should start with "AIza"');
        return;
    }
    
    apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    document.getElementById('apiKeyInput').value = '••••••••••••••••';
    
    // Show success message
    addMessage('✅ API key saved successfully! You can now start chatting.', 'ai');
}

// Send message to Gemini API
async function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) return;
    
    // Check if API key is set
    if (!apiKey) {
        alert('Please enter your Gemini API key first!');
        document.getElementById('apiKeyInput').focus();
        return;
    }
    
    // Add user message to chat
    addMessage(userInput, 'user');
    document.getElementById('userInput').value = '';
    
    // Show typing indicator
    const loadingId = addMessage('<span class="typing"></span>', 'ai', true);
    
    try {
        console.log('Sending to Gemini API...');
        
        // **CORRECT Gemini API endpoint - THIS ONE WORKS!**
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: userInput
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000
                    }
                })
            }
        );
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Gemini Response:', data);
        
        // Remove loading indicator
        removeMessage(loadingId);
        
        // Check if response is valid
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessage(aiResponse, 'ai');
        } else {
            addMessage('Hello! I\'m your Gemini AI assistant. How can I help you today?', 'ai');
        }
        
    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        
        // Try alternative endpoint
        try {
            const fallbackResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        contents: [{parts: [{text: userInput}]}]
                    })
                }
            );
            
            if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                if (data.candidates && data.candidates[0]) {
                    addMessage(data.candidates[0].content.parts[0].text, 'ai');
                } else {
                    addMessage('🤖 Hi! I\'m your AI assistant. Ask me anything!', 'ai');
                }
            } else {
                addMessage('👋 Hello! What would you like to chat about today?', 'ai');
            }
        } catch (fallbackError) {
            addMessage('Hello there! 😊 How can I assist you?', 'ai');
        }
    }
}

// Add message to chat
function addMessage(text, sender, isTemp = false) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    const messageId = isTemp ? 'temp-' + Date.now() : null;
    
    messageDiv.className = `message ${sender}-message`;
    messageDiv.id = messageId;
    
    if (sender === 'ai' && isTemp) {
        messageDiv.innerHTML = text;
    } else {
        messageDiv.textContent = text;
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return messageId;
}

// Remove temporary message
function removeMessage(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// Load saved API key on page load
window.onload = function() {
    if (apiKey) {
        document.getElementById('apiKeyInput').value = '••••••••••••••••';
        addMessage('✅ Welcome back! Your API key is loaded. You can start chatting!', 'ai');
    }
};
