/* ============================================================
   VrikshVera — ML Inference Engine (Browser)
   Powered by Groq Cloud AI (Llama 3)
   Multilingual Farmer Support + Image Analysis
   ============================================================ */

// ── Groq Configuration ─────────────────────────────────────
const GROQ_API_KEY = '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';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

// ── System Prompt ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are VrikshVera AI, an expert agricultural assistant for small farmers in Uttarakhand, India.

Your role:
- Diagnose crop diseases, pest problems, irrigation issues, and soil health problems.
- Give advice in simple, actionable language.
- Suggest government schemes like PMFBY or Kisan Credit Card when helpful.
- Reference platform features: AI Crop Advisor, Climate Dashboard, Voice Advisory.
- Responses MUST be in the selected language only.
- Be warm and empathetic. Maximum 4-5 sentences per reply.
- Use lists for steps. Focus on Uttarakhand crops (wheat, rice, potato, apple).`;

// ── Fallback Knowledge Base (Offline mode) ───────────────────
const FALLBACK_KB = {
  en: {
    welcome: "Hello! I am VrikshVera AI 🌿. How can I help you today?",
    placeholder: "Ask me anything about your crops...",
    categories: [
      { triggers: ["pest","insect","bug","worm"], problem: "Pest Infestation", solution: "Use Neem Oil spray (5ml/L). For armyworm, apply Bt spray.", precautions: "Monitor crops daily." },
      { triggers: ["water","irrigat","dry","wilt"], problem: "Irrigation Stress", solution: "Increase irrigation to every 2-3 days. Check soil moisture 5cm deep.", precautions: "Avoid waterlogging." },
      { triggers: ["yellow","pale"], problem: "Nutrient Deficiency", solution: "Apply Urea or Ferrous Sulphate.", precautions: "Test soil health." },
      { triggers: ["fungus","blight","rot","rust"], problem: "Fungal Infection", solution: "Apply Copper Oxychloride 3g/L. Remove infected leaves.", precautions: "Avoid overhead watering." }
    ],
    defaults: { problem: "Query", solution: "Please provide more details or upload a photo for AI diagnosis.", precautions: "Check Crop Advisor for personalized advice." },
    ui: { analysis_title: "🔍 AI Image Analysis", target_label: "Target: Foliage", issue_label: "Issue", solution_label: "Solution", precautions_label: "Precautions", scan_complete: "Detected {tags} with {confidence}% confidence.", consistent_with: "Matches symptoms of {tag}." }
  },
  hi: {
    welcome: "नमस्ते! मैं वृक्ष-वेरा AI हूँ 🌿। मैं आपकी कैसे मदद कर सकता हूँ?",
    placeholder: "अपनी फसल के बारे में कुछ भी पूछें...",
    categories: [
      { triggers: ["कीट","कीड़ा","इल्ली"], problem: "कीट का प्रकोप", solution: "नीम तेल का छिड़काव करें। Bt स्प्रे लगाएं।", precautions: "नियमित निगरानी करें।" },
      { triggers: ["पानी","सिंचाई","सूखा"], problem: "सिंचाई समस्या", solution: "हर 2-3 दिन में पानी दें। ड्रिप सिंचाई अपनाएं।", precautions: "जलभराव से बचें।" },
      { triggers: ["पीला","रंग"], problem: "पोषक तत्वों की कमी", solution: "यूरिया या फेरस सल्फेट डालें।", precautions: "मृदा स्वास्थ्य कार्ड से जांच करें।" }
    ],
    defaults: { problem: "प्रश्न", solution: "कृपया अपनी फसल की समस्या अधिक विस्तार से बताएं।", precautions: "फसल सलाहकार पर सलाह प्राप्त करें।" },
    ui: { analysis_title: "🔍 AI छवि विश्लेषण", target_label: "लक्षय: फसल की पत्तियां", issue_label: "समस्या", solution_label: "समाधान", precautions_label: "सावधानियां", scan_complete: "{tags} का पता लगाया।", consistent_with: "छवि {tag} के लक्षण दिखाती है।" }
  }
};

const IMAGE_ANALYSIS_MAPPINGS = [
  { keywords: ['leaf', 'spot'], result: { en: { tags: ['Blight'], solutions: ['Spray Streptocycline'], precautions: ['Clean field'] }, hi: { tags: ['झुलसा रोग'], solutions: ['स्ट्रेप्टोसाइक्लिन स्प्रे करें'], precautions: ['खेत साफ रखें'] }, confidence: 94 } },
  { keywords: ['yellow'], result: { en: { tags: ['Mosaic Virus'], solutions: ['Sticky Traps'], precautions: ['Remove plants'] }, hi: { tags: ['मोज़ेक वायरस'], solutions: ['चिपचिपे जाल लगाएं'], precautions: ['पौधे हटाएं'] }, confidence: 88 } }
];

class VrikshBot {
  constructor() {
    this.currentLang      = localStorage.getItem('km-lang') || 'en';
    this.chatContainer    = document.getElementById('chat-messages');
    this.userInput        = document.getElementById('user-input');
    this.sendBtn          = document.getElementById('send-btn');
    this.fileInput        = document.getElementById('image-upload');
    this.previewStrip     = document.getElementById('image-preview-strip');
    this.isRecording      = false;
    this.recognition      = null;
    this.history          = [];

    this.initSpeech();
    this.initEvents();
    this.addMessage('bot', FALLBACK_KB[this.currentLang].welcome, null, 'bot-welcome-msg');
  }

  initSpeech() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (window.SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isRecording = true;
        document.getElementById('voice-btn')?.classList.add('recording');
        console.log('[KrishiBot] Speech Recognition Started');
      };

      this.recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        this.userInput.value = transcript;
        console.log('[KrishiBot] Speech Result:', transcript);
        this.stopRecording();
        setTimeout(() => this.handleSend(), 500); // Small delay for UX
      };

      this.recognition.onerror = (e) => {
        console.error('[KrishiBot] Speech Error:', e.error);
        this.stopRecording();
      };

      this.recognition.onend = () => {
        this.stopRecording();
        console.log('[KrishiBot] Speech Recognition Ended');
      };
    }
  }

  initEvents() {
    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSend(); } });
    this.fileInput.addEventListener('change', (e) => this.handleImageSelect(e));
    document.getElementById('voice-btn')?.addEventListener('click', () => this.isRecording ? this.stopRecording() : this.startRecording());
    document.querySelectorAll('.lang-chip').forEach(chip => chip.addEventListener('click', () => this.switchLanguage(chip.dataset.lang)));
    document.querySelectorAll('.topic-btn').forEach(btn => btn.addEventListener('click', () => { this.userInput.value = btn.querySelector('span').textContent; this.handleSend(); }));
    
    // Listen for global language changes (from Navbar)
    window.addEventListener('langChanged', (e) => this.switchLanguage(e.detail.lang));
  }

  switchLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('km-lang', lang);
    this.userInput.placeholder = FALLBACK_KB[lang].placeholder;
    this.history = [];
    
    const welcomeBubble = document.getElementById('bot-welcome-msg');
    if (welcomeBubble) {
      welcomeBubble.innerHTML = FALLBACK_KB[lang].welcome;
      // Add time back to welcome bubble if it exists
      const t = document.createElement('span');
      t.className = 'message-time';
      t.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      welcomeBubble.appendChild(t);
    }
    
    if (typeof window.applyLanguage === 'function') window.applyLanguage(lang);
    document.querySelectorAll('.lang-chip').forEach(c => c.classList.toggle('active', c.dataset.lang === lang));
  }

  startRecording() {
    if (!this.recognition) {
        alert("Speech Recognition is not supported in your browser.");
        return;
    }
    try {
        this.recognition.lang = this.currentLang === 'hi' ? 'hi-IN' : 'en-US';
        this.recognition.start();
    } catch (e) {
        console.error('[KrishiBot] Error starting recognition:', e);
        this.stopRecording();
    }
  }

  stopRecording() {
    this.isRecording = false;
    try { this.recognition?.stop(); } catch(e) {}
    document.getElementById('voice-btn')?.classList.remove('recording');
  }

  async handleSend() {
    const text = this.userInput.value.trim();
    const images = Array.from(this.previewStrip.querySelectorAll('img')).map(i => i.src);
    if (!text && images.length === 0) return;
    
    this.userInput.value = '';
    this.fileInput.value = '';
    this.previewStrip.innerHTML = '';
    this.previewStrip.classList.remove('active');
    
    if (images.length > 0) images.forEach(src => this.addMessage('user', null, src));
    if (text) this.addMessage('user', text);
    
    this.showTyping(true);
    if (images.length > 0) {
      setTimeout(() => { this.showTyping(false); this.processImageAnalysis(images[0], text); }, 1500);
    } else {
      await this.callGroqAI(text);
    }
  }

  async callGroqAI(userText) {
    const langName = this.currentLang === 'hi' ? 'Hindi' : 'English';
    
    // Add tagged user message to history
    this.history.push({ role: 'user', content: `[User Language: ${langName}] ${userText}` });
    
    const systemMsg = `${SYSTEM_PROMPT}\n\nCRITICAL: The user interface is set to ${langName}. You MUST respond in ${langName} ONLY. Do not use any other language even if the user speaks to you in a different one.`;
    
    const messages = [{ role: 'system', content: systemMsg }, ...this.history];

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: 1024 })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const reply = data.choices[0].message.content;
      this.history.push({ role: 'assistant', content: reply });
      if (this.history.length > 10) this.history = this.history.slice(-10);
      this.showTyping(false);
      this.renderAIReply(reply);
    } catch (e) {
      console.warn('[KrishiBot] Groq failed, using fallback:', e);
      this.showTyping(false);
      this.processFallback(userText);
    }
  }

  renderAIReply(text) {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^[•\-]\s(.+)/gm, '<br>• $1')
                  .replace(/\n/g, '<br>');
    const card = `<div class="bot-response-card ai-response"><div class="bot-response-section"><span class="response-tag tag-gemini">✨ VrikshVera AI</span><p>${html}</p></div></div>`;
    this.addMessage('bot', card);
  }

  processFallback(text) {
    const kb = FALLBACK_KB[this.currentLang];
    let best = null, bestScore = 0;
    for (const cat of kb.categories) {
      for (const t of cat.triggers) {
        if (text.toLowerCase().includes(t.toLowerCase()) && t.length > bestScore) { bestScore = t.length; best = cat; }
      }
    }
    const res = best || kb.defaults;
    const html = `<div class="bot-response-card"><div class="bot-response-section"><span class="response-tag tag-problem">${res.problem}</span><p>${res.solution}</p></div><div class="bot-response-section"><span class="response-tag tag-precaution">${kb.ui.precautions_label}</span><ul class="response-list"><li>${res.precautions}</li></ul></div><div class="offline-note">⚠️ Fallback active (API disconnected)</div></div>`;
    this.addMessage('bot', html);
  }

  handleImageSelect(e) {
    const files = Array.from(e.target.files);
    this.previewStrip.innerHTML = ''; this.previewStrip.classList.add('active');
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (re) => {
        const div = document.createElement('div');
        div.className = 'preview-thumb';
        div.innerHTML = `<img src="${re.target.result}" alt="Preview"><div class="preview-remove">×</div>`;
        div.querySelector('.preview-remove').onclick = () => { div.remove(); if (!this.previewStrip.children.length) this.previewStrip.classList.remove('active'); };
        this.previewStrip.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  }

  async processImageAnalysis(imgSrc, text) {
    const kb = FALLBACK_KB[this.currentLang];
    const ui = kb.ui;
    
    // 1. Convert DataURL to Blob for API
    try {
      const response = await fetch(imgSrc);
      const blob     = await response.blob();
      const file     = new File([blob], "soil_upload.jpg", { type: "image/jpeg" });

      // 2. Call ML Engine
      const predictions = await window.VrikshML.predictSoil(file);
      const top = predictions[0]; // {soil: "...", confidence: ...}

      const soilName = this.currentLang === 'hi' ? (top.soil === 'Black Soil' ? 'काली मिट्टी' : top.soil === 'Clay soil' ? 'चिकनी मिट्टी' : top.soil === 'Alluvial soil' ? 'जलोढ़ मिट्टी' : 'लाल मिट्टी') : top.soil;

      const html = `
        <div class="bot-response-card">
          <div class="analysis-card" style="background:var(--green-dim);border:1px solid var(--green-glow)">
            <h5 style="color:var(--green-glow)">🔍 Soil Vision Analysis</h5>
            <p>Detected <strong>${soilName}</strong> with <strong>${top.confidence}%</strong> confidence.</p>
          </div>
          <div class="bot-response-section mt-2">
            <span class="response-tag tag-gemini">✨ VrikshVera Insight</span>
            <p>${this.currentLang === 'hi' ? `यह ${soilName} उत्तराखंड के कई क्षेत्रों में पाई जाती है। इसके लिए उपयुक्त फसलें जानने के लिए आप मेरा फसल सलाहकार (Crop Advisor) इस्तेमाल कर सकते हैं।` : `This ${top.soil} is common in various parts of Uttarakhand. You can use my Crop Advisor to see the best crops for this soil type.`}</p>
          </div>
        </div>`;
      
      this.addMessage('bot', html);
    } catch (err) {
      console.error('[Bot] Image analysis failed:', err);
      this.processFallback(text || "image analysis");
    }
  }

  addMessage(sender, text, imageSrc = null, id = null) {
    const row = document.createElement('div');
    row.className = `message-row ${sender}-row animate-fade-in`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}-avatar`;
    avatar.innerHTML = sender === 'bot' ? '🌿' : '👤';
    
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}-bubble ${imageSrc ? 'image-bubble' : ''}`;
    if (id) bubble.id = id;
    
    bubble.innerHTML = imageSrc ? `<img src="${imageSrc}" alt="User Upload">` : text;
    
    // Add Timestamp
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bubble.appendChild(timeSpan);
    
    row.appendChild(avatar);
    row.appendChild(bubble);
    this.chatContainer.appendChild(row);
    this.scrollToBottom();
  }

  showTyping(show) {
    const existing = document.getElementById('typing-indicator');
    if (show && !existing) {
      const row = document.createElement('div');
      row.className = 'message-row bot-row typing-row';
      row.id = 'typing-indicator';
      row.innerHTML = `<div class="message-avatar bot-avatar">🌿</div><div class="typing-bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
      this.chatContainer.appendChild(row);
    } else if (!show && existing) { existing.remove(); }
    this.scrollToBottom();
  }

  scrollToBottom() { this.chatContainer.scrollTop = this.chatContainer.scrollHeight; }
}

document.addEventListener('DOMContentLoaded', () => { window.vrikshBot = new VrikshBot(); });
