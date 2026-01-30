/* Smooth scrolling for anchor links */
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

/* Add fade-in animation on scroll */
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

/* Observe all sections and cards (include AI gallery cards) */
document.querySelectorAll('section, .card, .pricing-card, .ai-card, .point').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

/* Hero section should appear immediately */
const heroEl = document.querySelector('.hero');
if (heroEl) {
  heroEl.style.opacity = '1';
  heroEl.style.transform = 'translateY(0)';
}

/* -------------------------
   Chat Widget Functionality (main)
   ------------------------- */
const chatBubble = document.getElementById('chat-bubble');
const chatWidget = document.getElementById('chat-widget');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');
const CHAT_URL = 'https://n8n.srv1239769.hstgr.cloud/webhook/ffcf29b6-19e9-40fd-81a6-132910560043/chat?agent=smartesek_sales';

let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

/* Open/close behavior */
if (chatBubble && chatWidget) {
  chatBubble.addEventListener('click', () => {
    chatWidget.classList.add('open');
    chatBubble.style.display = 'none';
    chatInput.focus();
  });
}

// Unified close function to ensure all agent windows close and their bubbles re-appear
function closeAllChats() {
  // Main sales widget
  if (chatWidget) {
    chatWidget.classList.remove('open');
  }
  if (chatBubble) {
    chatBubble.style.display = 'flex';
  }

  // Support widget
  if (chatWidgetSupport) {
    chatWidgetSupport.classList.remove('open');
  }
  if (chatBubbleSupport) {
    chatBubbleSupport.style.display = 'flex';
  }

  // Tesla widget
  const teslaWidget = document.getElementById('chat-widget-tesla');
  const teslaBubble = document.getElementById('chat-bubble-tesla');
  if (teslaWidget) {
    teslaWidget.classList.remove('open');
  }
  if (teslaBubble) {
    teslaBubble.style.display = 'flex';
  }
}

