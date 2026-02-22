/*
  ai_marketing.js
  - Generates a unique token + placeholder webhook URL and exposes a small in-page "receiver" simulation.
  - NOTE: This page cannot actually create a public webhook endpoint on your server. Use the shown URL pattern
    (or replace host) when configuring your n8n HTTP Request node to POST back the created HTML.
*/

(function () {
  // Generate a short unique token (display-only). In production replace hostname with your real public endpoint.
  function makeToken() {
    const s = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9);
    return s;
  }

  const webhookBox = document.getElementById('webhookBox');
  const testCurl = document.getElementById('testCurl');
  const previewArea = document.getElementById('previewArea');
  const requestLog = document.getElementById('requestLog');
  const regenBtn = document.getElementById('regenBtn');
  const simulateBtn = document.getElementById('simulateSend');
  const clearPreview = document.getElementById('clearPreview');
  const showLastRequest = document.getElementById('showLastRequest');

  // Create initial token
  let token = makeToken();

  // Use a clear, explicit placeholder base URL to avoid using the local origin.
  // For demo/testing we default to your site domain so the webhook endpoint becomes:
  //   https://www.smartesek.com/webhook/ai-posts
  // Replace this value if you host the webhook on a different domain.
  const PUBLIC_WEBHOOK_BASE = 'https://www.smartesek.com'; // set to your site domain

  function buildWebhookUrl() {
    // Return a fixed webhook path (no per-request token) using the PUBLIC_WEBHOOK_BASE.
    // The endpoint to POST to should be: {PUBLIC_WEBHOOK_BASE}/webhook/ai-posts
    return `${PUBLIC_WEBHOOK_BASE.replace(/\/+$/, '')}/webhook/ai-posts`;
  }

  function updateUI() {
    const url = buildWebhookUrl();
    webhookBox.innerHTML = `<div>POST URL: <span class="token">${url}</span></div>
      <div style="margin-top:8px;color:#475569;font-size:0.95rem;">צורת POST מקובלת: Content-Type: application/json עם שדה "html" שמכיל את תוכן ה-payload (או שליחה כ-raw HTML).<br><small style="color:#6b7280">השתמשו בכתובת זו ב-n8n (או החליפו PUBLIC_WEBHOOK_BASE בקובץ ai_marketing.js אם יש לכם host שונה).</small></div>`;
    testCurl.textContent = `curl -X POST ${url} -H "Content-Type: application/json" -d '{"html":"<div><h3>כותרת פוסט דוגמה</h3><p>תוכן הפוסט שנוצר ע\"י ה-AI</p></div>"}'`;
  }

  updateUI();

  regenBtn.addEventListener('click', () => {
    token = makeToken();
    updateUI();
    previewArea.innerHTML = `<div style="color:#475569">נוצר token חדש — שלח POST לכתובת החדשה.</div>`;
    requestLog.textContent = 'נקה לוג'; 
  });

  clearPreview.addEventListener('click', () => {
    previewArea.innerHTML = '<div style="color:#64748b">תצוגה נוקתה.</div>';
  });

  // simulate sending a POST to the webhook (only in page, not server). This helps preview the result.
  simulateBtn.addEventListener('click', async () => {
    const sampleHTML = `<article style="font-family:inherit; padding:14px; border-radius:10px; border:1px solid #e6eef8;">
      <header style="display:flex; gap:12px; align-items:center;">
        <img src="/automation.png" alt="post image" style="width:86px;height:86px;border-radius:8px;object-fit:cover;flex:0 0 86px;">
        <div>
          <strong style="font-size:1.06rem;">פוסט שנוצר ע״י מכונת השיווק AI</strong>
          <div style="color:#475569;margin-top:6px;">תיאור קצר שמושך תשומת לב ונועד להניע לפעולה — פניה ל-CTA</div>
        </div>
      </header>
      <div style="margin-top:12px; color:#0b1220;">הטקסט של הפוסט: כאן יופיע התוכן שנוצר על ידי ה-AI, כולל האשטאגים ובחירת תמונה מומלצת.</div>
      <footer style="margin-top:12px; display:flex; gap:8px; color:#64748b;">
        <div>פורסם ב- Facebook · Twitter · LinkedIn</div>
      </footer>
    </article>`;

    // simulate network delay like "several minutes" but here we just wait a short time
    previewArea.innerHTML = '<div style="color:#64748b">ממתין לייצור הפוסט...</div>';
    await new Promise(r => setTimeout(r, 900)); // quick simulated delay

    // "Receive" the POST payload (simulate)
    receiveWebhook({ token, payload: { html: sampleHTML }, receivedAt: new Date().toISOString() });
  });

  // show last request summary
  showLastRequest.addEventListener('click', () => {
    requestLog.scrollTop = 0;
  });

  // In-page receiver: pretend this function receives the POST from n8n and displays the HTML
  // In a real setup you would create a server route POST /webhook/ai-posts/:token to accept the request,
  // then forward the HTML to this page (e.g., via websockets) or store it and let the page poll.
  function receiveWebhook(data) {
    // Simple demo receiver: display any incoming payload.html regardless of token.
    // In a real server implementation you'd verify sender identity and store/forward the HTML.
    if (!data || !data.payload) return;

    const receivedAt = data.receivedAt || new Date().toISOString();
    previewArea.innerHTML = data.payload.html || '<div style="color:#a22">התקבל POST אך לא נמצא שדה html ב-payload.</div>';
    requestLog.textContent = `קיבלנו POST ל-webhook (demo)\nזמן: ${receivedAt}\n---\nPayload preview:\n${truncate(data.payload.html || '', 1000)}`;
  }

  // Helper: truncate string for logs
  function truncate(s, n) {
    if (!s) return '';
    return (s.length > n) ? s.slice(0,n) + '... (truncated)' : s;
  }

  // Expose receiveWebhook and a helper to get the current webhook URL to window so you can manually call from console for testing:
  window.__aiMarketing = {
    receiveWebhook,
    getWebhookUrl: () => buildWebhookUrl(token),
    // expose the base so you can see/change it from console during testing:
    PUBLIC_WEBHOOK_BASE: () => PUBLIC_WEBHOOK_BASE
  };

  // Initialize a friendly note that explains real webhook behavior to the user
  requestLog.textContent = 'בדיקה מקומית: השתמש בכפתור "שלח POST דמה" כדי לראות תצוגה; עבור יישום אמיתי הגדר ב-n8n HTTP Request או Webhook target לכתובת המוצגת משמאל שישלח JSON עם השדה html. זכרו לעדכן PUBLIC_WEBHOOK_BASE בקובץ ai_marketing.js לכתובת השרת שלכם.';
})();