/**
 * SpendFlow - Financial Intelligence Expense Tracker
 * Pure Vanilla JavaScript (ES6+, No React, No Libraries)
 */

(function () {
  'use strict';

  // --- Constants & Configurations ---
  const STORAGE_KEYS = {
    TRANSACTIONS: 'spendflow_transactions_v1',
    BUDGET: 'spendflow_budget_v1',
    CURRENCY: 'spendflow_currency_v1',
    THEME: 'spendflow_theme_v1'
  };

  const CURRENCY_MAP = {
    USD: { symbol: '$', code: 'USD', locale: 'en-US' },
    EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
    GBP: { symbol: '£', code: 'GBP', locale: 'en-GB' },
    JPY: { symbol: '¥', code: 'JPY', locale: 'ja-JP' },
    CAD: { symbol: '$', code: 'CAD', locale: 'en-CA' },
    AUD: { symbol: '$', code: 'AUD', locale: 'en-AU' },
    NGN: { symbol: '₦', code: 'NGN', locale: 'en-NG' },
    INR: { symbol: '₹', code: 'INR', locale: 'en-IN' }
  };

  const CATEGORIES = {
    expense: [
      { id: 'Food & Dining', name: 'Food & Dining', icon: '🍔', color: '#f97316' },
      { id: 'Housing & Rent', name: 'Housing & Rent', icon: '🏠', color: '#3b82f6' },
      { id: 'Transportation', name: 'Transportation', icon: '🚗', color: '#06b6d4' },
      { id: 'Shopping', name: 'Shopping & Retail', icon: '🛍️', color: '#ec4899' },
      { id: 'Utilities & Bills', name: 'Utilities & Bills', icon: '💡', color: '#eab308' },
      { id: 'Entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
      { id: 'Healthcare', name: 'Healthcare', icon: '💊', color: '#10b981' },
      { id: 'Education', name: 'Education', icon: '📚', color: '#6366f1' },
      { id: 'Travel', name: 'Travel & Trips', icon: '✈️', color: '#14b8a6' },
      { id: 'Miscellaneous', name: 'Miscellaneous', icon: '📦', color: '#64748b' }
    ],
    income: [
      { id: 'Salary', name: 'Salary & Wages', icon: '💼', color: '#10b981' },
      { id: 'Freelance', name: 'Freelance & Contract', icon: '💻', color: '#3b82f6' },
      { id: 'Investments', name: 'Investments & Stocks', icon: '📈', color: '#8b5cf6' },
      { id: 'Business', name: 'Business Profits', icon: '🏢', color: '#6366f1' },
      { id: 'Rental Income', name: 'Rental Property', icon: '🔑', color: '#f59e0b' },
      { id: 'Bonus & Gifts', name: 'Bonus & Gifts', icon: '🎁', color: '#ec4899' },
      { id: 'Other Income', name: 'Other Income', icon: '💰', color: '#14b8a6' }
    ]
  };

  // Seed sample transactions if starting empty
  const SAMPLE_TRANSACTIONS = [
    {
      id: 'tx-seed-1',
      type: 'income',
      title: 'Principal Software Salary',
      amount: 5200.00,
      category: 'Salary',
      method: 'Bank',
      date: getRelativeDate(0),
      tag: 'Monthly payroll'
    },
    {
      id: 'tx-seed-2',
      type: 'expense',
      title: 'Modern Apartment Rent',
      amount: 1450.00,
      category: 'Housing & Rent',
      method: 'Bank',
      date: getRelativeDate(-2),
      tag: 'Downtown apartment'
    },
    {
      id: 'tx-seed-3',
      type: 'expense',
      title: 'Organic Whole Foods Market',
      amount: 168.50,
      category: 'Food & Dining',
      method: 'Card',
      date: getRelativeDate(-3),
      tag: 'Weekly groceries'
    },
    {
      id: 'tx-seed-4',
      type: 'income',
      title: 'UI Design Freelance Milestone',
      amount: 1100.00,
      category: 'Freelance',
      method: 'PayPal',
      date: getRelativeDate(-5),
      tag: 'Client project'
    },
    {
      id: 'tx-seed-5',
      type: 'expense',
      title: 'Electric & Fiber Internet',
      amount: 135.20,
      category: 'Utilities & Bills',
      method: 'Card',
      date: getRelativeDate(-6),
      tag: 'Monthly utility bundle'
    },
    {
      id: 'tx-seed-6',
      type: 'expense',
      title: 'Cinema & Weekend Dinner',
      amount: 94.00,
      category: 'Entertainment',
      method: 'Card',
      date: getRelativeDate(-8),
      tag: 'Date night'
    },
    {
      id: 'tx-seed-7',
      type: 'expense',
      title: 'Metro Pass & Fuel Recharge',
      amount: 85.00,
      category: 'Transportation',
      method: 'Card',
      date: getRelativeDate(-11),
      tag: 'Commute'
    },
    {
      id: 'tx-seed-8',
      type: 'income',
      title: 'Index Fund Dividends',
      amount: 320.00,
      category: 'Investments',
      method: 'Bank',
      date: getRelativeDate(-14),
      tag: 'Q3 Payout'
    }
  ];

  function getRelativeDate(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  // --- Application State ---
  const state = {
    transactions: [],
    monthlyBudget: 2500,
    currency: 'USD',
    theme: 'dark-theme',
    filters: {
      type: 'all',
      category: 'all',
      search: '',
      sort: 'date-desc',
      timeframe: 'all'
    }
  };

  // --- DOM Element References ---
  const DOM = {
    // Header & Controls
    currencySelector: document.getElementById('currency-selector'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIconDark: document.querySelector('.theme-icon-dark'),
    themeIconLight: document.querySelector('.theme-icon-light'),
    openAddModalBtn: document.getElementById('open-add-modal-btn'),

    // Summary Stat Cards
    totalBalanceDisplay: document.getElementById('total-balance-display'),
    totalIncomeDisplay: document.getElementById('total-income-display'),
    totalExpenseDisplay: document.getElementById('total-expense-display'),
    incomeCountDisplay: document.getElementById('income-count-display'),
    expenseCountDisplay: document.getElementById('expense-count-display'),
    netRatioBadge: document.getElementById('net-ratio-badge'),
    balanceMeterFill: document.getElementById('balance-meter-fill'),
    balanceStatusText: document.getElementById('balance-status-text'),

    // Monthly Budget Card
    budgetSpentRatio: document.getElementById('budget-spent-ratio'),
    budgetProgressBar: document.getElementById('budget-progress-bar'),
    budgetRemainingText: document.getElementById('budget-remaining-text'),
    budgetPercentText: document.getElementById('budget-percent-text'),
    editBudgetBtn: document.getElementById('edit-budget-btn'),

    // Chart Canvas Elements
    categoryCanvas: document.getElementById('category-doughnut-canvas'),
    categoryLegend: document.getElementById('category-legend-list'),
    chartCenterAmount: document.getElementById('chart-center-amount'),
    cashflowCanvas: document.getElementById('cashflow-bar-canvas'),
    timePills: document.querySelectorAll('.pill-btn'),

    // Transactions Toolbar & Table
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    categoryFilter: document.getElementById('category-filter'),
    sortSelector: document.getElementById('sort-selector'),
    transactionsCountBadge: document.getElementById('transactions-count-badge'),
    transactionsList: document.getElementById('transactions-list'),
    emptyState: document.getElementById('empty-state'),
    emptyAddBtn: document.getElementById('empty-add-btn'),
    emptySampleBtn: document.getElementById('empty-sample-btn'),
    exportCsvBtn: document.getElementById('export-csv-btn'),
    loadSampleBtn: document.getElementById('load-sample-btn'),
    clearAllBtn: document.getElementById('clear-all-btn'),

    // Transaction Modal
    transactionModal: document.getElementById('transaction-modal'),
    modalHeading: document.getElementById('modal-heading'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    transactionForm: document.getElementById('transaction-form'),
    entryId: document.getElementById('entry-id'),
    typeExpenseRadio: document.getElementById('type-expense'),
    typeIncomeRadio: document.getElementById('type-income'),
    entryTitle: document.getElementById('entry-title'),
    entryAmount: document.getElementById('entry-amount'),
    entryCategory: document.getElementById('entry-category'),
    entryMethod: document.getElementById('entry-method'),
    entryDate: document.getElementById('entry-date'),
    entryTag: document.getElementById('entry-tag'),
    modalCurrencySymbol: document.getElementById('modal-currency-symbol'),
    titleError: document.getElementById('title-error'),
    amountError: document.getElementById('amount-error'),
    dateError: document.getElementById('date-error'),

    // Budget Modal
    budgetModal: document.getElementById('budget-modal'),
    budgetCloseBtn: document.getElementById('budget-close-btn'),
    budgetCancelBtn: document.getElementById('budget-cancel-btn'),
    budgetForm: document.getElementById('budget-form'),
    budgetInput: document.getElementById('budget-input'),
    budgetCurrencySymbol: document.getElementById('budget-currency-symbol'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // --- Initializer ---
  function initApp() {
    loadSettingsFromStorage();
    loadTransactionsFromStorage();

    populateCategoryDropdown(DOM.entryCategory, 'expense');
    populateFilterCategories();

    setupEventListeners();
    updateThemeUI();
    renderAll();
  }

  // --- Storage Functions ---
  function loadSettingsFromStorage() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme) {
        state.theme = savedTheme;
      } else {
        // Detect OS preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
          state.theme = 'light-theme';
        }
      }

      const savedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (savedCurrency && CURRENCY_MAP[savedCurrency]) {
        state.currency = savedCurrency;
      }
      DOM.currencySelector.value = state.currency;

      const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (savedBudget && !isNaN(parseFloat(savedBudget))) {
        state.monthlyBudget = parseFloat(savedBudget);
      }
    } catch (err) {
      console.warn('Storage read warning:', err);
    }
  }

  function loadTransactionsFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) {
        state.transactions = JSON.parse(data);
      } else {
        // Preload sample transactions so UI looks vibrant initially
        state.transactions = [...SAMPLE_TRANSACTIONS];
        saveTransactionsToStorage();
      }
    } catch (err) {
      console.warn('Could not parse stored transactions:', err);
      state.transactions = [...SAMPLE_TRANSACTIONS];
    }
  }

  function saveTransactionsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
    } catch (err) {
      console.error('Failed to save transactions:', err);
      showToast('Storage error: could not save data.', 'error');
    }
  }

  function saveSettingsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
      localStorage.setItem(STORAGE_KEYS.CURRENCY, state.currency);
      localStorage.setItem(STORAGE_KEYS.BUDGET, state.monthlyBudget.toString());
    } catch (err) {
      console.warn('Could not save settings:', err);
    }
  }

  // --- Helper & Utility Functions ---
  function formatMoney(amount) {
    const config = CURRENCY_MAP[state.currency] || CURRENCY_MAP.USD;
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return config.symbol + Number(amount).toFixed(2);
    }
  }

  function getCurrencySymbol() {
    return (CURRENCY_MAP[state.currency] || CURRENCY_MAP.USD).symbol;
  }

  function getCategoryMeta(type, categoryName) {
    const list = CATEGORIES[type] || [];
    const found = list.find(item => item.id === categoryName || item.name === categoryName);
    if (found) return found;

    // Fallback search in all categories
    const all = [...CATEGORIES.expense, ...CATEGORIES.income];
    const anyFound = all.find(item => item.id === categoryName || item.name === categoryName);
    return anyFound || { id: categoryName, name: categoryName, icon: '🏷️', color: '#6366f1' };
  }

  function formatDateFriendly(dateString) {
    if (!dateString) return '—';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function generateId() {
    return 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  }

  // --- UI Update & Theme Logic ---
  function updateThemeUI() {
    document.body.className = state.theme;
    if (state.theme === 'dark-theme') {
      DOM.themeIconDark.style.display = 'block';
      DOM.themeIconLight.style.display = 'none';
    } else {
      DOM.themeIconDark.style.display = 'none';
      DOM.themeIconLight.style.display = 'block';
    }
    // Redraw charts with adapted contrast
    renderCharts();
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    saveSettingsToStorage();
    updateThemeUI();
  }

  function populateCategoryDropdown(selectElement, type, selectedValue = '') {
    const list = CATEGORIES[type] || [];
    selectElement.innerHTML = '';
    list.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.icon} ${item.name}`;
      if (item.id === selectedValue) opt.selected = true;
      selectElement.appendChild(opt);
    });
  }

  function populateFilterCategories() {
    DOM.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    const combined = [...CATEGORIES.expense, ...CATEGORIES.income];
    combined.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.icon} ${cat.name}`;
      DOM.categoryFilter.appendChild(opt);
    });
  }

  // --- Filtering & Sorting ---
  function getFilteredTransactions() {
    return state.transactions.filter(item => {
      // Type filter
      if (state.filters.type !== 'all' && item.type !== state.filters.type) {
        return false;
      }

      // Category filter
      if (state.filters.category !== 'all' && item.category !== state.filters.category) {
        return false;
      }

      // Search query (title, category, tag, method)
      if (state.filters.search.trim() !== '') {
        const query = state.filters.search.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const tagMatch = item.tag && item.tag.toLowerCase().includes(query);
        const catMatch = item.category.toLowerCase().includes(query);
        const methodMatch = item.method && item.method.toLowerCase().includes(query);
        if (!titleMatch && !tagMatch && !catMatch && !methodMatch) {
          return false;
        }
      }

      // Timeframe filter (for trends pill)
      if (state.filters.timeframe === 'month') {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const itemDate = new Date(item.date);
        if (itemDate.getFullYear() !== currentYear || itemDate.getMonth() !== currentMonth) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (state.filters.sort) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  }

  // --- Primary Render Controller ---
  function renderAll() {
    renderSummaryCards();
    renderBudgetCard();
    renderTransactionsTable();
    renderCharts();
  }

  // --- Render Summary Stat Cards ---
  function renderSummaryCards() {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    state.transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += Number(t.amount);
        incomeCount++;
      } else if (t.type === 'expense') {
        totalExpense += Number(t.amount);
        expenseCount++;
      }
    });

    const netBalance = totalIncome - totalExpense;

    DOM.totalBalanceDisplay.textContent = formatMoney(netBalance);
    DOM.totalIncomeDisplay.textContent = formatMoney(totalIncome);
    DOM.totalExpenseDisplay.textContent = formatMoney(totalExpense);

    DOM.incomeCountDisplay.textContent = `${incomeCount} ${incomeCount === 1 ? 'entry' : 'entries'}`;
    DOM.expenseCountDisplay.textContent = `${expenseCount} ${expenseCount === 1 ? 'entry' : 'entries'}`;

    // Net savings ratio
    if (totalIncome > 0) {
      const ratio = Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
      DOM.netRatioBadge.textContent = `${ratio >= 0 ? '+' : ''}${ratio}% Saved`;
      if (ratio >= 20) {
        DOM.balanceStatusText.textContent = 'Excellent Savings Rate';
        DOM.balanceMeterFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
      } else if (ratio >= 0) {
        DOM.balanceStatusText.textContent = 'Stable Positive Flow';
        DOM.balanceMeterFill.style.background = 'linear-gradient(90deg, #6366f1, #8b5cf6)';
      } else {
        DOM.balanceStatusText.textContent = 'Deficit: Spending > Income';
        DOM.balanceMeterFill.style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
      }
      const fillPct = Math.min(Math.max((ratio + 50), 5), 100);
      DOM.balanceMeterFill.style.width = fillPct + '%';
    } else {
      DOM.netRatioBadge.textContent = totalExpense > 0 ? '-100% Flow' : '0% Flow';
      DOM.balanceStatusText.textContent = totalExpense > 0 ? 'No income logged' : 'Ready for entries';
      DOM.balanceMeterFill.style.width = totalExpense > 0 ? '10%' : '50%';
    }
  }

  // --- Render Monthly Budget Card ---
  function renderBudgetCard() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Sum expenses for current month
    const currentMonthExpenses = state.transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const budget = state.monthlyBudget;
    const spentPercent = budget > 0 ? Math.round((currentMonthExpenses / budget) * 100) : 0;
    const remaining = budget - currentMonthExpenses;

    DOM.budgetSpentRatio.textContent = `${formatMoney(currentMonthExpenses)} / ${formatMoney(budget)}`;
    DOM.budgetProgressBar.style.width = Math.min(spentPercent, 100) + '%';
    DOM.budgetPercentText.textContent = `${spentPercent}%`;

    if (remaining >= 0) {
      DOM.budgetRemainingText.textContent = `Remaining: ${formatMoney(remaining)}`;
    } else {
      DOM.budgetRemainingText.textContent = `Over budget: ${formatMoney(Math.abs(remaining))}`;
    }

    // Dynamic bar color depending on budget health
    if (spentPercent < 70) {
      DOM.budgetProgressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    } else if (spentPercent <= 95) {
      DOM.budgetProgressBar.style.background = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    } else {
      DOM.budgetProgressBar.style.background = 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)';
    }
  }

  // --- Render Transactions Table ---
  function renderTransactionsTable() {
    const list = getFilteredTransactions();

    DOM.transactionsCountBadge.textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'}`;

    if (list.length === 0) {
      DOM.transactionsList.innerHTML = '';
      DOM.emptyState.style.display = 'flex';
      return;
    }

    DOM.emptyState.style.display = 'none';

    let html = '';
    list.forEach(tx => {
      const isIncome = tx.type === 'income';
      const meta = getCategoryMeta(tx.type, tx.category);
      const formattedDate = formatDateFriendly(tx.date);
      const formattedAmt = `${isIncome ? '+' : '-'}${formatMoney(tx.amount)}`;

      html += `
        <tr data-id="${escapeHtml(tx.id)}">
          <td>
            <div class="tx-info-cell">
              <div class="tx-icon-badge" style="background-color: ${meta.color}22; color: ${meta.color}">
                <span>${meta.icon}</span>
              </div>
              <div class="tx-title-group">
                <span class="tx-title">${escapeHtml(tx.title)}</span>
                ${tx.tag ? `<span class="tx-note">${escapeHtml(tx.tag)}</span>` : ''}
              </div>
            </div>
          </td>
          <td>
            <span class="category-tag" style="background-color: ${meta.color}1a; color: ${meta.color}">
              ${escapeHtml(meta.name)}
            </span>
          </td>
          <td>
            <span class="method-tag">
              ${getMethodIcon(tx.method)}
              ${escapeHtml(tx.method || 'Card')}
            </span>
          </td>
          <td>
            <span class="date-text">${formattedDate}</span>
          </td>
          <td class="text-right">
            <span class="amount-text ${isIncome ? 'amount-income' : 'amount-expense'}">
              ${formattedAmt}
            </span>
          </td>
          <td class="text-right">
            <div class="actions-group">
              <button type="button" class="action-btn edit-action" title="Edit entry" data-action="edit" data-id="${escapeHtml(tx.id)}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button type="button" class="action-btn delete-action" title="Delete entry" data-action="delete" data-id="${escapeHtml(tx.id)}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    DOM.transactionsList.innerHTML = html;
  }

  function getMethodIcon(method) {
    switch (method) {
      case 'Bank': return '🏦';
      case 'Cash': return '💵';
      case 'PayPal': return '🅿️';
      case 'Crypto': return '🪙';
      default: return '💳';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Native HTML5 Canvas Charts ---
  function renderCharts() {
    renderCategoryDoughnut();
    renderCashFlowBars();
  }

  /**
   * Crisp High-DPI Category Doughnut Chart
   */
  function renderCategoryDoughnut() {
    const canvas = DOM.categoryCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isDark = state.theme === 'dark-theme';

    // Set resolution for retina displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const size = 280;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    // Aggregate expenses by category
    const categoryTotals = {};
    let totalExpense = 0;

    state.transactions.forEach(t => {
      if (t.type === 'expense') {
        const amt = Number(t.amount);
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
        totalExpense += amt;
      }
    });

    DOM.chartCenterAmount.textContent = formatMoney(totalExpense);

    const categoriesList = Object.keys(categoryTotals).map(catId => {
      const meta = getCategoryMeta('expense', catId);
      return {
        id: catId,
        name: meta.name,
        color: meta.color,
        amount: categoryTotals[catId],
        percent: totalExpense > 0 ? (categoryTotals[catId] / totalExpense) : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    // Populate legend HTML
    DOM.categoryLegend.innerHTML = '';
    if (categoriesList.length === 0) {
      DOM.categoryLegend.innerHTML = `
        <div style="font-size: 0.8125rem; color: ${isDark ? '#64748b' : '#94a3b8'}; padding: 1rem 0;">
          No expense logs found yet.
        </div>
      `;
    } else {
      categoriesList.forEach(item => {
        const pctFormatted = Math.round(item.percent * 100) + '%';
        const el = document.createElement('div');
        el.className = 'legend-item';
        el.innerHTML = `
          <div class="legend-item-left">
            <span class="legend-color-dot" style="background-color: ${item.color}"></span>
            <span class="legend-name">${escapeHtml(item.name)}</span>
          </div>
          <div class="legend-item-right">
            <span>${formatMoney(item.amount)}</span>
            <span class="legend-pct">${pctFormatted}</span>
          </div>
        `;
        DOM.categoryLegend.appendChild(el);
      });
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.44;
    const innerRadius = size * 0.31;

    // Handle empty state ring
    if (totalExpense === 0 || categoriesList.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
      ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
      ctx.closePath();
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
      ctx.fill();
      return;
    }

    // Draw doughnut slices with smooth arc spacing
    let startAngle = -Math.PI / 2;
    const paddingAngle = categoriesList.length > 1 ? 0.03 : 0;

    categoriesList.forEach(item => {
      const sliceAngle = item.percent * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle + paddingAngle / 2, endAngle - paddingAngle / 2);
      ctx.arc(centerX, centerY, innerRadius, endAngle - paddingAngle / 2, startAngle + paddingAngle / 2, true);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.shadowColor = item.color + '40';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      startAngle = endAngle;
    });
  }

  /**
   * Crisp High-DPI Cash Flow Grouped Bar Chart
   */
  function renderCashFlowBars() {
    const canvas = DOM.cashflowCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isDark = state.theme === 'dark-theme';

    const width = 560;
    const height = 260;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Group transactions by recent 6 calendar months
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const monthIndex = d.getMonth();

      months.push({
        year,
        monthIndex,
        label,
        income: 0,
        expense: 0
      });
    }

    state.transactions.forEach(t => {
      const d = new Date(t.date);
      const y = d.getFullYear();
      const m = d.getMonth();

      const bucket = months.find(b => b.year === y && b.monthIndex === m);
      if (bucket) {
        if (t.type === 'income') bucket.income += Number(t.amount);
        else if (t.type === 'expense') bucket.expense += Number(t.amount);
      }
    });

    // Chart dimensions & layout
    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    // Determine max value for Y-axis scaling
    let maxVal = 1000;
    months.forEach(m => {
      if (m.income > maxVal) maxVal = m.income;
      if (m.expense > maxVal) maxVal = m.expense;
    });
    // Add 20% headroom
    maxVal = Math.ceil(maxVal * 1.2 / 500) * 500;

    // Grid lines & Y Axis labels
    const gridCount = 4;
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridCount; i++) {
      const y = paddingTop + (chartH / gridCount) * i;
      const val = maxVal - (maxVal / gridCount) * i;

      // Draw horizontal line
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label text
      const currencySymbol = getCurrencySymbol();
      const labelText = val >= 1000 ? `${currencySymbol}${(val / 1000).toFixed(1)}k` : `${currencySymbol}${val}`;
      ctx.fillText(labelText, paddingLeft - 10, y);
    }

    // Draw Bars for each month
    const groupCount = months.length;
    const groupWidth = chartW / groupCount;
    const barWidth = Math.min(groupWidth * 0.28, 22);

    months.forEach((m, idx) => {
      const groupCenter = paddingLeft + (idx * groupWidth) + (groupWidth / 2);

      // Income bar (Left)
      const incHeight = (m.income / maxVal) * chartH;
      const incX = groupCenter - barWidth - 3;
      const incY = paddingTop + chartH - incHeight;

      // Expense bar (Right)
      const expHeight = (m.expense / maxVal) * chartH;
      const expX = groupCenter + 3;
      const expY = paddingTop + chartH - expHeight;

      // Draw Income Bar
      if (incHeight > 0) {
        drawRoundedBar(ctx, incX, incY, barWidth, incHeight, 4, '#10b981');
      }

      // Draw Expense Bar
      if (expHeight > 0) {
        drawRoundedBar(ctx, expX, expY, barWidth, expHeight, 4, '#f43f5e');
      }

      // Month Label on X Axis
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(m.label, groupCenter, paddingTop + chartH + 12);
    });
  }

  function drawRoundedBar(ctx, x, y, width, height, radius, color) {
    if (height < 2) height = 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  // --- Modal Controllers ---
  function openAddModal() {
    DOM.modalHeading.textContent = 'Add Transaction';
    DOM.entryId.value = '';
    DOM.transactionForm.reset();

    // Default to today's date
    DOM.entryDate.value = new Date().toISOString().split('T')[0];
    DOM.typeExpenseRadio.checked = true;
    populateCategoryDropdown(DOM.entryCategory, 'expense');

    DOM.modalCurrencySymbol.textContent = getCurrencySymbol();
    clearFormErrors();

    DOM.transactionModal.style.display = 'flex';
    DOM.entryTitle.focus();
  }

  function openEditModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    DOM.modalHeading.textContent = 'Edit Transaction';
    DOM.entryId.value = tx.id;

    if (tx.type === 'income') {
      DOM.typeIncomeRadio.checked = true;
      populateCategoryDropdown(DOM.entryCategory, 'income', tx.category);
    } else {
      DOM.typeExpenseRadio.checked = true;
      populateCategoryDropdown(DOM.entryCategory, 'expense', tx.category);
    }

    DOM.entryTitle.value = tx.title;
    DOM.entryAmount.value = tx.amount;
    DOM.entryMethod.value = tx.method || 'Card';
    DOM.entryDate.value = tx.date;
    DOM.entryTag.value = tx.tag || '';

    DOM.modalCurrencySymbol.textContent = getCurrencySymbol();
    clearFormErrors();

    DOM.transactionModal.style.display = 'flex';
    DOM.entryTitle.focus();
  }

  function closeModal() {
    DOM.transactionModal.style.display = 'none';
    clearFormErrors();
  }

  function openBudgetModal() {
    DOM.budgetCurrencySymbol.textContent = getCurrencySymbol();
    DOM.budgetInput.value = state.monthlyBudget;
    DOM.budgetModal.style.display = 'flex';
    DOM.budgetInput.focus();
  }

  function closeBudgetModal() {
    DOM.budgetModal.style.display = 'none';
  }

  function clearFormErrors() {
    DOM.titleError.classList.remove('visible');
    DOM.amountError.classList.remove('visible');
    DOM.dateError.classList.remove('visible');
  }

  function validateTransactionForm() {
    let isValid = true;
    clearFormErrors();

    const title = DOM.entryTitle.value.trim();
    if (!title) {
      DOM.titleError.classList.add('visible');
      isValid = false;
    }

    const amount = parseFloat(DOM.entryAmount.value);
    if (isNaN(amount) || amount <= 0) {
      DOM.amountError.classList.add('visible');
      isValid = false;
    }

    const date = DOM.entryDate.value;
    if (!date) {
      DOM.dateError.classList.add('visible');
      isValid = false;
    }

    return isValid;
  }

  function handleSaveTransaction(e) {
    e.preventDefault();
    if (!validateTransactionForm()) return;

    const id = DOM.entryId.value.trim();
    const type = DOM.typeIncomeRadio.checked ? 'income' : 'expense';
    const title = DOM.entryTitle.value.trim();
    const amount = parseFloat(DOM.entryAmount.value);
    const category = DOM.entryCategory.value;
    const method = DOM.entryMethod.value;
    const date = DOM.entryDate.value;
    const tag = DOM.entryTag.value.trim();

    if (id) {
      // Edit existing
      const idx = state.transactions.findIndex(t => t.id === id);
      if (idx !== -1) {
        state.transactions[idx] = { id, type, title, amount, category, method, date, tag };
        showToast('Transaction updated successfully', 'success');
      }
    } else {
      // Create new
      const newTx = {
        id: generateId(),
        type,
        title,
        amount,
        category,
        method,
        date,
        tag
      };
      state.transactions.unshift(newTx);
      showToast('Transaction recorded successfully', 'success');
    }

    saveTransactionsToStorage();
    closeModal();
    renderAll();
  }

  function handleDeleteTransaction(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    if (confirm(`Are you sure you want to delete "${tx.title}"?`)) {
      state.transactions = state.transactions.filter(t => t.id !== id);
      saveTransactionsToStorage();
      renderAll();
      showToast('Transaction deleted', 'info');
    }
  }

  function handleSaveBudget(e) {
    e.preventDefault();
    const budget = parseFloat(DOM.budgetInput.value);
    if (isNaN(budget) || budget <= 0) {
      alert('Please enter a valid monthly budget limit greater than 0.');
      return;
    }

    state.monthlyBudget = budget;
    saveSettingsToStorage();
    closeBudgetModal();
    renderBudgetCard();
    showToast(`Monthly budget set to ${formatMoney(budget)}`, 'success');
  }

  // --- CSV Export Functionality ---
  function exportTransactionsToCsv() {
    if (state.transactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = ['ID', 'Type', 'Title', 'Amount', 'Currency', 'Category', 'Payment Method', 'Date', 'Note'];
    const rows = state.transactions.map(t => [
      t.id,
      t.type,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      state.currency,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.method || '').replace(/"/g, '""')}"`,
      t.date,
      `"${(t.tag || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendFlow_Transactions_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Transactions exported as CSV', 'success');
  }

  // --- Reset & Sample Data ---
  function handleClearAllData() {
    if (state.transactions.length === 0) {
      showToast('Nothing to clear', 'info');
      return;
    }

    if (confirm('Reset tracker? All transactions will be cleared from local storage.')) {
      state.transactions = [];
      saveTransactionsToStorage();
      renderAll();
      showToast('All transactions cleared', 'info');
    }
  }

  function handleLoadSampleData() {
    state.transactions = [...SAMPLE_TRANSACTIONS];
    saveTransactionsToStorage();
    renderAll();
    showToast('Loaded demo transactions', 'success');
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Theme & Currency Toggles
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    DOM.currencySelector.addEventListener('change', function () {
      state.currency = this.value;
      saveSettingsToStorage();
      renderAll();
      showToast(`Currency changed to ${this.value}`, 'info');
    });

    // Add Modal Triggers
    DOM.openAddModalBtn.addEventListener('click', openAddModal);
    DOM.emptyAddBtn.addEventListener('click', openAddModal);
    DOM.modalCloseBtn.addEventListener('click', closeModal);
    DOM.modalCancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking on backdrop
    DOM.transactionModal.addEventListener('click', function (e) {
      if (e.target === DOM.transactionModal) closeModal();
    });

    // Form Type switcher (Expense vs Income dynamic category update)
    DOM.typeExpenseRadio.addEventListener('change', function () {
      if (this.checked) populateCategoryDropdown(DOM.entryCategory, 'expense');
    });
    DOM.typeIncomeRadio.addEventListener('change', function () {
      if (this.checked) populateCategoryDropdown(DOM.entryCategory, 'income');
    });

    // Form submit
    DOM.transactionForm.addEventListener('submit', handleSaveTransaction);

    // Budget Modal Triggers
    DOM.editBudgetBtn.addEventListener('click', openBudgetModal);
    DOM.budgetCloseBtn.addEventListener('click', closeBudgetModal);
    DOM.budgetCancelBtn.addEventListener('click', closeBudgetModal);
    DOM.budgetModal.addEventListener('click', function (e) {
      if (e.target === DOM.budgetModal) closeBudgetModal();
    });
    DOM.budgetForm.addEventListener('submit', handleSaveBudget);

    // Table Actions (Edit / Delete delegation)
    DOM.transactionsList.addEventListener('click', function (e) {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'edit') {
        openEditModal(id);
      } else if (action === 'delete') {
        handleDeleteTransaction(id);
      }
    });

    // Search input
    DOM.searchInput.addEventListener('input', function () {
      state.filters.search = this.value;
      DOM.clearSearchBtn.style.display = this.value ? 'block' : 'none';
      renderTransactionsTable();
    });

    DOM.clearSearchBtn.addEventListener('click', function () {
      DOM.searchInput.value = '';
      state.filters.search = '';
      this.style.display = 'none';
      renderTransactionsTable();
      DOM.searchInput.focus();
    });

    // Filter Type Tabs
    DOM.filterTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        DOM.filterTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        state.filters.type = this.dataset.filter;
        renderTransactionsTable();
      });
    });

    // Category Filter Dropdown
    DOM.categoryFilter.addEventListener('change', function () {
      state.filters.category = this.value;
      renderTransactionsTable();
    });

    // Sort Dropdown
    DOM.sortSelector.addEventListener('change', function () {
      state.filters.sort = this.value;
      renderTransactionsTable();
    });

    // Timeframe Pills (All Time vs Month)
    DOM.timePills.forEach(pill => {
      pill.addEventListener('click', function () {
        DOM.timePills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        state.filters.timeframe = this.dataset.timeframe;
        renderCharts();
      });
    });

    // Export CSV & Data Tools
    DOM.exportCsvBtn.addEventListener('click', exportTransactionsToCsv);
    DOM.loadSampleBtn.addEventListener('click', handleLoadSampleData);
    DOM.emptySampleBtn.addEventListener('click', handleLoadSampleData);
    DOM.clearAllBtn.addEventListener('click', handleClearAllData);

    // Keyboard Shortcuts (Esc closes modals)
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (DOM.transactionModal.style.display === 'flex') closeModal();
        if (DOM.budgetModal.style.display === 'flex') closeBudgetModal();
      }
    });

    // Responsive Canvas Resize redraw
    window.addEventListener('resize', () => {
      renderCharts();
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
