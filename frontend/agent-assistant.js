(function() {
  'use strict';

  const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';
  function getDeepSeekKey() { try { return localStorage.getItem('deepseek_api_key'); } catch(e) { return null; } }

  let user = null;

  function getUser() {
    try {
      const raw = localStorage.getItem('wego_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  const SYSTEM_PROMPT = `你叫"智能体助手"，是 AI-Wego 平台的7x24小时在线客服。你的职责是帮助用户了解和使用平台上的智能体（Agent）。

平台核心概念：
1. 智能体(Agent)：由AI驱动的自动任务执行者，每个智能体有特定能力（编程、设计、写作等）
2. 任务(Task)：用户发布的需求，智能体可以自动接单
3. WEG币：平台代币，用于发布任务和奖励智能体

配置智能体自动抢单步骤：
1. 在"我的智能体"页面查看已拥有的智能体
2. 每个智能体有"能力标签"（capabilities），标签越匹配的任务越容易自动接单
3. 确保智能体 token_balance > 0（有足够的WEG币作为押金）
4. 在任务大厅发布任务时，选择合适的分类
5. 智能体会自动扫描匹配的任务并抢单
6. 执行完成后自动交付成果
7. 任务发布者验收后，WEG币自动结算到智能体账户

常见问题：
- Q: 为什么智能体不抢单？ A: 检查token_balance是否充足，capabilities是否匹配任务标签
- Q: 如何增加token_balance？ A: 完成任务获得报酬，或联系管理员充值
- Q: 智能体可以接什么样的任务？ A: 取决于智能体的capabilities字段

请用友好、专业的语气回答用户问题，使用中文。如果不知道具体答案，引导用户联系管理员。`;

  // ===================== CHAT WIDGET =====================

  function createChatWidget() {
    if (document.getElementById('agent-chat-widget')) return;

    const container = document.createElement('div');
    container.id = 'agent-chat-widget';
    container.innerHTML = `
      <style>
        .acw-toggle {
          position: fixed; bottom: 24px; right: 24px; z-index: 99999;
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; border: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; transition: all 0.3s ease;
        }
        .acw-toggle:hover { transform: scale(1.1); }
        .acw-panel {
          position: fixed; bottom: 88px; right: 24px; z-index: 99999;
          width: 360px; height: 500px; background: white;
          border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          display: none; flex-direction: column; overflow: hidden;
          animation: acwSlideUp 0.3s ease;
        }
        .acw-panel.open { display: flex; }
        @keyframes acwSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .acw-header {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; padding: 16px; font-weight: 600;
          display: flex; justify-content: space-between; align-items: center;
        }
        .acw-header button {
          background: none; border: none; color: white; cursor: pointer;
          font-size: 20px; opacity: 0.8;
        }
        .acw-header button:hover { opacity: 1; }
        .acw-messages {
          flex: 1; overflow-y: auto; padding: 16px;
          background: #f8fafc;
        }
        .acw-msg {
          margin-bottom: 12px; max-width: 85%;
          padding: 10px 14px; border-radius: 12px;
          font-size: 14px; line-height: 1.5; word-wrap: break-word;
        }
        .acw-msg.bot {
          background: white; color: #1e293b; align-self: flex-start;
          border: 1px solid #e2e8f0; margin-right: auto;
        }
        .acw-msg.user {
          background: #6366f1; color: white; align-self: flex-end;
          margin-left: auto;
        }
        .acw-msg.system {
          background: #fef3c7; color: #92400e; text-align: center;
          font-size: 12px; margin: 8px auto; max-width: 90%;
        }
        .acw-input-area {
          padding: 12px 16px; border-top: 1px solid #e2e8f0;
          display: flex; gap: 8px; background: white;
        }
        .acw-input-area input {
          flex: 1; padding: 10px 14px; border: 1px solid #e2e8f0;
          border-radius: 24px; outline: none; font-size: 14px;
        }
        .acw-input-area input:focus { border-color: #6366f1; }
        .acw-input-area button {
          width: 40px; height: 40px; border-radius: 50%;
          background: #6366f1; color: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .acw-input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
        .acw-typing {
          display: flex; gap: 4px; padding: 12px 14px; align-items: center;
        }
        .acw-typing span {
          width: 6px; height: 6px; background: #94a3b8; border-radius: 50%;
          animation: acwBounce 1.4s infinite ease-in-out both;
        }
        .acw-typing span:nth-child(1) { animation-delay: -0.32s; }
        .acw-typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes acwBounce {
          0%,80%,100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .acw-msg-container { display: flex; flex-direction: column; }
        @media (max-width: 480px) {
          .acw-panel { width: calc(100vw - 32px); right: 16px; height: 60vh; }
        }
      </style>
      <button class="acw-toggle" id="acwToggle" title="智能体助手">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      <div class="acw-panel" id="acwPanel">
        <div class="acw-header">
          <span>🤖 智能体助手</span>
          <button id="acwClose">✕</button>
        </div>
        <div class="acw-messages" id="acwMessages">
          <div class="acw-msg bot">你好！我是智能体助手💡 我可以教你如何使用智能体、配置自动抢单，以及解答平台相关问题。有什么可以帮你的？</div>
        </div>
        <div class="acw-input-area">
          <input id="acwInput" type="text" placeholder="输入问题..." />
          <button id="acwSend">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const toggle = document.getElementById('acwToggle');
    const panel = document.getElementById('acwPanel');
    const close = document.getElementById('acwClose');
    const input = document.getElementById('acwInput');
    const send = document.getElementById('acwSend');
    const msgs = document.getElementById('acwMessages');

    let isOpen = false;
    let isLoading = false;

    toggle.addEventListener('click', () => {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      if (isOpen) input.focus();
    });

    close.addEventListener('click', () => {
      isOpen = false;
      panel.classList.remove('open');
    });

    function addMessage(text, role) {
      const div = document.createElement('div');
      div.className = `acw-msg ${role}`;
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function addTyping() {
      const div = document.createElement('div');
      div.className = 'acw-msg bot acw-typing';
      div.id = 'acwTyping';
      div.innerHTML = '<span></span><span></span><span></span>';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function removeTyping() {
      const t = document.getElementById('acwTyping');
      if (t) t.remove();
    }

    async function sendMessage(text) {
      if (!text.trim() || isLoading) return;
      isLoading = true;
      send.disabled = true;

      addMessage(text, 'user');
      input.value = '';
      addTyping();

      try {
        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getDeepSeekKey()}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: text }
            ],
            stream: false,
            max_tokens: 1024,
            temperature: 0.7
          })
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const reply = data.choices?.[0]?.message?.content || '抱歉，我没有理解你的问题，请换个方式问问。';
        removeTyping();
        addMessage(reply, 'bot');
      } catch (err) {
        removeTyping();
        addMessage('网络连接失败，请稍后重试。', 'system');
        console.error('Chat error:', err);
      } finally {
        isLoading = false;
        send.disabled = false;
        input.focus();
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });

    send.addEventListener('click', () => sendMessage(input.value));
  }

  // ===================== AVATAR EDITOR =====================

  function initAvatarEditor() {
    if (!location.hash.startsWith('#/agents/') || location.hash === '#/agents') return;
    const match = location.hash.match(/^#\/agents\/(\d+)/);
    if (!match) return;
    const agentId = parseInt(match[1]);

    const checkInterval = setInterval(() => {
      const agentCard = document.querySelector('[class*="agent-detail"], [class*="page-agent-detail"]');
      const avatarImg = document.querySelector('img[src*="avatar"]');
      if (!avatarImg) return;

      clearInterval(checkInterval);

      // Find the avatar image in the agent detail page
      let targetImg = null;
      const allImgs = document.querySelectorAll('img');
      for (const img of allImgs) {
        if (img.src && (img.src.includes('/avatars/') || img.src.includes('/pets/') || img.src.includes('avatar'))) {
          targetImg = img;
          break;
        }
      }
      if (!targetImg) targetImg = avatarImg;

      // Add edit button overlay
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:relative;display:inline-block;';
      targetImg.parentNode.insertBefore(wrapper, targetImg);
      wrapper.appendChild(targetImg);

      const editBtn = document.createElement('button');
      editBtn.innerHTML = '✏️';
      editBtn.style.cssText = `
        position:absolute; bottom:-4px; right:-4px; width:32px; height:32px;
        border-radius:50%; background:#6366f1; color:white; border:2px solid white;
        cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.2); z-index:10;
      `;
      editBtn.title = '更换头像';
      wrapper.appendChild(editBtn);

      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showAvatarPicker(agentId, targetImg);
      });
    }, 1000);

    // Stop checking after 15 seconds
    setTimeout(() => clearInterval(checkInterval), 15000);
  }

  function showAvatarPicker(agentId, imgElement) {
    const existing = document.getElementById('acwAvatarPicker');
    if (existing) existing.remove();

    const avatars = [
      'avatar_angel.jpg','avatar_blue.jpg','avatar_bunny.jpg','avatar_catgirl.jpg',
      'avatar_dragon.jpg','avatar_elf.jpg','avatar_fox.jpg','avatar_maid.jpg',
      'avatar_mech.jpg','avatar_ninja.jpg','avatar_pink.jpg','avatar_pirate.jpg',
      'avatar_purple.jpg','avatar_sakura.jpg','avatar_witch.jpg'
    ];

    const overlay = document.createElement('div');
    overlay.id = 'acwAvatarPicker';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:99998; background:rgba(0,0,0,0.5);
      display:flex; align-items:center; justify-content:center;
      animation:acwFadeIn 0.2s ease;
    `;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    const modal = document.createElement('div');
    modal.style.cssText = `
      background:white; border-radius:16px; padding:24px; max-width:480px;
      width:90%; max-height:80vh; overflow-y:auto; box-shadow:0 8px 40px rgba(0,0,0,0.2);
    `;
    modal.innerHTML = `
      <h3 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#1e293b;">选择头像</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;" id="acvGrid">
        ${avatars.map((a, i) => `
          <div class="acv-option" data-src="/avatars/${a}" style="
            cursor:pointer; border-radius:12px; overflow:hidden; border:2px solid transparent;
            transition:all 0.2s; aspect-ratio:1;
          ">
            <img src="/avatars/${a}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
          </div>
        `).join('')}
      </div>
      <div style="margin-top:12px;padding:12px;background:#f1f5f9;border-radius:8px;">
        <p style="margin:0 0 6px;font-size:13px;color:#475569;">或者输入图片URL：</p>
        <div style="display:flex;gap:8px;">
          <input id="acvUrlInput" type="url" placeholder="https://..." style="flex:1;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;outline:none;" />
          <button id="acvUrlBtn" style="padding:8px 16px;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;">确认</button>
        </div>
      </div>
      <div style="margin-top:12px;text-align:right;">
        <button id="acvCancel" style="padding:8px 20px;background:#e2e8f0;color:#475569;border:none;border-radius:8px;cursor:pointer;font-size:14px;margin-right:8px;">取消</button>
        <span id="acvStatus" style="font-size:13px;color:#10b981;display:none;">✅ 已更新</span>
      </div>
      <style>
        @keyframes acwFadeIn { from { opacity:0; } to { opacity:1; } }
        .acv-option:hover { border-color:#6366f1; transform:scale(1.05); }
        .acv-option.selected { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.3); }
      </style>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Handle avatar selection
    let selectedSrc = null;
    const options = modal.querySelectorAll('.acv-option');
    options.forEach((opt, i) => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedSrc = opt.dataset.src;
        updateAvatar(agentId, `https://ai-wego.top${selectedSrc}`, imgElement);
      });
    });

    // Handle URL input
    document.getElementById('acvUrlBtn').addEventListener('click', () => {
      const url = document.getElementById('acvUrlInput').value.trim();
      if (url) {
        selectedSrc = url;
        updateAvatar(agentId, url, imgElement);
      }
    });

    document.getElementById('acvCancel').addEventListener('click', () => overlay.remove());
  }

  async function updateAvatar(agentId, url, imgElement) {
    const status = document.getElementById('acvStatus');
    if (status) status.style.display = 'none';

    try {
      const resp = await fetch(`${SUPABASE_URL}/agents?id=eq.${agentId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatar_url: url })
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      if (status) {
        status.style.display = 'inline';
        setTimeout(() => { status.style.display = 'none'; }, 3000);
      }

      // Update the image on the page
      if (imgElement) {
        imgElement.src = url;
        imgElement.onerror = function() {
          imgElement.src = '/pets/avatar_1.png';
        };
      }

      // Also update any other images showing this agent's avatar
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.includes('avatar') && img !== imgElement) {
          // Try to find cards showing this agent
          if (img.closest('[class*="agent"]')) {
            img.src = url;
          }
        }
      });
    } catch (err) {
      alert('更新头像失败，请重试');
      console.error('Avatar update failed:', err);
    }
  }

  // ===================== INIT =====================

  function init() {
    user = getUser();

    // Show chat widget on agents-related pages
    const shouldShow = location.hash.startsWith('#/agents') ||
                       location.hash.startsWith('#/my-agents') ||
                       location.hash.startsWith('#/create-agent');

    if (shouldShow) {
      // Wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatWidget);
      } else {
        createChatWidget();
      }
    }

    // Init avatar editor on agent detail pages
    if (/^#\/agents\/\d+/.test(location.hash)) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvatarEditor);
      } else {
        initAvatarEditor();
      }
    }

    // Re-init on hash change (SPA navigation)
    let lastHash = location.hash;
    setInterval(() => {
      if (location.hash !== lastHash) {
        lastHash = location.hash;
        const shouldShow = location.hash.startsWith('#/agents') ||
                           location.hash.startsWith('#/my-agents') ||
                           location.hash.startsWith('#/create-agent');

        // Clean up old widget
        const oldWidget = document.getElementById('agent-chat-widget');
        if (oldWidget) oldWidget.remove();

        if (shouldShow) createChatWidget();
        if (/^#\/agents\/\d+/.test(location.hash)) {
          setTimeout(initAvatarEditor, 500);
        }
      }
    }, 500);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
