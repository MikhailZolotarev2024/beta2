// Глобальные функции
function toggleMenu() {
  const menuIcon = document.querySelector(".menu-icon");
  const menuDropdown = document.querySelector(".menu-dropdown");
  if (menuIcon && menuDropdown) {
    menuIcon.classList.toggle("active");
    menuDropdown.classList.toggle("active");
  }
}

function toggleSection(event) {
  const header = event.target;
  const section = header.closest('.expandable-section');
  if (section) {
    section.classList.toggle("active");
  }
}

// Константы для языков
const LANGUAGES = {
  RU: 'ru',
  EN: 'en'
};

// Функция для установки текста на кнопке переключения языка
function updateLangToggleBtnText(currentLang) {
  const langToggleBtn = document.getElementById('toggleLangBtn');
  if (langToggleBtn) {
    // Добавляем анимацию
    langToggleBtn.style.opacity = '0';
    setTimeout(() => {
      langToggleBtn.textContent = currentLang === LANGUAGES.RU ? '🇬🇧 English' : '🇷🇺 Русский';
      langToggleBtn.style.opacity = '1';
    }, 150);
    langToggleBtn.dataset.loading = 'false';
  }
}

// Функция для блокировки кнопки во время загрузки
function setLangButtonLoading(isLoading) {
  const langToggleBtn = document.getElementById('toggleLangBtn');
  if (langToggleBtn) {
    langToggleBtn.dataset.loading = isLoading.toString();
    if (isLoading) {
      langToggleBtn.dataset.originalText = langToggleBtn.textContent;
      langToggleBtn.innerHTML = '<span class="loading-spinner"></span>';
    } else {
      langToggleBtn.innerHTML = langToggleBtn.dataset.originalText || '';
    }
  }
}

// Функция для применения языка
async function applyLang(lang) {
  console.log('🚀 Calling loadLang with:', lang);
  try {
    setLangButtonLoading(true);
    
    // Сохраняем выбранный язык
    localStorage.setItem('lang', lang);
    
    // Загружаем переводы
    await loadLang(lang);
    
    // Обновляем текст кнопки
    updateLangToggleBtnText(lang);
    
    // Обновляем атрибут lang у html
    document.documentElement.lang = lang;
    
    // Обновляем карусель новостей после смены языка
    if (typeof updateNewsCarousel === 'function') {
      updateNewsCarousel();
    }
    
    // Добавляем анимацию для элементов с переводами
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100);
    });
    
    console.log(`✅ Язык успешно изменён на ${lang}`);
  } catch (error) {
    console.error('❌ Ошибка при применении языка:', error);
    const previousLang = lang === LANGUAGES.RU ? LANGUAGES.EN : LANGUAGES.RU;
    updateLangToggleBtnText(previousLang);
    
    // Показываем уведомление об ошибке
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = 'Ошибка при смене языка. Попробуйте позже.';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  } finally {
    setLangButtonLoading(false);
  }
}

// Инициализация языка при загрузке страницы
async function initLang() {
  try {
    setLangButtonLoading(true);
    
    // Получаем язык из localStorage или по умолчанию 'ru'
    const savedLang = localStorage.getItem('lang') || LANGUAGES.RU;
    
    // Применяем сохранённый язык
    await applyLang(savedLang);
    
    console.log('✅ Язык успешно инициализирован');
  } catch (error) {
    console.error('❌ Ошибка при инициализации языка:', error);
  } finally {
    setLangButtonLoading(false);
  }
}

// Настройка кнопки переключения языка
function setupLangToggleBtn() {
  const langToggleBtn = document.getElementById('toggleLangBtn');
  if (langToggleBtn) {
    langToggleBtn.dataset.loading = 'false';
    
    langToggleBtn.addEventListener('click', async () => {
      if (langToggleBtn.dataset.loading === 'true') return;
      
      const newLang = document.documentElement.lang === LANGUAGES.RU ? LANGUAGES.EN : LANGUAGES.RU;
      await applyLang(newLang);
    });
  }
}

// Функция для проверки готовности i18n.js
function waitForI18n() {
  return new Promise((resolve) => {
    if (typeof loadLang === 'function') {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof loadLang === 'function') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    }
  });
}

