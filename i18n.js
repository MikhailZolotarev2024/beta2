// Сделаем currentLang глобальной
window.currentLang = 'ru';
let translations = {};

function getBasePath() {
  const path = window.location.pathname;
  const parts = path.split('/');
  return parts.includes('beta2') ? '/beta2' : '';
}

async function loadLang(lang) {
  const base = getBasePath();
  const url = `${base}/lang/${lang}.json`;
  console.log('🌍 Loading translations from:', url);

  try {
    // Загрузка JSON
    console.log('📥 Fetching translations...');
    const res = await fetch(url);
    console.log('📦 Fetch response:', {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries())
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // Получение текста
    const rawText = await res.text();
    console.log('📄 Raw JSON text:', rawText);

    // Парсинг JSON
    try {
      translations = JSON.parse(rawText);
      console.log('✅ JSON parsed successfully:', translations);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error(`JSON parse error: ${parseError.message}`);
    }

    window.currentLang = lang;
    
    // Обновляем тексты элементов
    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`🔍 Found ${elements.length} elements with data-i18n`);
    
    const translatedKeys = new Set();
    const missingKeys = new Set();
    
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        el.innerHTML = translations[key];
        translatedKeys.add(key);
      } else {
        missingKeys.add(key);
        console.warn(`❗ Missing translation for key: ${key}`);
      }
    });

    console.log('✅ Successfully translated keys:', Array.from(translatedKeys));
    if (missingKeys.size > 0) {
      console.warn('⚠️ Missing translations for keys:', Array.from(missingKeys));
    }
    
    // Обновляем плейсхолдеры
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    console.log(`🔍 Found ${placeholders.length} elements with data-i18n-placeholder`);
    
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        el.placeholder = translations[key];
        translatedKeys.add(key);
      } else {
        missingKeys.add(key);
        console.warn(`❗ Missing translation for placeholder key: ${key}`);
      }
    });

    // Обновляем карусель при смене языка
    if (typeof updateNewsCarousel === 'function') {
      console.log('🔄 Updating news carousel...');
      const newsCards = document.querySelectorAll('.news-card');
      console.log(`📰 Found ${newsCards.length} news cards`);
      
      const newsData = typeof getTranslatedNews === 'function' ? getTranslatedNews() : null;
      console.log('📰 News data:', newsData);
      
      updateNewsCarousel();
      console.log('✅ News carousel updated');
    }

    // Сбрасываем флаг инициализации карусели
    window.newsCarouselInitialized = false;

    // Инициализируем карусель новостей
    if (typeof initNewsCarousel === 'function') {
      console.log('🎠 Initializing news carousel...');
      const newsCards = document.querySelectorAll('.news-card');
      console.log(`📰 Found ${newsCards.length} news cards`);
      
      const newsData = typeof getTranslatedNews === 'function' ? getTranslatedNews() : null;
      console.log('📰 News data:', newsData);
      
      // Проверяем наличие элемента карусели
      const newsCarousel = document.getElementById('newsCarousel');
      if (newsCarousel) {
        // Используем requestAnimationFrame для гарантии, что DOM обновлен
        requestAnimationFrame(() => {
          initNewsCarousel();
          window.newsCarouselInitialized = true;
          console.log('✅ News carousel initialized');
        });
      } else {
        console.warn('⚠️ News carousel element not found');
      }
    }

    return translations;
  } catch (error) {
    console.error('❌ Error loading translations:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    throw error;
  }
}

function t(key, params = {}) {
  let text = translations[key];
  
  if (!text) {
    console.warn(`⚠️ Translation key not found: "${key}"`);
    text = key;
  }
  
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