/* Delegated close handler: closes only the specific widget whose X was clicked and restores its bubble */
document.addEventListener('click', (e) => {
  const btn = e.target.closest && e.target.closest('.close-chat');
  if (!btn) return;

  e.stopPropagation();

  // find the widget container (closest .chat-widget)
  const widget = btn.closest('.chat-widget');
  if (!widget) return;

  // hide the widget
  widget.classList.remove('open');

  // determine which bubble to restore by widget id
  const id = widget.id || '';

  if (id === 'chat-widget') {
    const bubble = document.getElementById('chat-bubble');
    if (bubble) bubble.style.display = 'flex';
  } else if (id === 'chat-widget-support') {
    const bubble = document.getElementById('chat-bubble-support');
    if (bubble) bubble.style.display = 'flex';
  } else if (id === 'chat-widget-tesla') {
    const bubble = document.getElementById('chat-bubble-tesla');
    if (bubble) bubble.style.display = 'flex';
  } else {
    // fallback: try to find a bubble with matching suffix
    const possible = document.querySelectorAll('.chat-bubble');
    possible.forEach(b => {
      // ignore bubbles still hidden for other open widgets
      if (b.style.display === 'none') {
        // restore any bubble that corresponds to a closed widget by proximity (best-effort)
        b.style.display = 'flex';
      }
    });
  }
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

/* Send message to webhook */
async function sendMessage() {
  if (!chatInput) return;
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

if (sendButton) {
  sendButton.addEventListener('click', sendMessage);
}
if (chatInput) {
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

/* -------------------------
   Support Agent Widget (left-bottom)
   ------------------------- */
const chatBubbleSupport = document.getElementById('chat-bubble-support');
const chatWidgetSupport = document.getElementById('chat-widget-support');
const closeChatSupport = document.getElementById('close-chat-support');
const chatInputSupport = document.getElementById('chat-input-support');
const sendButtonSupport = document.getElementById('send-message-support');
const chatMessagesSupport = document.getElementById('chat-messages-support');
// new webhook URL provided by you
const SUPPORT_CHAT_URL = 'https://n8n.srv1239769.hstgr.cloud/webhook/543b5127-33dc-4e0f-b658-8643d404506b/chat?agent=Solax_support';

let supportSessionId = 'support_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

if (chatBubbleSupport && chatWidgetSupport) {
  chatBubbleSupport.addEventListener('click', () => {
    chatWidgetSupport.classList.add('open');
    chatBubbleSupport.style.display = 'none';
    chatInputSupport.focus();
  });
}
/* (removed per delegated handler) */

async function sendMessageSupport() {
  if (!chatInputSupport) return;
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

if (sendButtonSupport) {
  sendButtonSupport.addEventListener('click', sendMessageSupport);
}
if (chatInputSupport) {
  chatInputSupport.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessageSupport();
    }
  });
}

/* Make first two sample cards open the relevant agent widget when clicked or activated via keyboard
   Now extended to support a Tesla sales agent when a card has data-agent="tesla" */
document.querySelectorAll('.sample-card.clickable-agent').forEach(card => {
  card.addEventListener('click', () => {
    const agent = card.getAttribute('data-agent');
    if (agent === 'support') {
      chatWidgetSupport.classList.add('open');
      chatBubbleSupport.style.display = 'none';
      chatInputSupport.focus();
    } else if (agent === 'sales') {
      chatWidget.classList.add('open');
      chatBubble.style.display = 'none';
      chatInput.focus();
    } else if (agent === 'tesla') {
      // open tesla widget (center)
      const teslaWidget = document.getElementById('chat-widget-tesla');
      const teslaBubble = document.getElementById('chat-bubble-tesla');
      if (teslaWidget && teslaBubble) {
        teslaWidget.classList.add('open');
        teslaBubble.style.display = 'none';
        const inputEl = document.getElementById('chat-input-tesla');
        if (inputEl) inputEl.focus();
      }
    }
  });

  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

/* -------------------------
   Tesla Agent (center) wiring
   ------------------------- */
const chatBubbleTesla = document.getElementById('chat-bubble-tesla');
const chatWidgetTesla = document.getElementById('chat-widget-tesla');
const closeChatTesla = document.getElementById('close-chat-tesla');
const chatInputTesla = document.getElementById('chat-input-tesla');
const sendButtonTesla = document.getElementById('send-message-tesla');
const chatMessagesTesla = document.getElementById('chat-messages-tesla');
// placeholder webhook URL for Tesla agent - you can replace this later with the real URL
const TESLA_CHAT_URL = ''; // <-- put your URL here

let teslaSessionId = 'tesla_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

if (chatBubbleTesla && chatWidgetTesla) {
  chatBubbleTesla.addEventListener('click', () => {
    chatWidgetTesla.classList.add('open');
    chatBubbleTesla.style.display = 'none';
    chatInputTesla.focus();
  });
}
/* (removed per delegated handler) */

async function sendMessageTesla() {
  if (!chatInputTesla) return;
  const message = chatInputTesla.value.trim();
  if (!message) return;

  addMessageTo(chatMessagesTesla, message, false);
  chatInputTesla.value = '';
  sendButtonTesla.disabled = true;

  const typingIndicator = showTypingIndicatorIn(chatMessagesTesla);

  try {
    // if TESLA_CHAT_URL left empty, respond locally with a friendly confirmation
    if (!TESLA_CHAT_URL) {
      await new Promise(r => setTimeout(r, 700));
      removeTypingIndicator(typingIndicator);
      addMessageTo(chatMessagesTesla, 'תודה! אנחנו נחזור אליך בקרוב עם פרטים נוספים על דגמי טסלה וזמן נסיעת מבחן.', true);
    } else {
      const response = await fetch(TESLA_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: teslaSessionId,
          chatInput: message
        })
      });

      const data = await response.json();
      removeTypingIndicator(typingIndicator);
      
      if (data.output) {
        addMessageTo(chatMessagesTesla, data.output, true);
      } else {
        addMessageTo(chatMessagesTesla, 'מצטער, אירעה שגיאה. נסה שוב.', true);
      }
    }
  } catch (error) {
    console.error('Tesla Error:', error);
    removeTypingIndicator(typingIndicator);
    addMessageTo(chatMessagesTesla, 'מצטער, אירעה שגיאה בחיבור. נסה שוב.', true);
  } finally {
    sendButtonTesla.disabled = false;
    chatInputTesla.focus();
  }
}

if (sendButtonTesla) {
  sendButtonTesla.addEventListener('click', sendMessageTesla);
}
if (chatInputTesla) {
  chatInputTesla.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessageTesla();
    }
  });
}

