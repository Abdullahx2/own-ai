let apiKey = localStorage.getItem('gemini_api_key') || '';

// Save API key to localStorage
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
    console.log('API Key saved:', key.substring(0, 10) + '...');
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
        
        // Gemini API endpoint
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
            const errorText = await response.text();
            console.error('API Error:', errorText);
            
            // Remove loading
            removeMessage(loadingId);
            
            if (response.status === 400) {
                addMessage('❌ Invalid API request. Please check your API key.', 'ai');
            } else if (response.status === 403) {
                addMessage('❌ API key rejected. Please check if your key is valid.', 'ai');
            } else if (response.status === 429) {
                addMessage('⏳ Too many requests. Please wait a moment.', 'ai');
            } else {
                addMessage('❌ API Error: ' + response.status, 'ai');
            }
            return;
        }
        
        const data = await response.json();
        console.log('Gemini Response:', data);
        
        // Remove loading indicator
        removeMessage(loadingId);
        
        // Check if response is valid
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessage(aiResponse, 'ai');
        } else if (data.error) {
            addMessage('❌ Error: ' + data.error.message, 'ai');
        } else {
            addMessage('🤔 I received an unexpected response format.', 'ai');
        }
        
    } catch (error) {
        console.error('Network Error:', error);
        removeMessage(loadingId);
        addMessage('🌐 Network error. Please check your internet connection.', 'ai');
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
        messageDiv.innerHTML = text; // For typing indicator HTML
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
    
    // Focus on input field
    document.getElementById('userInput').focus();
};
