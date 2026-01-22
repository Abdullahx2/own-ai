let apiKey = localStorage.getItem('deepseek_api_key') || '';

function saveApiKey() {
    const key = document.getElementById('apiKey').value.trim();
    if (key) {
        apiKey = key;
        localStorage.setItem('deepseek_api_key', key);
        alert('API key saved locally!');
    } else {
        alert('Please enter an API key');
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) return;

    if (!apiKey) {
        alert('Please enter your DeepSeek API key first!');
        return;
    }

    // Add user message to chat
    addMessage(userInput, 'user');
    document.getElementById('userInput').value = '';

    // Show loading indicator
    const loadingId = addMessage('Thinking...', 'ai', true);

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: userInput
                    }
                ],
                stream: false
            })
        });

        const data = await response.json();
        
        // Remove loading message
        removeMessage(loadingId);
        
        if (data.choices && data.choices[0]) {
            addMessage(data.choices[0].message.content, 'ai');
        } else {
            addMessage('Sorry, I could not process your request.', 'ai');
        }
    } catch (error) {
        removeMessage(loadingId);
        addMessage('Error: ' + error.message, 'ai');
    }
}

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

// Load saved API key on page load
window.onload = function() {
    if (apiKey) {
        document.getElementById('apiKey').value = '••••••••••••••••';
    }
};