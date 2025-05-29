// Глобальные функции
function toggleMenu() {
  const menuIcon = document.querySelector(".menu-icon");
  const menuDropdown = document.querySelector(".menu-dropdown");
  
  if (menuIcon && menuDropdown) {
    menuIcon.classList.toggle("active");
    menuDropdown.classList.toggle("active");
    
    // Добавляем обработку клика вне меню для его закрытия
    if (menuDropdown.classList.contains("active")) {
      document.addEventListener("click", closeMenuOnClickOutside);
    } else {
      document.removeEventListener("click", closeMenuOnClickOutside);
    }
  }
}

function closeMenuOnClickOutside(event) {
  const menuIcon = document.querySelector(".menu-icon");
  const menuDropdown = document.querySelector(".menu-dropdown");
  const langToggle = document.querySelector(".lang-toggle");
  
  if (menuIcon && menuDropdown && 
      !menuIcon.contains(event.target) && 
      !menuDropdown.contains(event.target) &&
      !langToggle.contains(event.target)) {
    menuIcon.classList.remove("active");
    menuDropdown.classList.remove("active");
    document.removeEventListener("click", closeMenuOnClickOutside);
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
  const langToggleBtn = document.querySelector('.lang-btn');
  if (langToggleBtn) {
    // Добавляем анимацию
    langToggleBtn.style.opacity = '0';
    setTimeout(() => {
      langToggleBtn.textContent = currentLang.toUpperCase();
      langToggleBtn.style.opacity = '1';
    }, 150);
  }
}

// Функция для блокировки кнопки во время загрузки
function setLangButtonLoading(isLoading) {
  const langToggleBtn = document.querySelector('.lang-btn');
  if (langToggleBtn) {
    if (isLoading) {
      langToggleBtn.innerHTML = '<span class="loading-spinner"></span>';
      langToggleBtn.disabled = true;
    } else {
      langToggleBtn.disabled = false;
      updateLangToggleBtnText(document.documentElement.lang);
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
    
    // Закрываем выпадающее меню
    const langDropdown = document.querySelector('.lang-dropdown');
    if (langDropdown) {
      langDropdown.classList.remove('active');
    }
    
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
  const langToggle = document.querySelector('.lang-toggle');
  const langBtn = document.querySelector('.lang-btn');
  const langDropdown = document.querySelector('.lang-dropdown');
  
  if (langToggle && langBtn && langDropdown) {
    // Обработчик клика по кнопке
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });
    
    // Обработчик клика по опциям
    const langOptions = langDropdown.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
      option.addEventListener('click', async () => {
        const lang = option.dataset.lang;
        if (lang) {
          await applyLang(lang);
        }
      });
    });
    
    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => {
      if (!langToggle.contains(e.target)) {
        langDropdown.classList.remove('active');
      }
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
    const menuIcon = document.querySelector(".menu-icon");
    if (menuIcon) {
      menuIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
      });
    }

    // Закрываем меню при изменении размера окна
    window.addEventListener("resize", () => {
      const menuIcon = document.querySelector(".menu-icon");
      const menuDropdown = document.querySelector(".menu-dropdown");
      if (window.innerWidth > 768 && menuIcon && menuDropdown) {
        menuIcon.classList.remove("active");
        menuDropdown.classList.remove("active");
      }
    });

    // Инициализация карусели
const carousel = document.querySelector(".carousel-inner");
let items = Array.from(document.querySelectorAll(".carousel-item"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

if (carousel && items.length) {
  let index = items.length;
  let itemWidth = items[0]?.offsetWidth ? items[0].offsetWidth + 20 : 0;
  let isMoving = false;
  let autoSlideInterval;

  // Клонируем элементы
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    carousel.appendChild(clone);
  });
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    carousel.insertBefore(clone, items[0]);
  });
  const allItems = Array.from(document.querySelectorAll(".carousel-item"));
  itemWidth = allItems[1]?.offsetWidth ? allItems[1].offsetWidth + 20 : 0;
  carousel.style.transform = `translateX(${-index * itemWidth}px)`;

  function updateCarousel() {
    if (isMoving) return;
    isMoving = true;
    carousel.style.transition = "transform 0.5s ease-in-out";
    carousel.style.transform = `translateX(${-index * itemWidth}px)`;
    setTimeout(() => {
      if (index >= allItems.length - items.length) {
        carousel.style.transition = "none";
        index = items.length;
        carousel.style.transform = `translateX(${-index * itemWidth}px)`;
      }
      if (index <= 0) {
        carousel.style.transition = "none";
        index = allItems.length - items.length * 2;
        carousel.style.transform = `translateX(${-index * itemWidth}px)`;
      }
      isMoving = false;
    }, 500);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      index++;
      updateCarousel();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      index--;
      updateCarousel();
    });
  }

  function autoSlide() {
    index++;
    updateCarousel();
  }
  autoSlideInterval = setInterval(autoSlide, 3000);
  carousel.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
  carousel.addEventListener("mouseleave", () => {
    autoSlideInterval = setInterval(autoSlide, 3000);
  });
  window.addEventListener("resize", function () {
    itemWidth = allItems[1]?.offsetWidth ? allItems[1].offsetWidth + 20 : 0;
    carousel.style.transition = "none";
    carousel.style.transform = `translateX(${-index * itemWidth}px)`;
  });
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
    const langToggleBtn = document.querySelector('.lang-btn');
    if (langToggleBtn) {
      langToggleBtn.disabled = false;
    }
    
    console.log('✅ Модуль переключения языка успешно инициализирован');
  } catch (error) {
    console.error('❌ Ошибка при инициализации:', error);
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp);