/* -------------------------
   Draggable windows: allow users to reposition chat widgets by dragging the header
   Works with pointer events (mouse/touch/stylus)
   ------------------------- */
function makeDraggable(windowEl, handleEl) {
  if (!windowEl || !handleEl) return;

  // ensure the window uses left/top coordinates when dragging
  windowEl.style.right = 'auto';
  windowEl.style.left = windowEl.getBoundingClientRect().left + 'px';
  windowEl.style.top = windowEl.getBoundingClientRect().top + 'px';
  windowEl.style.bottom = 'auto';
  windowEl.style.position = 'fixed';

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;

  handleEl.style.touchAction = 'none'; // prevent default touch scroll while dragging
  // show grab cursor so user knows the header is draggable
  handleEl.style.cursor = 'grab';

  function onPointerDown(e) {
    // only start drag on primary button / touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    handleEl.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    const rect = windowEl.getBoundingClientRect();
    origLeft = rect.left;
    origTop = rect.top;
    windowEl.style.transition = 'none';
    // switch to grabbing cursor while dragging
    handleEl.style.cursor = 'grabbing';
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = origLeft + dx;
    let newTop = origTop + dy;

    // clamp to viewport so window doesn't go fully off-screen
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const winRect = windowEl.getBoundingClientRect();
    const w = winRect.width;
    const h = winRect.height;

    newLeft = Math.min(Math.max(8, newLeft), vw - w - 8);
    newTop = Math.min(Math.max(8, newTop), vh - h - 8);

    windowEl.style.left = newLeft + 'px';
    windowEl.style.top = newTop + 'px';
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    try { handleEl.releasePointerCapture(e.pointerId); } catch (err) {}
    // restore a small transition
    windowEl.style.transition = 'left 0.12s ease, top 0.12s ease';
    // restore cursor to grab after drag ends
    handleEl.style.cursor = 'grab';
  }

  handleEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}

/* Attach draggable to both widgets using their header as handle */
document.addEventListener('DOMContentLoaded', () => {
  const headerMain = document.querySelector('#chat-widget .chat-header');
  const headerSupport = document.querySelector('#chat-widget-support .chat-header');
  const headerTesla = document.querySelector('#chat-widget-tesla .chat-header');

  // Dragging disabled: removed makeDraggable(...) calls to prevent widgets from being moved

  // Explicit close button handlers to avoid issues when pointer capture/drag might block clicks.
  // Each handler closes only its widget and restores its bubble.
  const closeMainBtn = document.getElementById('close-chat');
  if (closeMainBtn) {
    closeMainBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const widget = document.getElementById('chat-widget');
      if (widget) widget.classList.remove('open');
      const bubble = document.getElementById('chat-bubble');
      if (bubble) bubble.style.display = 'flex';
    });
  }

  const closeSupportBtn = document.getElementById('close-chat-support');
  if (closeSupportBtn) {
    closeSupportBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const widget = document.getElementById('chat-widget-support');
      if (widget) widget.classList.remove('open');
      const bubble = document.getElementById('chat-bubble-support');
      if (bubble) bubble.style.display = 'flex';
    });
  }

  const closeTeslaBtn = document.getElementById('close-chat-tesla');
  if (closeTeslaBtn) {
    closeTeslaBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const widget = document.getElementById('chat-widget-tesla');
      if (widget) widget.classList.remove('open');
      const bubble = document.getElementById('chat-bubble-tesla');
      if (bubble) bubble.style.display = 'flex';
    });
  }
});