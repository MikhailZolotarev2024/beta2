let currentLang = 'ru';
let translations = {};

async function loadLang(lang) {
  try {
    const res = await fetch('/lang/' + lang + '.json');
    translations = await res.json();
    currentLang = lang;
    
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
    // Добавлено для обновления новостного виджета при смене языка
    if (typeof updateNewsCarousel === 'function') {
      updateNewsCarousel();
    }
    if (typeof initNewsCarousel === 'function') {
      initNewsCarousel();
    }
  } catch (error) {
    console.error('Error loading translations:', error);
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

loadLang('ru'); 