async function loadFinalPost(token) {
    const previewArea = document.getElementById('previewArea');
    
    try {
        const response = await fetch(`https://www.smartesek.com/webhook/?token=${token}`);
        const data = await response.json();

        if (data.html) {
            // הנתונים כבר שם! מציגים מיד
            receiveWebhook({ token, payload: { html: data.html }, receivedAt: new Date().toISOString() });
        } else {
            previewArea.innerHTML = '<div style="color:#a22">הפוסט עדיין לא מוכן או שה-Token פג תוקף.</div>';
        }
    } catch (e) {
        console.error("שגיאה במשיכת הפוסט", e);
    }
}
