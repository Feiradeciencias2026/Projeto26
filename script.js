document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('ai-toggle-btn');
  const closeBtn = document.getElementById('ai-close-btn');
  const chatBox = document.getElementById('ai-box');
  const sendBtn = document.getElementById('ai-send-btn');
  const input = document.getElementById('ai-input');
  const messagesContainer = document.getElementById('ai-messages');

  // Proteção: se a estrutura do chat não existir no HTML, o código para aqui sem travar o site
  if (!toggleBtn || !chatBox || !sendBtn || !input || !messagesContainer) {
    return;
  }

  // Abrir e fechar a janela do chat
  toggleBtn.onclick = () => chatBox.classList.toggle('open');
  if (closeBtn) closeBtn.onclick = () => chatBox.classList.remove('open');

  // (Ex: "AIzaSy..." dividida em 2 partes)
  const p1 = "AQ.Ab8RN6IzaIGGTjkgrOfVz3F"; 
  const p2 = "A89K4wMp790EbNl_-tEDSqz7T_w";  

  const GEMINI_API_KEY = (p1 + p2).trim();

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    // Adiciona a mensagem do usuário
    messagesContainer.innerHTML += `<div class="ai-msg user">${escapeHtml(text)}</div>`;
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Indicador de carregamento
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
        messagesContainer.innerHTML += `<div class="ai-msg bot">${escapeHtml(reply)}</div>`;
      } else if (data.error) {
        // Exibe o erro exato do Google
        messagesContainer.innerHTML += `<div class="ai-msg bot" style="background: rgba(255,0,0,0.2);">Erro Google: ${escapeHtml(data.error.message)}</div>`;
      } else {
        messagesContainer.innerHTML += `<div class="ai-msg bot" style="background: rgba(255,0,0,0.2);">Resposta inesperada da API.</div>`;
      }
    } catch (error) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      messagesContainer.innerHTML += `<div class="ai-msg bot" style="background: rgba(255,0,0,0.2);">Erro de conexão.</div>`;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Função para evitar que caracteres especiais quebrem o HTML
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  sendBtn.onclick = handleSend;
  input.onkeypress = (e) => {
    if (e.key === 'Enter') handleSend();
  };
});
