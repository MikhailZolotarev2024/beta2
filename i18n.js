// Глобальные переменные
window.currentLang = 'en'; // По умолчанию английский
let translations = {};

// Доступные языки
const AVAILABLE_LANGUAGES = ['pl', 'ru', 'en'];
const LANGUAGE_NAMES = {
  'pl': 'Polski',
  'ru': 'Русский', 
  'en': 'English'
};

// Функция для определения языка пользователя
function detectUserLanguage() {
  // Сначала проверяем localStorage
  const savedLang = localStorage.getItem('preferredLang');
  if (savedLang && AVAILABLE_LANGUAGES.includes(savedLang)) {
    console.log('🌍 Using saved language from localStorage:', savedLang);
    return savedLang;
  }

  // Определяем язык браузера
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  const primaryLang = browserLang.split('-')[0].toLowerCase();
  
  console.log('🌍 Browser language detected:', browserLang, 'Primary:', primaryLang);
  
  // Проверяем, поддерживается ли основной язык
  if (AVAILABLE_LANGUAGES.includes(primaryLang)) {
    console.log('✅ Using detected language:', primaryLang);
    return primaryLang;
  }
  
  // Проверяем все языки браузера
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      const langCode = lang.split('-')[0].toLowerCase();
      if (AVAILABLE_LANGUAGES.includes(langCode)) {
        console.log('✅ Using language from navigator.languages:', langCode);
        return langCode;
      }
    }
  }
  
  // По умолчанию английский
  console.log('🌍 Using default language: en');
  return 'en';
}

// Функция для сохранения языка в localStorage
function saveLanguage(lang) {
  localStorage.setItem('preferredLang', lang);
  console.log('💾 Language saved to localStorage:', lang);
}

function getBasePath() {
  return window.location.origin.includes('github.io') ? `/${window.location.pathname.split('/')[1]}` : '';
}

// Функция для создания переключателя языков
//function createLanguageSwitcher() {
  // Проверяем, есть ли уже переключатель
  //if (document.querySelector('.language-switcher')) {
  //  return;
//  }

  const switcher = document.createElement('div');
  switcher.className = 'language-switcher';
  switcher.innerHTML = `
    <select class="lang-select">
      ${AVAILABLE_LANGUAGES.map(lang => 
        `<option value="${lang}" ${lang === window.currentLang ? 'selected' : ''}>
          ${LANGUAGE_NAMES[lang]}
        </option>`
      ).join('')}
    </select>
  `;

  // Добавляем стили
  const style = document.createElement('style');
  style.textContent = `
    .language-switcher {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    
    .lang-select {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      padding: 8px 12px;
      font-size: 14px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }
    
    .lang-select:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(118, 199, 192, 0.5);
    }
    
    .lang-select:focus {
      outline: none;
      border-color: rgba(118, 199, 192, 0.8);
      box-shadow: 0 0 10px rgba(118, 199, 192, 0.3);
    }
    
    .lang-select option {
      background: #1a1a1a;
      color: #fff;
    }
    
    /* Адаптивность для мобильных */
    @media (max-width: 768px) {
      .language-switcher {
        top: 10px;
        right: 10px;
      }
      
      .lang-select {
        font-size: 12px;
        padding: 6px 8px;
      }
    }
  `;
  




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

    // Обновляем переключатель языков
    const langSelect = document.querySelector('.lang-select');
    if (langSelect) {
      langSelect.value = lang;
    }

    // Обновляем юридический раздел при смене языка
    if (window.location.pathname.includes('index4.html') && typeof loadMarkdown === 'function') {
      // Вызываем заново загрузку текущего выбранного блока
      const activeButton = document.querySelector('.nav-links button.active');
      const activePointId = activeButton?.getAttribute('onclick')?.match(/loadMarkdown\('([^']+)'\)/)?.[1] || 'point1';
      loadMarkdown(activePointId);
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

// Функция для применения языка
async function applyLanguage(lang) {
  try {
    console.log('🔄 Applying language:', lang);
    await loadLang(lang);
    saveLanguage(lang);
    
    // Обновляем атрибут lang у html
    document.documentElement.lang = lang;
    
    console.log('✅ Language applied successfully:', lang);
  } catch (error) {
    console.error('❌ Error applying language:', error);
  }
}

// Функция инициализации языка
async function initLanguage() {
  try {
    console.log('🚀 Initializing language system...');
    
    // Определяем язык пользователя
    const userLang = detectUserLanguage();
    
    // Применяем язык
    await applyLanguage(userLang);
    
    // Создаем переключатель языков
    //createLanguageSwitcher();
    
    console.log('✅ Language system initialized');
  } catch (error) {
    console.error('❌ Error initializing language system:', error);
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

// Делаем функции глобальными
window.t = t;
window.applyLanguage = applyLanguage;
window.initLanguage = initLanguage;
window.detectUserLanguage = detectUserLanguage;

// Функция для форматирования чисел
function formatNumber(number, decimals = 6) {
  return Number(number).toFixed(decimals);
}

// Функция для форматирования списка токенов
function formatTokens(tokens) {
  return tokens.map(t => `${t.tokenName}: ${formatNumber(t.balance/10**(t.tokenDecimal||6))}`).join(', ');
} 
