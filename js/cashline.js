// ── CASHLINE MODULE: BANKING, CASHBOOK & CASHFLOW ──────────────────

(function() {
  // Styles Injected dynamically for maximum design layout flexibility
  function injectCashlineStyles() {
    if (document.getElementById('cashline-styles')) return;
    const s = document.createElement('style');
    s.id = 'cashline-styles';
    s.textContent = `
      .cashline-layout {
        display: block;
        font-family: var(--font-main), 'Inter', sans-serif;
      }
      .cashline-tabs {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: var(--white);
        border: 1.5px solid var(--slate-150);
        border-radius: 16px;
        padding: 16px;
        align-self: start;
        box-shadow: var(--shadow-sm);
      }
      .cashline-tab-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: var(--slate-600);
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
      }
      .cashline-tab-btn:hover {
        background: var(--slate-50);
        color: var(--slate-900);
      }
      .cashline-tab-btn.active {
        background: var(--blue-50);
        color: var(--blue-700);
      }
      .cashline-tab-btn svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }
      .cashline-content {
        background: var(--white);
        border: 1.5px solid var(--slate-150);
        border-radius: 20px;
        padding: 24px;
        min-height: 480px;
        box-shadow: var(--shadow-sm);
      }
      .cl-sub-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        border-bottom: 1.5px solid var(--slate-100);
        padding-bottom: 16px;
      }
      .cl-sub-title {
        font-size: 18px;
        font-weight: 800;
        color: var(--slate-900);
        margin: 0;
      }
      .cl-sub-desc {
        font-size: 12.5px;
        color: var(--slate-400);
        margin: 4px 0 0 0;
      }
      
      /* Accounts grid styling */
      .cl-accounts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }
      .cl-account-card {
        border: 1.5px solid var(--slate-200);
        border-radius: 16px;
        padding: 20px;
        background: var(--white);
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
      }
      .cl-account-card:hover {
        border-color: var(--blue-400);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
      .cl-account-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 4px;
        background: linear-gradient(90deg, var(--blue-500), var(--emerald-500));
      }
      .cl-account-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 14px;
      }
      .cl-account-name {
        font-size: 15px;
        font-weight: 700;
        color: var(--slate-800);
        margin: 0;
      }
      .cl-account-bank {
        font-size: 12px;
        color: var(--slate-400);
        font-weight: 500;
        margin-top: 2px;
      }
      .cl-account-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 20px;
        text-transform: uppercase;
        background: var(--slate-100);
        color: var(--slate-600);
      }
      .cl-account-details {
        font-size: 12.5px;
        color: var(--slate-600);
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cl-account-bal-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 10px;
        border-top: 1px dashed var(--slate-200);
      }
      .cl-account-bal-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--slate-400);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .cl-account-bal-val {
        font-size: 15px;
        font-weight: 800;
        color: var(--slate-800);
      }
      .cl-account-bal-val.reconciled {
        color: var(--emerald-600);
      }
      .cl-card-actions {
        display: flex;
        gap: 8px;
        margin-top: 14px;
      }
      .cl-card-btn {
        flex: 1;
        padding: 7px 10px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 8px;
        border: 1px solid var(--slate-200);
        background: var(--white);
        color: var(--slate-700);
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .cl-card-btn:hover {
        background: var(--slate-50);
        border-color: var(--slate-300);
      }
      .cl-card-btn.primary {
        background: var(--blue-600);
        color: var(--white);
        border: none;
      }
      .cl-card-btn.primary:hover {
        background: var(--blue-700);
      }

      /* Form inputs styling */
      .cl-form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 16px;
      }
      .cl-form-group label {
        font-size: 11px;
        font-weight: 700;
        color: var(--slate-500);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .cl-input-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      
      /* Reconciliation styling */
      .recon-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        background: var(--slate-50);
        border: 1.5px solid var(--slate-200);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 24px;
      }
      .recon-stat-card {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .recon-stat-label {
        font-size: 10.5px;
        font-weight: 700;
        color: var(--slate-400);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .recon-stat-val {
        font-size: 16px;
        font-weight: 800;
        color: var(--slate-800);
      }
      .recon-stat-val.diff-error {
        color: var(--red-600);
      }
      .recon-stat-val.diff-success {
        color: var(--emerald-600);
      }
      
      /* Cashbook & Cashflow Report UI */
      .cl-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .cl-table th {
        background: var(--slate-50);
        color: var(--slate-600);
        font-weight: 700;
        font-size: 12px;
        padding: 12px 14px;
        text-align: left;
        border-bottom: 2px solid var(--slate-200);
      }
      .cl-table td {
        padding: 12px 14px;
        border-bottom: 1px solid var(--slate-100);
        font-size: 13px;
        color: var(--slate-700);
        vertical-align: middle;
      }
      .cl-table tr:hover {
        background: var(--slate-50);
      }
      .num-val {
        font-family: monospace;
        font-weight: 600;
        text-align: right;
        font-size: 13.5px;
      }
      .cashflow-cat-hdr {
        font-weight: 800;
        font-size: 14.5px;
        color: var(--slate-900);
        background: var(--slate-50) !important;
        border-top: 1.5px solid var(--slate-200);
        border-bottom: 1.5px solid var(--slate-200);
      }
      .cashflow-subcat-hdr {
        font-weight: 700;
        font-size: 13px;
        color: var(--slate-700);
        padding-left: 24px !important;
      }
      .cashflow-line-item {
        padding-left: 40px !important;
        color: var(--slate-600);
      }
      .cashflow-total-row {
        font-weight: 700;
        background: var(--blue-50) !important;
        color: var(--blue-900);
        border-top: 1px solid var(--blue-200);
        border-bottom: 2px solid var(--blue-200);
      }
      .cashflow-grand-row {
        font-weight: 800;
        font-size: 14px;
        background: var(--emerald-50) !important;
        color: var(--emerald-900);
        border-top: 2px solid var(--emerald-200);
        border-bottom: 4px double var(--emerald-600) !important;
      }
      .cl-badge {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 20px;
        border: 1px solid transparent;
      }
      .cl-badge.posted {
        background: #ecfdf5;
        color: #059669;
        border-color: #a7f3d0;
      }
      .cl-badge.reconciled {
        background: #eff6ff;
        color: #2563eb;
        border-color: #bfdbfe;
      }
      .cl-badge.unreconciled {
        background: #fffbeb;
        color: #d97706;
        border-color: #fde68a;
      }
    `;
    document.head.appendChild(s);
  }

  // ── Global Cashline Variables & State ─────────────────────────────
  let _clActiveTopTab = 'banking'; // 'banking', 'books', 'cashflow'
  let _clActiveBankingTab = 'details'; // 'details', 'statement', 'reconciliation'
  let _clBooksSubtab = 'cashbook'; // 'cashbook', 'reconciliation'

  // Reconciliation sub-state
  let _clReconBankId = '';
  let _clReconStmtDate = '';
  let _clReconStmtBal = '';
  let _clReconFilter = 'unreconciled'; // 'all', 'reconciled', 'unreconciled'

  // Cashbook sub-state
  let _clCashbookAccountId = '';

  // Cashflow sub-state (kept for internal calculations)
  let _clCashflowDateFrom = '';
  let _clCashflowDateTo = '';

  // ── Initialize KYA Store Future Variables ──────────────────────────
  function initClStore() {
    window.KYA_STORE = window.KYA_STORE || {};
    window.KYA_STORE.bankAccounts = window.KYA_STORE.bankAccounts || [];
    window.KYA_STORE.reconciliationState = window.KYA_STORE.reconciliationState || {};
  }

  // ── Main Shell Hook: Called by app-shell.js ───────────────────────
  window.renderCashlinePanel = function() {
    injectCashlineStyles();
    initClStore();

    const panel = document.getElementById('panel-cashline');
    if (!panel) return;

    // Prefill dates if not set
    if (!_clCashflowDateFrom) _clCashflowDateFrom = _globalDateFrom || '2024-04-01';
    if (!_clCashflowDateTo) _clCashflowDateTo = _globalDateTo || '2025-03-31';

    // Top-level Navigation block above the card (matching sales style)
    const headerHtml = `
      <div class="panel-header" style="border-bottom: 1.5px solid var(--slate-100); padding-bottom: 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: flex-start; gap: 12px; width: 100%;">
        <div class="panel-actions" style="display: flex; gap: 8px; align-items: center;">
          <button class="${_clActiveTopTab === 'banking' ? 'btn btn-primary' : 'btn-sales-action'}" id="clTopTabBanking" type="button" style="display: flex; align-items: center; gap: 6px; height: 38px; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 8px; cursor: pointer;">
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14" style="stroke: currentColor; stroke-width: 1.8; fill: none; display: block;">
              <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor"/>
              <line x1="2" y1="9" x2="18" y2="9" stroke="currentColor"/>
              <circle cx="14" cy="12" r="0.5" fill="currentColor"/>
            </svg>
            Banking
          </button>
          <button class="${_clActiveTopTab === 'books' ? 'btn btn-primary' : 'btn-sales-action'}" id="clTopTabBooks" type="button" style="display: flex; align-items: center; gap: 6px; height: 38px; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 8px; cursor: pointer;">
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14" style="stroke: currentColor; stroke-width: 1.8; fill: none; display: block;">
              <path d="M4 4h12M4 9h12M4 14h12" stroke="currentColor"/>
            </svg>
            Books
          </button>
          <button class="${_clActiveTopTab === 'cashflow' ? 'btn btn-primary' : 'btn-sales-action'}" id="clTopTabCashflow" type="button" style="display: flex; align-items: center; gap: 6px; height: 38px; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 8px; cursor: pointer;">
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14" style="stroke: currentColor; stroke-width: 1.8; fill: none; display: block;">
              <path d="M12 5l5 5-5 5M17 10H3" stroke="currentColor"/>
            </svg>
            Cashflow
          </button>
        </div>
      </div>
    `;

    // Dynamic Title & Subtitle for title card
    let title = '', subtitle = '', iconSvg = '';
    if (_clActiveTopTab === 'banking') {
      title = 'Banking';
      subtitle = 'Manage bank accounts, link ledgers, and check current bank balances';
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="7" cy="15" r="1.5" fill="currentColor"/><circle cx="12" cy="15" r="1"/></svg>`;
    } else if (_clActiveTopTab === 'books') {
      title = 'Books';
      subtitle = 'Record cashbook receipts/payments and clear outstanding bank transactions';
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
    } else if (_clActiveTopTab === 'cashflow') {
      title = 'Cashflow';
      subtitle = 'Indirect cash flow statement of operating, investing, and financing cash movements';
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
    }

    panel.innerHTML = `
      ${headerHtml}

      <div class="table-card" style="padding: 24px 28px;">
        <!-- Title card -->
        <div class="je-card-header" style="background: linear-gradient(90deg, var(--blue-700), var(--blue-500)); border-top-left-radius: 12px; border-top-right-radius: 12px; margin: -24px -28px 20px -28px; padding: 18px 28px; display: flex; align-items: center; justify-content: space-between;">
          <div class="je-card-header-left" style="display: flex; align-items: center; gap: 12px;">
            <div class="je-card-icon-wrap" style="background: rgba(255, 255, 255, 0.15); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #fff;">
              ${iconSvg}
            </div>
            <div>
              <div class="je-card-title-text" style="color: var(--white); font-weight: 700; font-size: 16px; margin: 0;">${title}</div>
              <div class="je-card-subtitle-text" style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 2px 0 0 0;">${subtitle}</div>
            </div>
          </div>
          <div id="clTitleCardActions" style="display: flex; gap: 8px; align-items: center;"></div>
        </div>

        <div id="clMainContentArea" style="min-height: 400px;">
          <!-- Active view gets rendered here -->
        </div>
      </div>
    `;

    // Hook up top-level click events
    panel.querySelector('#clTopTabBanking').addEventListener('click', () => {
      _clActiveTopTab = 'banking';
      renderCashlinePanel();
    });
    panel.querySelector('#clTopTabBooks').addEventListener('click', () => {
      _clActiveTopTab = 'books';
      renderCashlinePanel();
    });
    panel.querySelector('#clTopTabCashflow').addEventListener('click', () => {
      _clActiveTopTab = 'cashflow';
      renderCashlinePanel();
    });

    renderActiveTabContent();
  };

  // ── Render Active Tab Content ──────────────────────────────────────
  function renderActiveTabContent() {
    const mainArea = document.getElementById('clMainContentArea');
    const actionsArea = document.getElementById('clTitleCardActions');
    if (!mainArea) return;
    if (actionsArea) actionsArea.innerHTML = '';

    if (_clActiveTopTab === 'banking') {
      renderBankingTab(mainArea, actionsArea);
    } else if (_clActiveTopTab === 'books') {
      renderBooksTab(mainArea, actionsArea);
    } else if (_clActiveTopTab === 'cashflow') {
      renderCashflowView(mainArea);
    }
  }

  // ── Banking Tab: KeepOne-style sidebar with Details/Statement/Reconciliation ──
  function renderBankingTab(mainArea, actionsArea) {
    mainArea.innerHTML = `
      <div class="oh-layout">
        <!-- Sidebar -->
        <div class="oh-sub-tabs" role="tablist" aria-label="Banking sections">
          <button class="oh-sub-tab" id="clBankTabDetails" role="tab" aria-selected="false">
            <div class="oh-tab-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/>
                <line x1="2" y1="9" x2="18" y2="9" stroke="currentColor" stroke-width="1.6"/>
                <circle cx="6" cy="13" r="1" fill="currentColor"/>
                <rect x="9" y="12" width="5" height="1.5" rx="0.5" fill="currentColor"/>
              </svg>
            </div>
            <span class="oh-tab-text">Details</span>
          </button>

          <button class="oh-sub-tab" id="clBankTabStatement" role="tab" aria-selected="false">
            <div class="oh-tab-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M3 5.5A2.5 2.5 0 015.5 3h9A2.5 2.5 0 0117 5.5v9a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 013 14.5v-9z" stroke="currentColor" stroke-width="1.8"/>
                <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="oh-tab-text">Statement</span>
          </button>

          <button class="oh-sub-tab" id="clBankTabReconciliation" role="tab" aria-selected="false">
            <div class="oh-tab-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M16.5 6.5l-8 8-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="oh-tab-text">Reconciliation</span>
          </button>
        </div>

        <!-- Content -->
        <div class="oh-content-area" id="clBankingContentArea"></div>
      </div>
    `;

    // Wire banking sub-tabs
    const bankTabMap = {
      clBankTabDetails:        'details',
      clBankTabStatement:      'statement',
      clBankTabReconciliation: 'reconciliation',
    };
    Object.entries(bankTabMap).forEach(([btnId, tab]) => {
      const btn = mainArea.querySelector('#' + btnId);
      if (btn) btn.addEventListener('click', () => switchBankingTab(tab, actionsArea));
    });

    switchBankingTab(_clActiveBankingTab, actionsArea);
  }

  function switchBankingTab(tab, actionsArea) {
    _clActiveBankingTab = tab;

    const allTabs = [
      ['clBankTabDetails',        'details'],
      ['clBankTabStatement',      'statement'],
      ['clBankTabReconciliation', 'reconciliation'],
    ];
    allTabs.forEach(([btnId, t]) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.classList.toggle('active', t === tab);
      btn.setAttribute('aria-selected', t === tab);
    });

    if (actionsArea) actionsArea.innerHTML = '';
    const bankArea = document.getElementById('clBankingContentArea');
    if (!bankArea) return;

    if (tab === 'details') {
      renderAccountsView(bankArea);
    } else if (tab === 'statement') {
      renderCashbookView(bankArea, null, null);
    } else if (tab === 'reconciliation') {
      renderReconciliationView(bankArea, null, actionsArea);
    }
  }

  function renderBooksTab(mainArea, actionsArea) {
    mainArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1.5px solid var(--slate-100); padding-bottom: 14px; flex-wrap: wrap; gap: 12px; width: 100%;">
        <div style="display: flex; gap: 8px;">
          <button class="btn ${_clBooksSubtab === 'cashbook' ? 'btn-primary' : 'btn-secondary'}" id="clBooksSubTabCashbook" style="height: 34px; font-size: 12.5px; border-radius: 6px; padding: 0 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg viewBox="0 0 20 20" fill="none" width="13" height="13" style="stroke: currentColor; stroke-width: 1.8;">
              <path d="M3 5.5A2.5 2.5 0 015.5 3h9A2.5 2.5 0 0117 5.5v9a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 013 14.5v-9z"/>
              <path d="M7 6h6M7 10h6M7 14h4"/>
            </svg>
            Cashbook
          </button>
          <button class="btn ${_clBooksSubtab === 'reconciliation' ? 'btn-primary' : 'btn-secondary'}" id="clBooksSubTabRecon" style="height: 34px; font-size: 12.5px; border-radius: 6px; padding: 0 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg viewBox="0 0 20 20" fill="none" width="13" height="13" style="stroke: currentColor; stroke-width: 1.8;">
              <path d="M16.5 6.5l-8 8-4-4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Reconciliation
          </button>
        </div>
        <div id="clBooksControlsArea" style="display: flex; gap: 8px; align-items: center;"></div>
      </div>
      <div id="clBooksSubContentArea" style="width: 100%;"></div>
    `;

    mainArea.querySelector('#clBooksSubTabCashbook').addEventListener('click', () => {
      _clBooksSubtab = 'cashbook';
      renderBooksTab(mainArea, actionsArea);
    });
    mainArea.querySelector('#clBooksSubTabRecon').addEventListener('click', () => {
      _clBooksSubtab = 'reconciliation';
      renderBooksTab(mainArea, actionsArea);
    });

    const subContent = document.getElementById('clBooksSubContentArea');
    const controls = document.getElementById('clBooksControlsArea');

    if (_clBooksSubtab === 'cashbook') {
      renderCashbookView(subContent, controls, null);
    } else if (_clBooksSubtab === 'reconciliation') {
      renderReconciliationView(subContent, controls, actionsArea);
    }
  }

  function renderActiveSubtab() {
    renderActiveTabContent();
  }

  // ── Helper: Format balances ───────────────────────────────────────
  function fmtAmt(v) {
    const val = parseFloat(v) || 0;
    return '₹&thinsp;' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Helper: Retrieve main group of ledger
  function getLedgerGroup(ledgerId) {
    const l = coaLedgers.find(x => x.id === ledgerId);
    if (!l) return '';
    const sg = COA_SYS_SGS.find(s => s.id === l.sgId);
    return sg ? sg.name : '';
  }


  // ===================================================================
  //  1. BANK ACCOUNT MANAGEMENT VIEW
  // ===================================================================
  function renderAccountsView(target) {
    const accounts = window.KYA_STORE.bankAccounts || [];

    let cardsHtml = '';
    if (accounts.length === 0) {
      cardsHtml = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; border: 1.5px dashed var(--slate-200); border-radius: 16px; background: var(--slate-50);">
          <div style="font-size: 14.5px; font-weight: 700; color: var(--slate-700);">No bank accounts added yet</div>
          <div style="font-size: 12.5px; color: var(--slate-400); margin-top: 4px;">Add bank accounts and link them to your Chart of Accounts.</div>
        </div>
      `;
    } else {
      accounts.forEach(acc => {
        const ledger = coaLedgers.find(l => l.id === acc.ledgerId);
        let bookBal = 0;
        if (ledger) {
          const balData = calculateLedgerBalances(ledger);
          bookBal = balData.closingBalance;
        }

        // Calculate unreconciled balance to get reconciled bank balance
        const unreconciledSum = getUnreconciledSum(acc.ledgerId);
        const reconciledBal = bookBal - unreconciledSum; // Book Balance - Outstanding Check net = Reconciled Balance

        cardsHtml += `
          <div class="cl-account-card">
            <div class="cl-account-header">
              <div>
                <h4 class="cl-account-name">${ohEsc(acc.name)}</h4>
                <div class="cl-account-bank">${ohEsc(acc.bankName)}</div>
              </div>
              <span class="cl-account-badge">${ohEsc(acc.branch || 'Branch')}</span>
            </div>
            <div class="cl-account-details">
              <div><strong>A/c No:</strong> ${ohEsc(acc.accountNumber || '—')}</div>
              <div><strong>IFSC Code:</strong> ${ohEsc(acc.ifsc || '—')}</div>
            </div>
            
            <div class="cl-account-bal-row" style="margin-bottom: 6px;">
              <span class="cl-account-bal-label">Book Balance</span>
              <span class="cl-account-bal-val">${fmtAmt(bookBal)}</span>
            </div>
            <div class="cl-account-bal-row">
              <span class="cl-account-bal-label" style="color:var(--emerald-600)">Reconciled Bal</span>
              <span class="cl-account-bal-val reconciled">${fmtAmt(reconciledBal)}</span>
            </div>
            
            <div class="cl-card-actions">
              <button class="cl-card-btn" onclick="window.clReconcileAccount(${acc.id})">
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14" style="color: var(--blue-600);">
                  <path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                Reconcile
              </button>
              <button class="cl-card-btn" onclick="window.clEditAccount(${acc.id})" title="Edit account details">
                Edit
              </button>
              <button class="cl-card-btn" style="color: var(--red-600); border-color: var(--red-100);" onclick="window.clDeleteAccount(${acc.id})" title="Delete account">
                Delete
              </button>
            </div>
          </div>
        `;
      });
    }

    target.innerHTML = `
      <div class="cl-accounts-grid" style="margin-top: 10px;">
        ${cardsHtml}
      </div>
    `;

  }

  // ── Modal for Adding/Editing Bank Account ──────────────────────────
  function showAddAccountModal(editId = null) {
    const acc = editId ? (window.KYA_STORE.bankAccounts || []).find(x => x.id === editId) : null;
    
    // Get list of existing cash/bank ledgers to optionally link
    const cceSubgroups = ['sg-cce'];
    const filteredLedgers = coaLedgers.filter(l => l.type === 'ledger' && cceSubgroups.includes(l.sgId));
    
    const ledgOpts = filteredLedgers.map(l => 
      `<option value="${l.id}" ${acc && acc.ledgerId === l.id ? 'selected' : ''}>${ohEsc(l.name)} (Code: ${l.code || 'None'})</option>`
    ).join('');

    const modalTitle = acc ? 'Edit Bank Account' : 'Add Bank Account';
    const confirmLabel = acc ? 'Save Changes' : '＋ Add Account';

    document.getElementById('clAccountModalOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'clAccountModalOverlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10005;
      background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(5px);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-main), Inter, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="background: #fff; border-radius: 20px; padding: 28px; width: 92%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; box-sizing: border-box;">
        <button id="clAccountModalClose" style="position: absolute; top: 18px; right: 18px; border: none; background: none; font-size: 22px; color: var(--slate-400); cursor: pointer;">×</button>
        
        <h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 800; color: var(--slate-900);">${modalTitle}</h3>
        <p style="margin: 0 0 20px 0; font-size: 12.5px; color: var(--slate-400);">Link this account to a General Ledger account to fetch automated book updates.</p>
        
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="cl-form-group">
            <label>Account Name *</label>
            <input type="text" id="clMName" class="je-input" placeholder="e.g. HDFC Current A/c" value="${acc ? ohEsc(acc.name) : ''}" style="height: 38px;" />
          </div>
          
          <div class="cl-form-group">
            <label>Bank Name *</label>
            <input type="text" id="clMBankName" class="je-input" placeholder="e.g. HDFC Bank Ltd" value="${acc ? ohEsc(acc.bankName) : ''}" style="height: 38px;" />
          </div>
          
          <div class="cl-input-row">
            <div class="cl-form-group">
              <label>Account Number</label>
              <input type="text" id="clMAccNo" class="je-input" placeholder="e.g. 501002345098" value="${acc ? ohEsc(acc.accountNumber) : ''}" style="height: 38px;" />
            </div>
            <div class="cl-form-group">
              <label>IFSC Code</label>
              <input type="text" id="clMIfsc" class="je-input" placeholder="e.g. HDFC0000124" value="${acc ? ohEsc(acc.ifsc) : ''}" style="height: 38px; text-transform: uppercase;" />
            </div>
          </div>
          
          <div class="cl-input-row">
            <div class="cl-form-group">
              <label>Branch / Location</label>
              <input type="text" id="clMBranch" class="je-input" placeholder="e.g. MG Road, Bengaluru" value="${acc ? ohEsc(acc.branch) : ''}" style="height: 38px;" />
            </div>
            <div class="cl-form-group">
              <label>Opening Balance</label>
              <input type="number" step="0.01" min="0" id="clMOpening" class="je-input" placeholder="₹ 0.00" value="${acc ? acc.openingBalance || '' : ''}" style="height: 38px;" ${acc ? 'disabled' : ''} />
            </div>
          </div>

          <div class="cl-form-group">
            <label>Link Ledger Account</label>
            <select id="clMLedgerId" class="je-input" style="height: 38px; cursor: pointer; background: #fff;">
              <option value="new">— Create New Auto Ledger —</option>
              ${ledgOpts}
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end;">
          <button class="btn btn-secondary" id="clAccountModalCancel" style="padding: 10px 20px;">Cancel</button>
          <button class="btn btn-primary" id="clAccountModalSave" style="padding: 10px 20px;">${confirmLabel}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#clAccountModalClose').addEventListener('click', close);
    overlay.querySelector('#clAccountModalCancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    // Handle Save
    overlay.querySelector('#clAccountModalSave').addEventListener('click', () => {
      const name = overlay.querySelector('#clMName').value.trim();
      const bankName = overlay.querySelector('#clMBankName').value.trim();
      const accountNumber = overlay.querySelector('#clMAccNo').value.trim();
      const ifsc = overlay.querySelector('#clMIfsc').value.trim().toUpperCase();
      const branch = overlay.querySelector('#clMBranch').value.trim();
      const opening = parseFloat(overlay.querySelector('#clMOpening').value) || 0;
      let ledgerId = overlay.querySelector('#clMLedgerId').value;

      if (!name || !bankName) {
        showToast('Please fill out all required fields (*).', 'warning');
        return;
      }

      if (editId) {
        // Edit Mode
        const accountIndex = window.KYA_STORE.bankAccounts.findIndex(x => x.id === editId);
        if (accountIndex > -1) {
          const oldAcc = window.KYA_STORE.bankAccounts[accountIndex];
          oldAcc.name = name;
          oldAcc.bankName = bankName;
          oldAcc.accountNumber = accountNumber;
          oldAcc.ifsc = ifsc;
          oldAcc.branch = branch;
          if (ledgerId !== 'new') {
            oldAcc.ledgerId = Number(ledgerId);
          }
        }
        showToast(`Bank Account "${name}" updated.`, 'success');
      } else {
        // Add Mode
        if (ledgerId === 'new') {
          // Auto create a ledger in Chart of Accounts
          const bankGroup = coaLedgers.find(l => l.name === 'Bank Account' && l.type === 'group-ledger');
          const newLedgerId = Date.now() + 2000;
          const newLedger = {
            id: newLedgerId,
            sgId: 'sg-cce',
            glId: bankGroup ? bankGroup.id : null,
            name: name,
            code: '',
            openingBalance: opening.toString(),
            type: 'ledger',
            aliases: []
          };
          coaLedgers.push(newLedger);
          ledgerId = newLedgerId;
        } else {
          ledgerId = Number(ledgerId);
        }

        window.KYA_STORE.bankAccounts.push({
          id: Date.now(),
          ledgerId,
          name,
          bankName,
          accountNumber,
          ifsc,
          branch,
          openingBalance: opening
        });
        showToast(`Bank Account "${name}" created and linked.`, 'success');
      }

      close();
      renderActiveSubtab();
      refreshAllReports();
      triggerAutoBackup();
    });
  }

  // Global triggers wired for click handlers inside HTML template strings
  window.clReconcileAccount = function(id) {
    _clReconBankId = id;
    _clActiveTopTab = 'banking';
    _clActiveBankingTab = 'reconciliation';
    // Load state
    const acc = window.KYA_STORE.bankAccounts.find(x => x.id === id);
    if (acc) {
      _clReconStmtDate = new Date().toISOString().split('T')[0];
    }
    renderCashlinePanel();
  };

  window.clEditAccount = function(id) {
    showAddAccountModal(id);
  };

  window.clDeleteAccount = function(id) {
    const acc = window.KYA_STORE.bankAccounts.find(x => x.id === id);
    if (!acc) return;

    showKyaConfirm({
      title: 'Remove Bank Account?',
      message: `Are you sure you want to remove the bank account for <strong>${ohEsc(acc.name)}</strong>?<br>The linked ledger account inside Chart of Accounts will NOT be deleted.`,
      confirmLabel: 'Remove',
      okBg: 'var(--red-600)',
      onConfirm: () => {
        window.KYA_STORE.bankAccounts = window.KYA_STORE.bankAccounts.filter(x => x.id !== id);
        showToast(`Bank Account "${acc.name}" disconnected.`, 'info');
        renderActiveSubtab();
        triggerAutoBackup();
      }
    });
  };

  // Helper: Sum unreconciled cheques/payments for a bank ledger
  function getUnreconciledSum(ledgerId) {
    const ledger = coaLedgers.find(l => l.id === ledgerId);
    if (!ledger) return 0;
    
    let sum = 0;
    postedEntries.forEach(entry => {
      (entry.allRows || []).forEach(row => {
        if (row.particular.trim() === ledger.name.trim()) {
          const key = entry.id + '_' + row.id;
          const reconDate = window.KYA_STORE.reconciliationState[key];
          if (!reconDate) {
            const dr = parseFloat(row.debit) || 0;
            const cr = parseFloat(row.credit) || 0;
            // For bank account (Asset): debits increase, credits decrease.
            // Net outstanding checks are withdrawals (credits) that haven't cleared yet (negative),
            // and outstanding deposits (debits) that haven't cleared yet (positive).
            // Reconciled Balance = Book Balance - Unreconciled Transactions.
            // Outstanding sum = dr - cr
            sum += (dr - cr);
          }
        }
      });
    });
    return sum;
  }


  // ===================================================================
  //  2. BANK RECONCILIATION VIEW
  // ===================================================================
  function renderReconciliationView(target, controls, actionsArea) {
    const accounts = window.KYA_STORE.bankAccounts || [];
    
    if (accounts.length === 0) {
      if (actionsArea) actionsArea.innerHTML = '';
      if (controls) controls.innerHTML = '';
      target.innerHTML = `
        <div style="padding: 48px; text-align: center; border: 1.5px dashed var(--slate-200); border-radius: 16px; background: var(--slate-50);">
          <div style="font-size: 14.5px; font-weight: 700; color: var(--slate-700);">No bank accounts available</div>
          <div style="font-size: 12.5px; color: var(--slate-400); margin-top: 4px; margin-bottom: 20px;">Please create a bank account before performing reconciliation.</div>
          <button class="btn btn-primary" onclick="_clActiveTopTab='banking'; _clActiveBankingTab='details'; renderCashlinePanel();" style="margin:0 auto;">
            Go to Bank Accounts
          </button>
        </div>
      `;
      return;
    }

    // Default select first bank account if not set
    if (!_clReconBankId && accounts.length > 0) {
      _clReconBankId = accounts[0].id;
    }

    const currentAcc = accounts.find(x => x.id === Number(_clReconBankId)) || accounts[0];
    const linkedLedger = coaLedgers.find(l => l.id === currentAcc.ledgerId);

    // Calculate balances
    let bookBal = 0;
    if (linkedLedger) {
      const balData = calculateLedgerBalances(linkedLedger);
      bookBal = balData.closingBalance;
    }

    // Filter bank ledger transaction rows
    const txRows = [];
    if (linkedLedger) {
      postedEntries.forEach(entry => {
        (entry.allRows || []).forEach(row => {
          if (row.particular.trim() === linkedLedger.name.trim()) {
            const key = entry.id + '_' + row.id;
            const reconDate = window.KYA_STORE.reconciliationState[key] || '';
            const dr = parseFloat(row.debit) || 0;
            const cr = parseFloat(row.credit) || 0;

            txRows.push({
              entryId: entry.id,
              rowId: row.id,
              key,
              date: entry.date,
              voucherNo: entry.voucherNo || '—',
              opposite: getOppositeParticulars(entry, linkedLedger.name, dr > 0),
              debit: dr,
              credit: cr,
              reconDate
            });
          }
        });
      });
    }

    // Sort entries by date (descending)
    txRows.sort((a, b) => b.date.localeCompare(a.date));

    // Calculate outstanding sum based on filter state
    let unreconciledDr = 0;
    let unreconciledCr = 0;
    txRows.forEach(tx => {
      if (!tx.reconDate) {
        unreconciledDr += tx.debit;
        unreconciledCr += tx.credit;
      }
    });

    const netUnreconciled = unreconciledDr - unreconciledCr;
    const reconciledBookBal = bookBal - netUnreconciled;

    // Statement balance
    const stmtEndingBal = parseFloat(_clReconStmtBal) || 0;
    const difference = reconciledBookBal - stmtEndingBal;

    // Filter transactions list
    const filteredTx = txRows.filter(tx => {
      if (_clReconFilter === 'reconciled') return !!tx.reconDate;
      if (_clReconFilter === 'unreconciled') return !tx.reconDate;
      return true;
    });

    let trsHtml = '';
    if (filteredTx.length === 0) {
      trsHtml = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--slate-400); padding: 32px;">
            No transactions match the selected filter (${_clReconFilter}).
          </td>
        </tr>
      `;
    } else {
      filteredTx.forEach(tx => {
        const isRecon = !!tx.reconDate;
        trsHtml += `
          <tr>
            <td style="text-align: center;">
              <input type="checkbox" style="width: 16px; height: 16px; cursor: pointer;" 
                     ${isRecon ? 'checked' : ''} 
                     onchange="window.clToggleReconcile('${tx.key}', this.checked)" />
            </td>
            <td>${tx.date}</td>
            <td>
              <span style="font-family: monospace; font-weight: 700; color: var(--slate-700);">${tx.voucherNo}</span>
            </td>
            <td style="font-weight:500;">${ohEsc(tx.opposite)}</td>
            <td class="num-val" style="color: var(--emerald-600);">${tx.debit > 0 ? fmtAmt(tx.debit) : '—'}</td>
            <td class="num-val" style="color: var(--red-600);">${tx.credit > 0 ? fmtAmt(tx.credit) : '—'}</td>
            <td>
              ${isRecon 
                ? `<span class="cl-badge reconciled">Reconciled (${tx.reconDate})</span>` 
                : `<span class="cl-badge unreconciled">Outstanding</span>`
              }
            </td>
          </tr>
        `;
      });
    }

    // Set Actions in Card Header
    if (actionsArea) {
      actionsArea.innerHTML = `
        <button class="cl-card-btn" id="btnClAdjustCharges" style="padding: 0 12px; height: 32px; border-color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.15); color:#fff; font-size:12.5px; border-radius:6px; cursor:pointer;">＋ Charges</button>
        <button class="cl-card-btn" id="btnClAdjustInterest" style="padding: 0 12px; height: 32px; border-color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.15); color:#fff; font-size:12.5px; border-radius:6px; cursor:pointer;">＋ Interest</button>
      `;
      document.getElementById('btnClAdjustCharges').addEventListener('click', () => {
        showAdjustmentModal('Charges', linkedLedger);
      });
      document.getElementById('btnClAdjustInterest').addEventListener('click', () => {
        showAdjustmentModal('Interest', linkedLedger);
      });
    }

    // Set Controls in Sub-Header
    if (controls) {
      controls.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: center;">
          <select id="clReconSelectBank" class="je-input" style="height: 34px; font-size: 13px; padding: 0 8px; cursor: pointer; background: #fff; border-radius: 6px; width: 140px;">
            ${accounts.map(a => `<option value="${a.id}" ${a.id === currentAcc.id ? 'selected' : ''}>${ohEsc(a.name)}</option>`).join('')}
          </select>
          <input type="date" id="clReconStmtDate" class="je-input" value="${_clReconStmtDate}" style="height: 34px; font-size: 13px; padding: 0 8px; border-radius: 6px; width: 120px;" />
          <div style="position: relative;">
            <span style="position: absolute; left: 8px; top: 7px; font-size: 12px; font-weight: 700; color: var(--slate-400);">₹</span>
            <input type="number" step="0.01" id="clReconStmtBal" class="je-input" value="${_clReconStmtBal}" placeholder="Ending Bal" style="height: 34px; font-size: 13px; padding: 0 8px 0 18px; border-radius: 6px; width: 100px;" />
          </div>
        </div>
      `;
      document.getElementById('clReconSelectBank').addEventListener('change', (e) => {
        _clReconBankId = e.target.value;
        renderActiveSubtab();
      });
      document.getElementById('clReconStmtDate').addEventListener('change', (e) => {
        _clReconStmtDate = e.target.value;
      });
      document.getElementById('clReconStmtBal').addEventListener('input', (e) => {
        _clReconStmtBal = e.target.value;
        renderActiveSubtab();
      });
    }

    // Main Sub-Content
    target.innerHTML = `
      <div class="recon-stats">
        <div class="recon-stat-card">
          <span class="recon-stat-label">Book Balance</span>
          <span class="recon-stat-val">${fmtAmt(bookBal)}</span>
        </div>
        <div class="recon-stat-card">
          <span class="recon-stat-label" title="Uncleared checks / deposits">Outstanding Net</span>
          <span class="recon-stat-val" style="color:var(--slate-500);">${fmtAmt(netUnreconciled)}</span>
        </div>
        <div class="recon-stat-card">
          <span class="recon-stat-label">Reconciled Balance</span>
          <span class="recon-stat-val" style="color:var(--emerald-700);">${fmtAmt(reconciledBookBal)}</span>
        </div>
        <div class="recon-stat-card">
          <span class="recon-stat-label">Difference (Stmt vs Recon)</span>
          <span class="recon-stat-val ${Math.abs(difference) < 0.005 ? 'diff-success' : 'diff-error'}">
            ${Math.abs(difference) < 0.005 ? '✓ Reconciled' : fmtAmt(difference)}
          </span>
        </div>
      </div>

      <!-- Filter tabs -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div class="sales-paystatus-wrap" style="width: auto; margin: 0;">
          <div class="sales-paystatus-bg" style="width: 90px; left: ${_clReconFilter === 'all' ? '0px' : (_clReconFilter === 'reconciled' ? '90px' : '180px')};"></div>
          <button class="sales-paystatus-btn ${_clReconFilter === 'all' ? 'active' : ''}" style="width:90px;" onclick="window.clSetReconFilter('all')">All Rows</button>
          <button class="sales-paystatus-btn ${_clReconFilter === 'reconciled' ? 'active' : ''}" style="width:90px;" onclick="window.clSetReconFilter('reconciled')">Cleared</button>
          <button class="sales-paystatus-btn ${_clReconFilter === 'unreconciled' ? 'active' : ''}" style="width:90px;" onclick="window.clSetReconFilter('unreconciled')">Outstanding</button>
        </div>
        <span style="font-size: 12px; color: var(--slate-400); font-weight: 600;">Showing ${filteredTx.length} lines</span>
      </div>

      <!-- Transactions list -->
      <div style="border: 1.5px solid var(--slate-200); border-radius: 12px; max-height: 400px; overflow-y: auto; background: #fff;">
        <table class="cl-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">Clear</th>
              <th style="width: 100px;">Date</th>
              <th style="width: 110px;">Voucher No</th>
              <th>Opposite Account</th>
              <th style="text-align: right; width: 120px;">Deposit (Dr)</th>
              <th style="text-align: right; width: 120px;">Withdrawal (Cr)</th>
              <th style="width: 150px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${trsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // ── Toggle Reconciled State ───────────────────────────────────────
  window.clToggleReconcile = function(key, checked) {
    if (checked) {
      const today = new Date().toISOString().split('T')[0];
      window.KYA_STORE.reconciliationState[key] = today;
    } else {
      delete window.KYA_STORE.reconciliationState[key];
    }
    renderActiveSubtab();
    triggerAutoBackup();
  };

  window.clSetReconFilter = function(filter) {
    _clReconFilter = filter;
    renderActiveSubtab();
  };

  // ── Modal for Bank Adjustments (Charges / Interest) ───────────────
  function showAdjustmentModal(type, bankLedger) {
    if (!bankLedger) return;
    
    // Suggest default counterparty ledgers
    let defaultOppLedgerName = type === 'Charges' ? 'Bank Charges' : 'Interest Income';
    let defaultOppLedger = coaLedgers.find(l => l.name === defaultOppLedgerName);

    // Build select options
    const oppOpts = coaLedgers.filter(l => l.type === 'ledger' && l.name !== bankLedger.name)
      .map(l => `<option value="${l.id}" ${defaultOppLedger && defaultOppLedger.id === l.id ? 'selected' : ''}>${ohEsc(l.name)}</option>`)
      .join('');

    document.getElementById('clAdjModalOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'clAdjModalOverlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10006;
      background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(5px);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-main), Inter, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="background: #fff; border-radius: 20px; padding: 28px; width: 92%; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; box-sizing: border-box;">
        <button id="clAdjModalClose" style="position: absolute; top: 18px; right: 18px; border: none; background: none; font-size: 22px; color: var(--slate-400); cursor: pointer;">×</button>
        
        <h3 style="margin: 0 0 4px 0; font-size: 17px; font-weight: 800; color: var(--slate-900);">Record Bank ${type}</h3>
        <p style="margin: 0 0 20px 0; font-size: 12.5px; color: var(--slate-400);">This will automatically post a balanced journal entry in your ledger.</p>
        
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="cl-form-group">
            <label>Date</label>
            <input type="date" id="clADate" class="je-input" value="${new Date().toISOString().split('T')[0]}" style="height: 38px;" />
          </div>
          
          <div class="cl-form-group">
            <label>Amount (₹) *</label>
            <input type="number" step="0.01" min="0" id="clAAmount" class="je-input" placeholder="0.00" style="height: 38px;" />
          </div>
          
          <div class="cl-form-group">
            <label>Counterparty Account *</label>
            <select id="clAOppLedgerId" class="je-input" style="height: 38px; cursor: pointer; background: #fff;">
              ${oppOpts}
            </select>
          </div>
          
          <div class="cl-form-group">
            <label>Narration / Note</label>
            <input type="text" id="clANarration" class="je-input" placeholder="e.g. Bank processing fee" value="${type === 'Charges' ? 'Bank charges debited' : 'Interest credited by bank'}" style="height: 38px;" />
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end;">
          <button class="btn btn-secondary" id="clAdjModalCancel" style="padding: 10px 18px;">Cancel</button>
          <button class="btn btn-primary" id="clAdjModalSave" style="padding: 10px 18px;">Post Entry</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#clAdjModalClose').addEventListener('click', close);
    overlay.querySelector('#clAdjModalCancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    // Save adjustment JV
    overlay.querySelector('#clAdjModalSave').addEventListener('click', () => {
      const date = overlay.querySelector('#clADate').value;
      const amt = parseFloat(overlay.querySelector('#clAAmount').value) || 0;
      const oppId = Number(overlay.querySelector('#clAOppLedgerId').value);
      const narr = overlay.querySelector('#clANarration').value.trim();

      if (amt <= 0) {
        showToast('Please enter a valid amount.', 'warning');
        return;
      }

      const oppLedger = coaLedgers.find(l => l.id === oppId);
      if (!oppLedger) return;

      const voucherNo = genVoucherNo();
      jvCounter++; // Increment globally exported voucher number count

      const newEntry = {
        id: Date.now(),
        date,
        voucherNo,
        narration: narr + ' [Adjusted]',
        type: 'Journal',
        amount: amt.toFixed(2),
        preparedBy: '',
        departmentId: '',
        isBudget: false,
        allRows: []
      };

      if (type === 'Charges') {
        // Bank charges debited (Bank decreases, Charges increases)
        // Debit: Charges (By OppLedger), Credit: Bank (To BankLedger)
        newEntry.allRows.push(
          { id: 1, type: 'By', particular: oppLedger.name, debit: amt.toFixed(2), credit: '' },
          { id: 2, type: 'To', particular: bankLedger.name, debit: '', credit: amt.toFixed(2) }
        );
      } else {
        // Interest credited (Bank increases, Interest increases)
        // Debit: Bank (By BankLedger), Credit: Interest (To OppLedger)
        newEntry.allRows.push(
          { id: 1, type: 'By', particular: bankLedger.name, debit: amt.toFixed(2), credit: '' },
          { id: 2, type: 'To', particular: oppLedger.name, debit: '', credit: amt.toFixed(2) }
        );
      }

      postedEntries.push(newEntry);
      showToast(`Adjustment posted: Voucher "${voucherNo}"`, 'success');
      
      close();
      renderActiveSubtab();
      refreshAllReports();
      triggerAutoBackup();
    });
  }


  // ===================================================================
  //  3. CASHBOOK (CASH RECEIPTS & PAYMENTS) VIEW
  // ===================================================================
  function renderCashbookView(target, controls, actionsArea) {
    // Select all CCE (Cash and Cash Equivalents) ledger accounts
    const cceAccounts = coaLedgers.filter(l => l.type === 'ledger' && l.sgId === 'sg-cce');

    if (cceAccounts.length === 0) {
      if (actionsArea) actionsArea.innerHTML = '';
      if (controls) controls.innerHTML = '';
      target.innerHTML = `
        <div style="padding: 48px; text-align: center; border: 1.5px dashed var(--slate-200); border-radius: 16px; background: var(--slate-50);">
          <div style="font-size: 32px; margin-bottom: 12px;">💸</div>
          <div style="font-size: 14.5px; font-weight: 700; color: var(--slate-700);">No Cash/Bank Accounts defined</div>
          <div style="font-size: 12.5px; color: var(--slate-400); margin-top: 4px;">Please create a Cash or Bank account in the Chart of Accounts first.</div>
        </div>
      `;
      return;
    }

    if (!_clCashbookAccountId) {
      _clCashbookAccountId = cceAccounts[0].id.toString();
    }

    const selectedLedger = cceAccounts.find(l => l.id.toString() === _clCashbookAccountId) || cceAccounts[0];

    // Compute Opening Balance before period and matching transactions inside the period
    const fromVal = _clCashflowDateFrom;
    const toVal = _clCashflowDateTo;

    // Retrieve ledger balance metrics
    const balData = calculateLedgerBalances(selectedLedger, fromVal, toVal);
    const openingBal = balData.openingBalance;
    const closingBal = balData.closingBalance;

    // Filter transactions
    const cbLines = [];
    postedEntries.forEach(entry => {
      if (fromVal && entry.date < fromVal) return;
      if (toVal && entry.date > toVal) return;

      (entry.allRows || []).forEach(row => {
        if (row.particular.trim() === selectedLedger.name.trim()) {
          const dr = parseFloat(row.debit) || 0;
          const cr = parseFloat(row.credit) || 0;

          cbLines.push({
            id: entry.id,
            date: entry.date,
            voucherNo: entry.voucherNo || '—',
            opposite: getOppositeParticulars(entry, selectedLedger.name, dr > 0),
            narration: entry.narration || '',
            receipt: dr,
            payment: cr
          });
        }
      });
    });

    // Sort entries chronologically (oldest first for running cashbook layout)
    cbLines.sort((a, b) => a.date.localeCompare(b.date));

    // Build rows with running balance
    let rowsHtml = `
      <tr style="background:#fafbfc; font-weight: 700;">
        <td colspan="4">Opening Balance</td>
        <td class="num-val">—</td>
        <td class="num-val">—</td>
        <td class="num-val" style="color:var(--slate-800);">${fmtAmt(openingBal)}</td>
      </tr>
    `;

    let runningBal = openingBal;
    cbLines.forEach((line) => {
      runningBal = runningBal + line.receipt - line.payment;
      rowsHtml += `
        <tr>
          <td>${line.date}</td>
          <td>
            <span style="font-family: monospace; font-weight: 700; color: var(--slate-700); cursor:pointer; text-decoration:underline dotted;" 
                  onclick="window.viewVoucherFromStatement(${line.id})" title="Click to view voucher">${line.voucherNo}</span>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--slate-800);">${ohEsc(line.opposite)}</div>
            ${line.narration ? `<div style="font-size: 11.5px; color: var(--slate-400); font-weight: 500; margin-top: 2px;">${ohEsc(line.narration)}</div>` : ''}
          </td>
          <td style="text-align: center;">
            ${line.receipt > 0 
              ? `<span class="cl-badge reconciled" style="font-size:10px;">Receipt</span>` 
              : `<span class="cl-badge unreconciled" style="font-size:10px; background:#fef2f2; color:#ef4444; border-color:#fee2e2;">Payment</span>`
            }
          </td>
          <td class="num-val" style="color: var(--emerald-600);">${line.receipt > 0 ? fmtAmt(line.receipt) : '—'}</td>
          <td class="num-val" style="color: var(--red-600);">${line.payment > 0 ? fmtAmt(line.payment) : '—'}</td>
          <td class="num-val">${fmtAmt(runningBal)}</td>
        </tr>
      `;
    });

    // Set Actions in Card Header
    if (actionsArea) {
      actionsArea.innerHTML = `
        <button class="btn btn-success" id="btnClRecordReceipt" style="height: 32px; font-size: 12.5px; padding: 0 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
          ＋ Receipt
        </button>
        <button class="btn btn-danger" id="btnClRecordPayment" style="height: 32px; font-size: 12.5px; padding: 0 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
          － Payment
        </button>
      `;
      document.getElementById('btnClRecordReceipt').addEventListener('click', () => {
        showFastEntryModal('Receipt', selectedLedger);
      });
      document.getElementById('btnClRecordPayment').addEventListener('click', () => {
        showFastEntryModal('Payment', selectedLedger);
      });
    }

    // Set Controls in Sub-Header
    if (controls) {
      controls.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: center;">
          <select id="clCbSelectAccount" class="je-input" style="height: 34px; font-size: 13px; padding: 0 8px; cursor: pointer; background: #fff; border-radius: 6px; width: 140px;">
            ${cceAccounts.map(a => `<option value="${a.id}" ${a.id.toString() === selectedLedger.id.toString() ? 'selected' : ''}>${ohEsc(a.name)}</option>`).join('')}
          </select>
          <input type="date" id="clCbFromDate" class="je-input" value="${fromVal}" style="height: 34px; font-size: 13px; padding: 0 8px; border-radius: 6px; width: 120px;" />
          <input type="date" id="clCbToDate" class="je-input" value="${toVal}" style="height: 34px; font-size: 13px; padding: 0 8px; border-radius: 6px; width: 120px;" />
        </div>
      `;
      document.getElementById('clCbSelectAccount').addEventListener('change', (e) => {
        _clCashbookAccountId = e.target.value;
        renderActiveSubtab();
      });
      document.getElementById('clCbFromDate').addEventListener('change', (e) => {
        _clCashflowDateFrom = e.target.value;
        syncGlobalDates(_clCashflowDateFrom, _clCashflowDateTo);
        renderActiveSubtab();
      });
      document.getElementById('clCbToDate').addEventListener('change', (e) => {
        _clCashflowDateTo = e.target.value;
        syncGlobalDates(_clCashflowDateFrom, _clCashflowDateTo);
        renderActiveSubtab();
      });
    }

    // Main Sub-Content
    target.innerHTML = `
      <div class="recon-stats" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 20px; padding: 12px 16px;">
        <div class="recon-stat-card">
          <span class="recon-stat-label">Opening Balance</span>
          <span class="recon-stat-val">${fmtAmt(openingBal)}</span>
        </div>
        <div class="recon-stat-card">
          <span class="recon-stat-label">Net Period Change</span>
          <span class="recon-stat-val" style="color: ${closingBal >= openingBal ? 'var(--emerald-600)' : 'var(--red-600)'};">
            ${fmtAmt(closingBal - openingBal)}
          </span>
        </div>
        <div class="recon-stat-card">
          <span class="recon-stat-label">Closing Balance</span>
          <span class="recon-stat-val" style="color:var(--blue-700);">${fmtAmt(closingBal)}</span>
        </div>
      </div>

      <div style="border: 1.5px solid var(--slate-200); border-radius: 12px; max-height: 480px; overflow-y: auto; background: #fff;">
        <table class="cl-table">
          <thead>
            <tr>
              <th style="width: 100px;">Date</th>
              <th style="width: 100px;">Voucher</th>
              <th>Opposite Account / Description</th>
              <th style="width: 90px; text-align: center;">Type</th>
              <th style="text-align: right; width: 120px;">Receipt (Dr)</th>
              <th style="text-align: right; width: 120px;">Payment (Cr)</th>
              <th style="text-align: right; width: 130px;">Running Bal</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // ── Modal for Rapid Cash Receipts / Payments ──────────────────────
  function showFastEntryModal(type, targetLedger) {
    // Select all ledgers except CCE to act as counterparty
    const oppOpts = coaLedgers.filter(l => l.type === 'ledger' && l.sgId !== 'sg-cce')
      .map(l => `<option value="${l.id}">${ohEsc(l.name)} (${getLedgerGroup(l.id)})</option>`)
      .join('');

    document.getElementById('clFastModalOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'clFastModalOverlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10006;
      background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(5px);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-main), Inter, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="background: #fff; border-radius: 20px; padding: 28px; width: 92%; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; box-sizing: border-box;">
        <button id="clFastModalClose" style="position: absolute; top: 18px; right: 18px; border: none; background: none; font-size: 22px; color: var(--slate-400); cursor: pointer;">×</button>
        
        <h3 style="margin: 0 0 4px 0; font-size: 17px; font-weight: 800; color: var(--slate-900);">Record Cash ${type}</h3>
        <p style="margin: 0 0 20px 0; font-size: 12.5px; color: var(--slate-400);">Select the account and enter amount. Balanced journal entries will be generated.</p>
        
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="cl-form-group">
            <label>Date</label>
            <input type="date" id="clFDate" class="je-input" value="${new Date().toISOString().split('T')[0]}" style="height: 38px;" />
          </div>
          
          <div class="cl-form-group">
            <label>Amount (₹) *</label>
            <input type="number" step="0.01" min="0" id="clFAmount" class="je-input" placeholder="0.00" style="height: 38px;" />
          </div>
          
          <div class="cl-form-group">
            <label>Account (Particulars) *</label>
            <select id="clFOppLedgerId" class="je-input" style="height: 38px; cursor: pointer; background: #fff;">
              ${oppOpts}
            </select>
          </div>
          
          <div class="cl-form-group">
            <label>Narration / Description</label>
            <input type="text" id="clFNarration" class="je-input" placeholder="e.g. Cash received from customer" style="height: 38px;" />
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end;">
          <button class="btn btn-secondary" id="clFastModalCancel" style="padding: 10px 18px;">Cancel</button>
          <button class="btn btn-primary" id="clFastModalSave" style="padding: 10px 18px;">Save Entry</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#clFastModalClose').addEventListener('click', close);
    overlay.querySelector('#clFastModalCancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    // Save direct cash entry
    overlay.querySelector('#clFastModalSave').addEventListener('click', () => {
      const date = overlay.querySelector('#clFDate').value;
      const amt = parseFloat(overlay.querySelector('#clFAmount').value) || 0;
      const oppId = Number(overlay.querySelector('#clFOppLedgerId').value);
      const narr = overlay.querySelector('#clFNarration').value.trim();

      if (amt <= 0) {
        showToast('Please enter a valid amount.', 'warning');
        return;
      }

      const oppLedger = coaLedgers.find(l => l.id === oppId);
      if (!oppLedger) return;

      const voucherNo = genVoucherNo();
      jvCounter++; // Increment globally exported voucher number count

      const newEntry = {
        id: Date.now(),
        date,
        voucherNo,
        narration: narr ? `${narr} [Cashbook]` : `Cashbook ${type}`,
        type: 'Journal',
        amount: amt.toFixed(2),
        preparedBy: '',
        departmentId: '',
        isBudget: false,
        allRows: []
      };

      if (type === 'Receipt') {
        // Cash Receipt: Cash increases (Dr Cash), Counterparty decreases/revenue increases (Cr OppLedger)
        // Debit: Cash (By TargetLedger), Credit: Counterparty (To OppLedger)
        newEntry.allRows.push(
          { id: 1, type: 'By', particular: targetLedger.name, debit: amt.toFixed(2), credit: '' },
          { id: 2, type: 'To', particular: oppLedger.name, debit: '', credit: amt.toFixed(2) }
        );
      } else {
        // Cash Payment: Counterparty increases/expense increases (Dr OppLedger), Cash decreases (Cr TargetLedger)
        // Debit: Counterparty (By OppLedger), Credit: Cash (To TargetLedger)
        newEntry.allRows.push(
          { id: 1, type: 'By', particular: oppLedger.name, debit: amt.toFixed(2), credit: '' },
          { id: 2, type: 'To', particular: targetLedger.name, debit: '', credit: amt.toFixed(2) }
        );
      }

      postedEntries.push(newEntry);
      showToast(`Entry saved successfully. Voucher: ${voucherNo}`, 'success');
      
      close();
      renderActiveSubtab();
      refreshAllReports();
      triggerAutoBackup();
    });
  }


  // ===================================================================
  //  4. CASHFLOW STATEMENT VIEW
  // ===================================================================
  function renderCashflowView(target) {
    const fromVal = _clCashflowDateFrom;
    const toVal = _clCashflowDateTo;

    // Helper to calculate subgroup changes
    function getSubgroupBalDiff(sgId) {
      let totalChange = 0;
      const ledgers = coaLedgers.filter(l => l.type === 'ledger' && l.sgId === sgId);
      
      ledgers.forEach(l => {
        const preBal = calculateLedgerBalances(l, '2024-04-01', fromVal ? getDayBefore(fromVal) : '');
        const currentBal = calculateLedgerBalances(l, '2024-04-01', toVal);
        
        // Net change in closing balances
        const diff = currentBal.closingBalance - preBal.closingBalance;
        totalChange += diff;
      });
      return totalChange;
    }

    function getDayBefore(dateStr) {
      const d = new Date(dateStr);
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    }

    // ── 1. OPERATING ACTIVITIES ──
    const netProfit = calculatePnlProfitForPeriod(fromVal, toVal);
    
    // Non-Cash adjustments
    const depreciation = getSubgroupBalDiff('sg-da'); // Depreciation (Dr balance increase is positive change)
    const financeCosts = getSubgroupBalDiff('sg-fc'); // Finance costs (interest)
    
    const operatingProfitBeforeWC = netProfit + depreciation + financeCosts;

    // Working Capital adjustments
    const inventoriesChange = getSubgroupBalDiff('sg-inv');     // Increase in Asset = Outflow (-)
    const receivablesChange = getSubgroupBalDiff('sg-tr');       // Increase in Asset = Outflow (-)
    const stLoansAdvancesChange = getSubgroupBalDiff('sg-stla'); // Increase in Asset = Outflow (-)
    const otherCurrentAssetsChange = getSubgroupBalDiff('sg-oca'); // Increase in Asset = Outflow (-)

    const payablesChange = getSubgroupBalDiff('sg-tp');         // Increase in Liability = Inflow (+)
    const otherCurrentLiabilitiesChange = getSubgroupBalDiff('sg-ocl'); // Increase in Liability = Inflow (+)
    const shortTermProvisionsChange = getSubgroupBalDiff('sg-stp'); // Increase in Liability = Inflow (+)

    const wcChangesOutflow = -inventoriesChange - receivablesChange - stLoansAdvancesChange - otherCurrentAssetsChange;
    const wcChangesInflow = payablesChange + otherCurrentLiabilitiesChange + shortTermProvisionsChange;
    
    const cashGeneratedFromOperations = operatingProfitBeforeWC + wcChangesOutflow + wcChangesInflow;

    const taxesPaid = getSubgroupBalDiff('sg-tax'); // Tax Expense
    const netOperatingCash = cashGeneratedFromOperations - taxesPaid;

    // ── 2. INVESTING ACTIVITIES ──
    const ppeChange = getSubgroupBalDiff('sg-ppe');
    const cwipChange = getSubgroupBalDiff('sg-cwip');
    const iaChange = getSubgroupBalDiff('sg-ia');
    const iaudChange = getSubgroupBalDiff('sg-iaud');
    const nciChange = getSubgroupBalDiff('sg-nci');

    // Increase in long-term assets / investments = Outflow (-)
    const netInvestingCash = -ppeChange - cwipChange - iaChange - iaudChange - nciChange;

    // ── 3. FINANCING ACTIVITIES ──
    const shareCapitalChange = getSubgroupBalDiff('sg-sc');  // Increase in Equity = Inflow (+)
    const ltBorrowingsChange = getSubgroupBalDiff('sg-ltb');  // Increase in Loan = Inflow (+)
    const stBorrowingsChange = getSubgroupBalDiff('sg-stb');  // Increase in Loan = Inflow (+)
    const reservesSurplusChange = getSubgroupBalDiff('sg-rs'); // reserves changes (excluding Profit/Loss additions)
    
    const interestPaid = getSubgroupBalDiff('sg-fc'); // Interest Expense

    const netFinancingCash = shareCapitalChange + ltBorrowingsChange + stBorrowingsChange + reservesSurplusChange - interestPaid;

    // ── RECONCILIATION OF CASH AND CASH EQUIVALENTS ──
    const netIncrease = netOperatingCash + netInvestingCash + netFinancingCash;

    // Beginning and Ending Cash balances
    let beginningCash = 0;
    let endingCash = 0;

    const cashLedgers = coaLedgers.filter(l => l.type === 'ledger' && l.sgId === 'sg-cce');
    cashLedgers.forEach(l => {
      const preData = calculateLedgerBalances(l, '2024-04-01', fromVal ? getDayBefore(fromVal) : '');
      const postData = calculateLedgerBalances(l, '2024-04-01', toVal);
      beginningCash += preData.closingBalance;
      endingCash += postData.closingBalance;
    });

    const cashReconDiff = endingCash - (beginningCash + netIncrease);

    target.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: flex-end; margin-bottom: 20px; border-bottom: 1.5px solid var(--slate-100); padding-bottom: 14px;">
        <div class="cl-form-group" style="margin-bottom: 0;">
          <label style="font-size: 11px; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">From Date</label>
          <input type="date" id="clCfFromDate" class="je-input" value="${fromVal}" style="height: 34px; font-size: 13px; padding: 0 8px; border-radius: 6px; width: 130px; margin-top: 4px;" />
        </div>
        <div class="cl-form-group" style="margin-bottom: 0;">
          <label style="font-size: 11px; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">To Date</label>
          <input type="date" id="clCfToDate" class="je-input" value="${toVal}" style="height: 34px; font-size: 13px; padding: 0 8px; border-radius: 6px; width: 130px; margin-top: 4px;" />
        </div>
      </div>

      <div style="border: 1.5px solid var(--slate-200); border-radius: 16px; overflow: hidden; background: #fff; box-shadow: var(--shadow-sm);">
        <table class="cl-table">
          <thead>
            <tr>
              <th>Cash Flow Particulars</th>
              <th style="text-align: right; width: 220px;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <!-- Operating Activities -->
            <tr class="cashflow-cat-hdr">
              <td colspan="2">A. Cash Flow from Operating Activities</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Net Profit Before Tax & Extraordinary Items</td>
              <td class="num-val">${fmtAmt(netProfit)}</td>
            </tr>
            <tr>
              <td class="cashflow-line-item">Adjustment: Add back Depreciation & Amortization</td>
              <td class="num-val">${fmtAmt(depreciation)}</td>
            </tr>
            <tr>
              <td class="cashflow-line-item">Adjustment: Add back Interest Expense (Finance Costs)</td>
              <td class="num-val">${fmtAmt(financeCosts)}</td>
            </tr>
            <tr style="font-weight:600; color:var(--slate-800);">
              <td class="cashflow-subcat-hdr">Operating Profit before Working Capital Changes</td>
              <td class="num-val">${fmtAmt(operatingProfitBeforeWC)}</td>
            </tr>
            <tr>
              <td class="cashflow-line-item">Decrease / (Increase) in Inventories</td>
              <td class="num-val">${fmtAmt(-inventoriesChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-line-item">Decrease / (Increase) in Trade Receivables</td>
              <td class="num-val">${fmtAmt(-receivablesChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-line-item">Decrease / (Increase) in Supplier Advances & Current Assets</td>
              <td class="num-val">${fmtAmt(-stLoansAdvancesChange - otherCurrentAssetsChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-line-item">Increase / (Decrease) in Trade Payables</td>
              <td class="num-val">${fmtAmt(payablesChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-line-item">Increase / (Decrease) in Outstanding liabilities & Current Liabilities</td>
              <td class="num-val">${fmtAmt(otherCurrentLiabilitiesChange + shortTermProvisionsChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-line-item">Less: Taxes Paid directly</td>
              <td class="num-val">${fmtAmt(-taxesPaid)}</td>
            </tr>
            <tr class="cashflow-total-row">
              <td>Net Cash Generated from Operating Activities (A)</td>
              <td class="num-val">${fmtAmt(netOperatingCash)}</td>
            </tr>

            <!-- Investing Activities -->
            <tr class="cashflow-cat-hdr">
              <td colspan="2">B. Cash Flow from Investing Activities</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Purchase / Sale of Property, Plant & Equipment (PPE)</td>
              <td class="num-val">${fmtAmt(-ppeChange - cwipChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Purchase / Sale of Intangible Assets</td>
              <td class="num-val">${fmtAmt(-iaChange - iaudChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Purchase / Sale of Non-Current Investments</td>
              <td class="num-val">${fmtAmt(-nciChange)}</td>
            </tr>
            <tr class="cashflow-total-row">
              <td>Net Cash used in Investing Activities (B)</td>
              <td class="num-val">${fmtAmt(netInvestingCash)}</td>
            </tr>

            <!-- Financing Activities -->
            <tr class="cashflow-cat-hdr">
              <td colspan="2">C. Cash Flow from Financing Activities</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Proceeds from Issue of Share Capital</td>
              <td class="num-val">${fmtAmt(shareCapitalChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Proceeds / (Repayments) of Long-Term Bank Loans</td>
              <td class="num-val">${fmtAmt(ltBorrowingsChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Proceeds / (Repayments) of Short-Term Borrowings</td>
              <td class="num-val">${fmtAmt(stBorrowingsChange)}</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Less: Interest Paid on Loans</td>
              <td class="num-val">${fmtAmt(-interestPaid)}</td>
            </tr>
            <tr class="cashflow-total-row">
              <td>Net Cash generated from Financing Activities (C)</td>
              <td class="num-val">${fmtAmt(netFinancingCash)}</td>
            </tr>

            <!-- Summary Reconciliation -->
            <tr class="cashflow-cat-hdr">
              <td colspan="2">Net Summary Reconciliation</td>
            </tr>
            <tr style="font-weight: 700; color: var(--slate-800);">
              <td>Net Increase / (Decrease) in Cash and Cash Equivalents (A + B + C)</td>
              <td class="num-val">${fmtAmt(netIncrease)}</td>
            </tr>
            <tr>
              <td class="cashflow-subcat-hdr">Add: Cash and Cash Equivalents at the Beginning of the Period</td>
              <td class="num-val">${fmtAmt(beginningCash)}</td>
            </tr>
            <tr class="cashflow-grand-row">
              <td>Cash and Cash Equivalents at the End of the Period</td>
              <td class="num-val">${fmtAmt(endingCash)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${Math.abs(cashReconDiff) > 0.05 
        ? `<div style="margin-top:16px; padding: 12px; background: #fffbeb; border:1px solid #fde68a; border-radius: 8px; color: #b45309; font-size:12.5px; font-weight: 600; text-align: center;">
            ⚠ Warning: Cashflow reconciliation discrepancy of ${fmtAmt(cashReconDiff)}. Check for entries directly matching cash against cash.
           </div>` 
        : `<div style="margin-top:16px; padding: 12px; background: #ecfdf5; border:1px solid #a7f3d0; border-radius: 8px; color: #065f46; font-size:12.5px; font-weight: 700; text-align: center; display:flex; align-items:center; justify-content:center; gap:6px;">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style="color: #059669;">
              <path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Reconciles Perfectly: Net Change + Opening Balance = Ending Balance!
           </div>`
      }
    `;

    // Wire actions
    document.getElementById('clCfFromDate').addEventListener('change', (e) => {
      _clCashflowDateFrom = e.target.value;
      syncGlobalDates(_clCashflowDateFrom, _clCashflowDateTo);
      renderActiveSubtab();
    });

    document.getElementById('clCfToDate').addEventListener('change', (e) => {
      _clCashflowDateTo = e.target.value;
      syncGlobalDates(_clCashflowDateFrom, _clCashflowDateTo);
      renderActiveSubtab();
    });
  }

})();
