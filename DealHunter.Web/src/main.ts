import './style.css'

interface Rule {
  id: string;
  url: string;
  maxPrice: number | null;
  createdAt: string;
}

// Initial mock data
let rules: Rule[] = [
  { 
    id: 'RL-8F39', 
    url: 'https://www.olx.pl/elektronika/telefony/apple/?search%5Bfilter_float_price:to%5D=2000', 
    maxPrice: 2000, 
    createdAt: '2026-07-23 18:30:00' 
  },
  { 
    id: 'RL-2A1B', 
    url: 'https://www.olx.pl/muzyka-edukacja/instrumenty/gitary/', 
    maxPrice: null, 
    createdAt: '2026-07-23 18:45:00' 
  }
];

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="layout">
    <header class="header">
      <h1 class="glitch" data-text="DealHunter_OS">DealHunter_OS</h1>
      <div class="system-status">
        <span class="badge">SYS.STATUS: ONLINE</span>
        <span class="badge" style="color: var(--neon-purple); border-color: var(--neon-purple); background: rgba(188, 19, 254, 0.1);">LATENCY: 14ms</span>
      </div>
    </header>
    
    <aside class="sidebar">
      <nav>
        <a class="nav-item active" href="#">> [MONITOR]</a>
        <a class="nav-item" href="#">> [LOGS]</a>
        <a class="nav-item" href="#">> [SETTINGS]</a>
      </nav>
      <div style="margin-top: auto; padding: 1rem; border: 1px dashed var(--text-muted); font-size: 0.8rem; color: var(--text-muted);">
        <p>USER: ADMIN</p>
        <p>TERM: TTY1</p>
        <p>VERSION: 1.0.0-RC1</p>
      </div>
    </aside>
    
    <main class="main-content">
      <section class="panel">
        <h2>> INITIATE_NEW_PROTOCOL</h2>
        <form id="add-rule-form">
          <div class="form-group">
            <label for="url">TARGET_URL (OLX.pl)</label>
            <input type="text" id="url" placeholder="https://www.olx.pl/..." required autocomplete="off" />
          </div>
          <div class="form-group">
            <label for="max-price">MAX_PRICE (OPTIONAL)</label>
            <input type="number" id="max-price" placeholder="e.g. 1500" autocomplete="off" />
          </div>
          <button type="submit">[ EXECUTE_DEPLOYMENT ]</button>
        </form>
      </section>
      
      <section class="panel">
        <h2>> ACTIVE_MONITORING_RULES</h2>
        <div class="rule-list" id="rule-list">
          <!-- Populated by TS -->
        </div>
      </section>
    </main>
  </div>
`

function renderRules() {
  const ruleListEl = document.getElementById('rule-list');
  if (!ruleListEl) return;
  
  if (rules.length === 0) {
    ruleListEl.innerHTML = '<p style="color: var(--text-muted);">> NO ACTIVE RULES FOUND IN DATABASE.</p>';
    return;
  }
  
  ruleListEl.innerHTML = rules.map(rule => `
    <div class="rule-card">
      <div class="rule-info">
        <div style="display:flex; gap:10px; align-items:center;">
          <span style="color: var(--neon-purple); font-weight: bold; font-family: var(--font-heading);">[${rule.id}]</span>
          ${rule.maxPrice ? `<span class="badge">MAX: ${rule.maxPrice} PLN</span>` : ''}
        </div>
        <a href="${rule.url}" target="_blank" class="rule-url">${rule.url.length > 70 ? rule.url.substring(0, 70) + '...' : rule.url}</a>
        <span class="rule-meta">INITIATED: ${rule.createdAt}</span>
      </div>
      <button class="danger delete-btn" data-id="${rule.id}">[ TERMINATE ]</button>
    </div>
  `).join('');

  // Attach delete events
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.target as HTMLButtonElement).getAttribute('data-id');
      if (id) {
        rules = rules.filter(r => r.id !== id);
        renderRules();
      }
    });
  });
}

// Form submission
document.getElementById('add-rule-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const urlInput = document.getElementById('url') as HTMLInputElement;
  const maxPriceInput = document.getElementById('max-price') as HTMLInputElement;
  
  if (urlInput.value) {
    const newRule: Rule = {
      id: 'RL-' + Math.random().toString(16).substring(2, 6).toUpperCase(),
      url: urlInput.value,
      maxPrice: maxPriceInput.value ? parseFloat(maxPriceInput.value) : null,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    rules.unshift(newRule);
    renderRules();
    
    urlInput.value = '';
    maxPriceInput.value = '';
  }
});

// Initial render
renderRules();
