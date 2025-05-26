// Сделаем currentLang глобальной
window.currentLang = 'ru';
let translations = {};

function getBasePath() {
  const path = window.location.pathname;
  const parts = path.split('/');
  return parts.includes('beta2') ? '/beta2' : '';
}

async function loadLang(lang) {
  try {
    const base = getBasePath();
    const res = await fetch(`${base}/lang/${lang}.json`);
    translations = await res.json();
    console.log('🌍 Translations loaded:', translations);
    window.currentLang = lang;
    
    // Обновляем тексты элементов
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) el.innerText = translations[key];
    });
    
    // Обновляем плейсхолдеры
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) el.placeholder = translations[key];
    });

    // Инициализируем карусель новостей один раз
    if (typeof initNewsCarousel === 'function' && !window.newsCarouselInitialized) {
      initNewsCarousel();
      window.newsCarouselInitialized = true;
    }

    // Обновляем карусель при смене языка
    if (typeof updateNewsCarousel === 'function') {
      updateNewsCarousel();
    }

    return translations; // Возвращаем загруженные переводы
  } catch (error) {
    console.error('Error loading translations:', error);
    throw error; // Пробрасываем ошибку дальше
  }
}

function t(key, params = {}) {
  let text = translations[key] || key;
  
  // Заменяем параметры в тексте
  Object.entries(params).forEach(([param, value]) => {
    text = text.replace(`{${param}}`, value);
  });
  
  return text;
}

// Функция для форматирования чисел
function formatNumber(number, decimals = 6) {
  return Number(number).toFixed(decimals);
}

// Функция для форматирования списка токенов
function formatTokens(tokens) {
  return tokens.map(t => `${t.tokenName}: ${formatNumber(t.balance/10**(t.tokenDecimal||6))}`).join(', ');
} 