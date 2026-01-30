// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add fade-in animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections and cards (include AI gallery cards)
document.querySelectorAll('section, .card, .pricing-card, .ai-card, .point').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Hero section should appear immediately
document.querySelector('.hero').style.opacity = '1';
document.querySelector('.hero').style.transform = 'translateY(0)';

// Chat Widget Functionality (main)
const chatBubble = document.getElementById('chat-bubble');
const chatWidget = document.getElementById('chat-widget');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');
const CHAT_URL = 'https://n8n.srv1239769.hstgr.cloud/webhook/ffcf29b6-19e9-40fd-81a6-132910560043/chat';

let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

chatBubble.addEventListener('click', () => {
  chatWidget.classList.add('open');
  chatBubble.style.display = 'none';
  chatInput.focus();
});

closeChat.addEventListener('click', () => {
  chatWidget.classList.remove('open');
  chatBubble.style.display = 'flex';
});

function addMessageTo(container, text, isBot = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = isBot ? 'bot-message' : 'user-message';
  
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${isBot ? 'bot' : 'user'}`;
  bubble.textContent = text;
  
  messageDiv.appendChild(bubble);
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicatorIn(container) {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'bot-message typing-message';
  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  return typingDiv;
}

function removeTypingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  addMessageTo(chatMessages, message, false);
  chatInput.value = '';
  sendButton.disabled = true;

  const typingIndicator = showTypingIndicatorIn(chatMessages);

  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId: sessionId,
        chatInput: message
      })
    });

    const data = await response.json();
    removeTypingIndicator(typingIndicator);
    
    if (data.output) {
      addMessageTo(chatMessages, data.output, true);
    } else {
      addMessageTo(chatMessages, 'מצטער, אירעה שגיאה. נסה שוב.', true);
    }
  } catch (error) {
    console.error('Error:', error);
    removeTypingIndicator(typingIndicator);
    addMessageTo(chatMessages, 'מצטער, אירעה שגיאה בחיבור. נסה שוב.', true);
  } finally {
    sendButton.disabled = false;
    chatInput.focus();
  }
}

sendButton.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// -------------------------
// Support Agent Widget (left-bottom) - duplicated functionality but separate elements & URL
const chatBubbleSupport = document.getElementById('chat-bubble-support');
const chatWidgetSupport = document.getElementById('chat-widget-support');
const closeChatSupport = document.getElementById('close-chat-support');
const chatInputSupport = document.getElementById('chat-input-support');
const sendButtonSupport = document.getElementById('send-message-support');
const chatMessagesSupport = document.getElementById('chat-messages-support');
// new webhook URL provided by you
const SUPPORT_CHAT_URL = 'https://n8n.srv1239769.hstgr.cloud/webhook/543b5127-33dc-4e0f-b658-8643d404506b/chat';

let supportSessionId = 'support_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

chatBubbleSupport.addEventListener('click', () => {
  chatWidgetSupport.classList.add('open');
  chatBubbleSupport.style.display = 'none';
  chatInputSupport.focus();
});

closeChatSupport.addEventListener('click', () => {
  chatWidgetSupport.classList.remove('open');
  chatBubbleSupport.style.display = 'flex';
});

async function sendMessageSupport() {
  const message = chatInputSupport.value.trim();
  if (!message) return;

  addMessageTo(chatMessagesSupport, message, false);
  chatInputSupport.value = '';
  sendButtonSupport.disabled = true;

  const typingIndicator = showTypingIndicatorIn(chatMessagesSupport);

  try {
    const response = await fetch(SUPPORT_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId: supportSessionId,
        chatInput: message
      })
    });

    const data = await response.json();
    removeTypingIndicator(typingIndicator);
    
    if (data.output) {
      addMessageTo(chatMessagesSupport, data.output, true);
    } else {
      addMessageTo(chatMessagesSupport, 'מצטער, אירעה שגיאה. נסה שוב.', true);
    }
  } catch (error) {
    console.error('Support Error:', error);
    removeTypingIndicator(typingIndicator);
    addMessageTo(chatMessagesSupport, 'מצטער, אירעה שגיאה בחיבור. נסה שוב.', true);
  } finally {
    sendButtonSupport.disabled = false;
    chatInputSupport.focus();
  }
}

sendButtonSupport.addEventListener('click', sendMessageSupport);

chatInputSupport.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessageSupport();
  }
});

/* Make first two sample cards open the relevant agent widget when clicked or activated via keyboard */
document.querySelectorAll('.sample-card.clickable-agent').forEach(card => {
  card.addEventListener('click', () => {
    const agent = card.getAttribute('data-agent');
    if (agent === 'support') {
      // open support widget
      chatWidgetSupport.classList.add('open');
      chatBubbleSupport.style.display = 'none';
      // focus input inside support widget
      chatInputSupport.focus();
    } else if (agent === 'sales') {
      // open main sales/chat widget
      chatWidget.classList.add('open');
      chatBubble.style.display = 'none';
      chatInput.focus();
    }
  });

  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});