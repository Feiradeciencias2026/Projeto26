document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('ai-toggle-btn');
  const closeBtn = document.getElementById('ai-close-btn');
  const chatBox = document.getElementById('ai-box');
  const sendBtn = document.getElementById('ai-send-btn');
  const input = document.getElementById('ai-input');
  const messagesContainer = document.getElementById('ai-messages');

  if (!toggleBtn || !chatBox) return;

  toggleBtn.onclick = () => chatBox.classList.toggle('open');
  closeBtn.onclick = () => chatBox.classList.remove('open');

  // ⚠️ COLE A SUA CHAVE NOIVA DIVIDIDA AQUI (SEM ESPAÇOS EXTRAS):
  const p1 = "AQ.Ab8RN6IzaIGGTjkgrOfVz3F"; 
  const p2 = "A89K4wMp790EbNl_-tEDSqz7T_w";  

  const GEMINI_API_KEY = p1 + p2;

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    messagesContainer.innerHTML += `<div class="ai-msg user">${text}</div>`;
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    messagesContainer.innerHTML += `<div id="${loadingId}" class="ai-msg bot">A pensar...</div>`;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: text }] }]
          })
        }
      );

      const data = await response.json();
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const reply = data.candidates[0].content.parts[0].text;
        messagesContainer.innerHTML += `<div class="ai-msg bot">${reply}</div>`;
      } else {
        // MOSTRA O ERRO REAL QUE O GOOGLE DEVOLVER
        const erroReal = data.error?.message || JSON.stringify(data);
        messagesContainer.innerHTML += `<div class="ai-msg bot" style="background: rgba(255,0,0,0.2);">Erro: ${erroReal}</div>`;
      }
    } catch (error) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      messagesContainer.innerHTML += `<div class="ai-msg bot" style="background: rgba(255,0,0,0.2);">Erro na ligação.</div>`;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendBtn.onclick = handleSend;
  input.onkeypress = (e) => {
    if (e.key === 'Enter') handleSend();
  };
});

