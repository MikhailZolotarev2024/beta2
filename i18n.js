// Конфигурация
const I18N_CONFIG = {
  DEFAULT_LANG: 'ru',
  CACHE_KEY: 'current_lang',
  SELECTORS: {
    TRANSLATABLE: '[data-i18n]',
    PLACEHOLDER: '[data-i18n-placeholder]'
  }
};

// Состояние
const state = {
  currentLang: localStorage.getItem(I18N_CONFIG.CACHE_KEY) || I18N_CONFIG.DEFAULT_LANG,
  translations: {},
  initialized: false
};

// Утилиты
const utils = {
  getBasePath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? `/${parts[0]}` : '';
  },

  formatNumber(number, decimals = 6) {
    return Number(number).toFixed(decimals);
  },

  formatTokens(tokens) {
    return tokens.map(t => 
      `${t.tokenName}: ${this.formatNumber(t.balance/10**(t.tokenDecimal||6))}`
    ).join(', ');
  }
};

// Основные функции
async function loadLang(lang) {
  const base = utils.getBasePath();
  const url = `${base}/lang/${lang}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const translations = await response.json();
    state.translations = translations;
    state.currentLang = lang;
    localStorage.setItem(I18N_CONFIG.CACHE_KEY, lang);

    await updateTranslations();
    return translations;
  } catch (error) {
    console.error('Error loading translations:', error);
    throw error;
  }
}

async function updateTranslations() {
  const elements = document.querySelectorAll(I18N_CONFIG.SELECTORS.TRANSLATABLE);
  const placeholders = document.querySelectorAll(I18N_CONFIG.SELECTORS.PLACEHOLDER);
  
  const translatedKeys = new Set();
  const missingKeys = new Set();

  // Обновляем тексты
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (state.translations[key]) {
      el.innerHTML = state.translations[key];
      translatedKeys.add(key);
    } else {
      missingKeys.add(key);
    }
  });

  // Обновляем плейсхолдеры
  placeholders.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (state.translations[key]) {
      el.placeholder = state.translations[key];
      translatedKeys.add(key);
    } else {
      missingKeys.add(key);
    }
  });

  // Обновляем карусель новостей
  if (typeof updateNewsCarousel === 'function' && !window.carouselInitialized) {
    await updateNewsCarousel();
    window.carouselInitialized = true;
  }

  // Инициализируем карусель новостей
  if (typeof initNewsCarousel === 'function' && !state.initialized) {
    const newsCarousel = document.getElementById('newsCarousel');
    if (newsCarousel) {
      requestAnimationFrame(() => {
        initNewsCarousel();
        state.initialized = true;
      });
    }
  }

  return {
    translated: Array.from(translatedKeys),
    missing: Array.from(missingKeys)
  };
}

function t(key, params = {}) {
  let text = state.translations[key] || key;
  
  return Object.entries(params).reduce((result, [param, value]) => {
    return result.replace(`{${param}}`, value);
  }, text);
}

// Экспорт
window.currentLang = state.currentLang;
window.t = t;
window.loadLang = loadLang;
window.formatNumber = utils.formatNumber;
window.formatTokens = utils.formatTokens;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadLang(state.currentLang).catch(console.error);
}); 