// Основная функция инициализации приложения
async function initializeApp() {
  try {
    // Настраиваем обработчики меню
    const icon = document.querySelector(".menu-icon");
    if (icon) {
      icon.addEventListener("click", toggleMenu);
    }

    // Инициализация карусели
    const carousel = document.querySelector('.carousel-inner');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentPosition = 0;
    const itemWidth = 180; // Ширина элемента карусели
    const gap = 20; // Отступ между элементами

    if (carousel && prevBtn && nextBtn) {
      const items = carousel.querySelectorAll('.carousel-item');
      const totalItems = items.length;
      const maxPosition = -(totalItems - 1) * (itemWidth + gap);

      function updateCarousel() {
        carousel.style.transform = `translateX(${currentPosition}px)`;
        prevBtn.disabled = currentPosition >= 0;
        nextBtn.disabled = currentPosition <= maxPosition;
      }

      prevBtn.addEventListener('click', () => {
        if (currentPosition < 0) {
          currentPosition += itemWidth + gap;
          updateCarousel();
        }
      });

      nextBtn.addEventListener('click', () => {
        if (currentPosition > maxPosition) {
          currentPosition -= itemWidth + gap;
          updateCarousel();
        }
      });

      // Инициализация начального состояния
      updateCarousel();
    }

    // Настраиваем обработчики для секций
    const sections = document.querySelectorAll('.expandable-section');
    sections.forEach(section => {
      const header = section.querySelector('.expandable-header');
      if (header) {
        header.addEventListener('click', toggleSection);
      }
    });

    // Инициализируем particles.js если есть
    if (window.particlesJS) {
      const particlesEl = document.getElementById('particles-js');
      if (particlesEl) {
        particlesJS("particles-js", {
          "particles": {
            "number": { "value": 100, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#00ffff" },
            "shape": { "type": "circle", "stroke": { "width": 1, "color": "#ffffff" } },
            "opacity": { "value": 0.6, "random": true },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
            "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out" }
          },
          "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } },
            "modes": { "grab": { "distance": 200, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
          },
          "retina_detect": true
        });
      }
    }

    // Инициализация wave-row
    const rows = document.querySelectorAll(".wave-row");
    if (rows.length) {
      const shown = new Set();
      const waveObserver = new IntersectionObserver((entries) => {
        let delay = 0;
        entries.forEach(entry => {
          if (entry.isIntersecting && !shown.has(entry.target)) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, delay);
            delay += 200;
            shown.add(entry.target);
            waveObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: "0px" });
      rows.forEach(row => waveObserver.observe(row));
      setTimeout(() => window.dispatchEvent(new Event('scroll')), 100);
    }

    // Инициализация dot-grid
    function animateDots(grid) {
      const activeCount = parseInt(grid.getAttribute('data-active')) || 0;
      const dots = [];
      for (let i = 0; i < 100; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i < activeCount) dot.classList.add('active');
        dots.push(dot);
        grid.appendChild(dot);
      }
      dots.forEach((dot, i) => {
        setTimeout(() => dot.classList.add('visible'), i * 20);
      });
    }

    const dotGrids = document.querySelectorAll('.dot-grid');
    if (dotGrids.length) {
      const dotObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('activated')) {
            entry.target.classList.add('activated');
            animateDots(entry.target);
          }
        });
      }, { threshold: 0.5 });
      dotGrids.forEach(grid => {
        dotObserver.observe(grid);
      });
    }

    // Инициализация cookie consent
    const cookieConsent = document.getElementById('cookieConsent');
    if (cookieConsent) {
      // Проверяем наличие cookie
      const cookiesAccepted = document.cookie.split(';').some(cookie => cookie.trim().startsWith('cookiesAccepted='));
      
      if (!cookiesAccepted) {
        cookieConsent.style.display = 'flex';
        const acceptBtn = document.getElementById('acceptCookiesBtn');
        if (acceptBtn) {
          acceptBtn.addEventListener('click', function() {
            // Устанавливаем cookie с дополнительными параметрами
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            document.cookie = `cookiesAccepted=true; path=/; expires=${date.toUTCString()}; SameSite=Lax`;
            
            // Скрываем уведомление
            cookieConsent.style.display = 'none';
            
            // Проверяем, что cookie установился
            console.log('Cookie установлен:', document.cookie);
          });
        }
      } else {
        cookieConsent.style.display = 'none';
      }
    }

    // Ждём загрузки i18n.js
    await waitForI18n();
    
    // Инициализируем язык
    await initLang();
    
    // Настраиваем кнопку переключения
    setupLangToggleBtn();
    
    // Разблокируем кнопку после инициализации
    const langToggleBtn = document.getElementById('toggleLangBtn');
    if (langToggleBtn) {
      langToggleBtn.dataset.loading = 'false';
    }
    
    console.log('✅ Модуль переключения языка успешно инициализирован');
  } catch (error) {
    console.error('❌ Ошибка при инициализации:', error);
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp);


