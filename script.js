window.addEventListener('DOMContentLoaded', () => {
// Глобальные функции
function toggleMenu() {
  const menuIcon = document.querySelector(".menu-icon");
  const menuDropdown = document.querySelector(".menu-dropdown");
  if (menuIcon && menuDropdown) {
    menuIcon.classList.toggle("active");
    menuDropdown.classList.toggle("active");
  }
}

const icon = document.querySelector(".menu-icon");
if (icon) {
  icon.addEventListener("click", toggleMenu);
}

function toggleSection(event) {
  const header = event.target;
  const section = header.closest('.expandable-section');
  if (section) {
    section.classList.toggle("active");
  }
}

// Добавляем обработчики событий для секций
const sections = document.querySelectorAll('.expandable-section');
sections.forEach(section => {
  const header = section.querySelector('.expandable-header');
  if (header) {
    header.addEventListener('click', toggleSection);
  }
});

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

// Карусель
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

// === ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА ===
// Функция для установки текста на кнопке переключения языка
function updateLangToggleBtnText(currentLang) {
  const langToggleBtn = document.getElementById('toggleLangBtn');
  if (langToggleBtn) {
    langToggleBtn.textContent = currentLang === 'ru' ? '🇬🇧 English' : '🇷🇺 Русский';
  }
}

// Функция для применения языка: сохраняет в localStorage, загружает переводы, обновляет кнопку
async function applyLang(lang) {
  try {
    localStorage.setItem('lang', lang); // Сохраняем выбранный язык
    await loadLang(lang); // Загружаем переводы
    updateLangToggleBtnText(lang); // Обновляем текст кнопки
  } catch (error) {
    console.error('Ошибка при применении языка:', error);
  }
}

// Инициализация языка при загрузке страницы
async function initLang() {
  // Получаем язык из localStorage или по умолчанию 'ru'
  const savedLang = localStorage.getItem('lang') || 'ru';
  await loadLang(savedLang);
  updateLangToggleBtnText(savedLang);
}

// Назначаем обработчик на кнопку переключения языка
function setupLangToggleBtn() {
  const langToggleBtn = document.getElementById('toggleLangBtn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', async () => {
      // Переключаем язык
      const newLang = window.currentLang === 'ru' ? 'en' : 'ru';
      await applyLang(newLang);
    });
  }
}

// Проверяем, что функция loadLang уже определена (i18n.js загружен)
if (typeof loadLang === 'function') {
  initLang().then(setupLangToggleBtn);
} else {
  // Если i18n.js ещё не загрузился, ждём его появления
  const i18nInterval = setInterval(() => {
    if (typeof loadLang === 'function') {
      clearInterval(i18nInterval);
      initLang().then(setupLangToggleBtn);
    }
  }, 50);
}
// === КОНЕЦ ЛОГИКИ ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА ===
});


