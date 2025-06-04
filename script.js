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

// Глобальные переменные для пагинации отзывов
let currentReviewsPage = 1;
let reviewsPerPage = 3; // Значение по умолчанию для мобильных
let allReviews = []; // Массив для хранения всех отзывов (из JSON и локальных)

// Функция для определения количества отзывов на странице в зависимости от ширины экрана
function getReviewsPerPage() {
    // Всегда возвращаем 8 отзывов (2 столбца по 4)
    return 8;
}

// Функция для загрузки отзывов из JSON
async function loadGeneratedReviews() {
  try {
    // Проверяем, существует ли файл reviews.json. Если нет, используем generated_reviews.json
    // В реальном приложении лучше иметь более надежный механизм проверки или использовать один источник
    const response = await fetch('reviews.json');
    if (!response.ok) {
        console.warn('reviews.json not found, trying generated_reviews.json');
        const fallbackResponse = await fetch('generated_reviews.json');
        if (!fallbackResponse.ok) {
             console.error('Failed to load reviews from both reviews.json and generated_reviews.json');
             return [];
        }
        return await fallbackResponse.json();
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Ошибка при загрузке сгенерированных отзывов:', error);
    return [];
  }
}

// Создание DOM-элемента карточки отзыва (обновленная из reviews-carousel.js)
function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card'; // Класс для пагинации
    // Добавляем дату (используем дату из отзыва, если есть, иначе генерируем)
    const reviewDate = review.date && review.date !== 'случайная дата с 2021 по сегодня' ? review.date : getRandomDate();
    card.innerHTML = `
        <div class="review-header">
            <div class="review-avatar">${review.letter || (review.name ? review.name[0] : '?')}</div>
            <div class="review-info">
                <div class="review-name">${review.name || 'Аноним'} <span style="font-size:0.9em;color:#76c7c0;">${review.flag || ''}</span></div>
                <span class="review-date">${reviewDate}</span>
                <div style="font-size:0.95em;color:#aaa;">${review.lang || ''}</div>
            </div>
        </div>
        <div class="review-content">
            <span class="review-short">${review.short || ''}</span>
            <button class="read-more">Подробнее</button>
        </div>
    `;
    // Обработчик для кнопки "Подробнее"
    card.querySelector('.read-more').addEventListener('click', function(e) {
        e.stopPropagation();
        showModal(review.full || review.short || 'Нет полного отзыва.');
    });

     // Добавляем класс 'generated' для стилей и отличия от локальных
    card.classList.add('generated');

    return card;
}

// Функция для получения случайной даты (перенесена из reviews-carousel.js)
function getRandomDate() {
    const start = new Date(2021, 0, 1).getTime();
    const end = new Date().getTime();
    const date = new Date(start + Math.random() * (end - start));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Функция для отображения модального окна (перенесена из reviews-carousel.js, адаптирована)
function showModal(text) {
    let modal = document.getElementById('modal'); // Используем существующее модальное окно в index3.html
    let modalText = document.getElementById('modal-text'); // Элемент для текста отзыва
    
    if (!modal || !modalText) {
      console.error('Modal elements not found in index3.html');
      return;
    }

    modalText.textContent = text;
    modal.classList.add('show');

    // Добавляем обработчик для закрытия по клику вне модалки
     modal.onclick = e => { if (e.target === modal) modal.classList.remove('show'); };

     // Убедимся, что кнопка закрытия работает (уже есть в index3.html, но на всякий случай)
     const closeModalBtn = modal.querySelector('.close-modal');
     if(closeModalBtn && !closeModalBtn.dataset.listenerAdded) { // Добавляем слушатель только один раз
        closeModalBtn.dataset.listenerAdded = 'true';
        closeModalBtn.onclick = () => { // Переопределяем onclick, так как в index3.html он есть
             modal.classList.remove('show');
        };
     }
}

// Функция для обновления пагинации отзывов
function updateReviewsPagination() {
  const totalPages = Math.ceil(allReviews.length / reviewsPerPage);
  const pagination = document.querySelector('.reviews-pagination');
  
  if (!pagination) return;

  // Очищаем существующие кнопки страниц, кроме стрелок
  pagination.querySelectorAll('.pagination-page, .pagination-ellipsis').forEach(button => button.remove());

  // Функция для создания кнопки страницы
  const createPageButton = (pageNum) => {
    const pageButton = document.createElement('button');
    pageButton.classList.add('pagination-page');
    pageButton.textContent = pageNum;
    if (pageNum === currentReviewsPage) {
      pageButton.classList.add('active');
    }
    return pageButton;
  };

  // Функция для создания эллипсиса
  const createEllipsis = () => {
    const ellipsis = document.createElement('span');
    ellipsis.classList.add('pagination-ellipsis');
    ellipsis.textContent = '...';
    return ellipsis;
  };

  // Добавляем первую страницу
  pagination.insertBefore(createPageButton(1), pagination.querySelector('.pagination-arrow.next'));

  // Добавляем страницы вокруг текущей
  const startPage = Math.max(2, currentReviewsPage - 1);
  const endPage = Math.min(totalPages - 1, currentReviewsPage + 1);

  // Добавляем эллипсис после первой страницы, если нужно
  if (startPage > 2) {
    pagination.insertBefore(createEllipsis(), pagination.querySelector('.pagination-arrow.next'));
  }

  // Добавляем страницы вокруг текущей
  for (let i = startPage; i <= endPage; i++) {
    pagination.insertBefore(createPageButton(i), pagination.querySelector('.pagination-arrow.next'));
  }

  // Добавляем эллипсис перед последней страницей, если нужно
  if (endPage < totalPages - 1) {
    pagination.insertBefore(createEllipsis(), pagination.querySelector('.pagination-arrow.next'));
  }

  // Добавляем последнюю страницу, если она не первая
  if (totalPages > 1) {
    pagination.insertBefore(createPageButton(totalPages), pagination.querySelector('.pagination-arrow.next'));
  }
  
  // Обновляем состояние стрелок
  const prevButton = pagination.querySelector('.pagination-arrow.prev');
  const nextButton = pagination.querySelector('.pagination-arrow.next');
  
  if (prevButton) prevButton.disabled = currentReviewsPage === 1;
  if (nextButton) nextButton.disabled = currentReviewsPage >= totalPages;

  // Если текущая страница стала больше общего количества страниц
  if (currentReviewsPage > totalPages) {
    currentReviewsPage = totalPages > 0 ? totalPages : 1;
    updateReviewsDisplay();
  }
}

// Функция для обновления отображения отзывов
function updateReviewsDisplay() {
  const reviewsToDisplay = allReviews;
  const startIndex = (currentReviewsPage - 1) * reviewsPerPage;
  const endIndex = Math.min(startIndex + reviewsPerPage, reviewsToDisplay.length);
  
  const reviewsContainer = document.querySelector('.reviews-carousel');
  if (!reviewsContainer) return;

  // Скрываем все карточки отзывов в контейнере
  reviewsContainer.querySelectorAll('.review-card').forEach(card => card.style.display = 'none');

  // Отображаем только отзывы для текущей страницы
  for (let i = startIndex; i < endIndex; i++) {
    const reviewCard = reviewsContainer.children[i];
     if(reviewCard) {
         reviewCard.style.removeProperty('display'); // Очищаем inline-стиль display
     }
  }
  
  updateReviewsPagination();
}

// Инициализация пагинации отзывов
function initReviewsPagination() {
  const pagination = document.querySelector('.reviews-pagination');
  
  if (!pagination) {
    console.error('❌ Reviews pagination element not found');
    return;
  }
  
  // Добавляем обработчики для кнопок пагинации
  pagination.addEventListener('click', (e) => {
    if (e.target.classList.contains('pagination-page')) {
      const page = parseInt(e.target.textContent);
      if (page !== currentReviewsPage) { // Проверяем, что это не текущая страница
          currentReviewsPage = page;
          updateReviewsDisplay();
      }
    } else if (e.target.classList.contains('pagination-arrow')) {
      if (e.target.classList.contains('prev') && currentReviewsPage > 1) {
        currentReviewsPage--;
        updateReviewsDisplay();
      } else if (e.target.classList.contains('next')) {
        const totalPages = Math.ceil(allReviews.length / reviewsPerPage);
        if (currentReviewsPage < totalPages) {
          currentReviewsPage++;
          updateReviewsDisplay();
        }
      }
    }
  });
  
  // Инициализируем отображение - первый показ будет в initializeApp
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
      // Пересчитываем количество отзывов на странице при изменении размера
      const newReviewsPerPage = getReviewsPerPage();
      if (newReviewsPerPage !== reviewsPerPage) {
          reviewsPerPage = newReviewsPerPage;
          // Сбрасываем страницу на первую при изменении количества отзывов на странице
          currentReviewsPage = 1;
          updateReviewsDisplay(); // Обновляем отображение и пагинацию
      } else {
          // Если количество отзывов на странице не изменилось, просто обновляем отображение (например, при повороте экрана)
          updateReviewsDisplay();
      }
      // При изменении размера окна, возможно, нужно сбросить позицию карусели изображений
      const imageCarouselInnerResize = document.querySelector('.carousel-inner');
      const imageCarouselItemsResize = document.querySelectorAll('.carousel-item');
      if (imageCarouselInnerResize && imageCarouselItemsResize.length > 0) {
          // Сбросим на первый элемент (без зацикливания логики)
          imageCarouselInnerResize.style.transition = 'none';
          imageCarouselInnerResize.style.transform = `translateX(0px)`;
      }
    });

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

    // --- Инициализация карусели изображений (Зацикленная прокрутка) ---
    const imageCarouselContainer = document.querySelector('.carousel-container');
    const imageCarouselInner = document.querySelector('.carousel-inner');
    const originalImageItems = document.querySelectorAll('.carousel-item'); // Оригинальные элементы перед клонированием
    const imageLeftBtn = document.querySelector('.carousel-btn.left-btn');
    const imageRightBtn = document.querySelector('.carousel-btn.right-btn');

    if (imageCarouselInner && originalImageItems.length > 0 && imageCarouselContainer && imageLeftBtn && imageRightBtn) {
      console.log('✅ Карусель изображений найдена и запускается (зацикленная прокрутка)...');

      const itemWidth = originalImageItems[0]?.offsetWidth || 0;
      const gap = 20; // Убедитесь, что это соответствует вашему CSS gap
      const totalItemWidth = itemWidth + gap;
      const containerWidth = imageCarouselContainer.offsetWidth;

      // Определяем, сколько элементов видно, чтобы понять, сколько клонировать
      // Клонируем достаточно, чтобы полностью заполнить видимую область с запасом
      const visibleItemsCount = Math.ceil(containerWidth / totalItemWidth);
      const cloneCount = visibleItemsCount > 0 ? visibleItemsCount + 2 : originalImageItems.length; // Клонируем минимум visibleItemsCount + 2, или все, если видно мало

      // Клонируем последние элементы и добавляем в начало inner
      for (let i = 0; i < cloneCount; i++) {
        const cloneIndex = (originalImageItems.length - 1 - i + originalImageItems.length) % originalImageItems.length;
        const clone = originalImageItems[cloneIndex].cloneNode(true);
        imageCarouselInner.prepend(clone);
      }

      // Клонируем первые элементы и добавляем в конец inner
      for (let i = 0; i < cloneCount; i++) {
        const cloneIndex = i % originalImageItems.length;
        const clone = originalImageItems[cloneIndex].cloneNode(true);
        imageCarouselInner.appendChild(clone);
      }

      // Теперь получаем полный список элементов, включая клоны
      let allImageItems = imageCarouselInner.querySelectorAll('.carousel-item');

      // Индекс текущего элемента. Начинаем с первого оригинального элемента (после клонов в начале)
      let currentImageIndex = cloneCount;
      let autoScrollInterval = null;
      const autoScrollDelay = 5000; // Задержка автоскроллинга в миллисекундах

      const updateImageCarousel = (smooth = true) => {
        imageCarouselInner.style.transition = smooth ? 'transform 0.5s ease' : 'none'; // Длительность transition должна совпадать с setTimeout
        imageCarouselInner.style.transform = `translateX(${-currentImageIndex * totalItemWidth}px)`;

        // Логика для зацикливания: мгновенный переход при достижении клонов
        if (currentImageIndex >= allImageItems.length - cloneCount) {
          // Если достигли клонированных первых элементов в конце
          setTimeout(() => {
            currentImageIndex = cloneCount; // Переходим к первому оригинальному элементу
            updateImageCarousel(false); // Мгновенный переход (без анимации)
          }, 500); // Должно совпадать с transition duration CSS
        } else if (currentImageIndex < cloneCount) {
          // Если достигли клонированных последних элементов в начале
           setTimeout(() => {
            currentImageIndex = allImageItems.length - cloneCount * 2; // Переходим к последнему оригинальному элементу
            updateImageCarousel(false); // Мгновенный переход
          }, 500); // Должно совпадать с transition duration CSS
        }
      };

      const startAutoScroll = () => {
        stopAutoScroll();
        autoScrollInterval = setInterval(() => {
          currentImageIndex++;
          updateImageCarousel();
        }, autoScrollDelay);
      };

      const stopAutoScroll = () => {
        if (autoScrollInterval) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
        }
      };

      // Устанавливаем начальную позицию без анимации
      updateImageCarousel(false);

      // Обработчики кликов по кнопкам
      imageLeftBtn.addEventListener('click', () => {
        stopAutoScroll();
        currentImageIndex--;
        updateImageCarousel();
        // startAutoScroll(); // Возможно, не нужно перезапускать автоскроллинг после ручного переключения
      });

      imageRightBtn.addEventListener('click', () => {
        stopAutoScroll();
        currentImageIndex++;
        updateImageCarousel();
        // startAutoScroll(); // Возможно, не нужно перезапускать автоскроллинг после ручного переключения
      });

      // Запускаем автоскроллинг при загрузке
       startAutoScroll();

      // Останавливаем автоскроллинг при наведении на карусель
       if(imageCarouselContainer) {
         imageCarouselContainer.addEventListener('mouseenter', stopAutoScroll);
         imageCarouselContainer.addEventListener('mouseleave', startAutoScroll);
       }

      // Обработка изменения размера окна: сброс позиции и, возможно, переинициализация
       window.addEventListener('resize', () => {
         // Простейший вариант: сброс на начальную позицию.
         // Более надежный вариант - полная переинициализация карусели.
         currentIndex = cloneCount;
         updateImageCarousel(false); // Мгновенный сброс

         // Если требуется, можно добавить debounce для resize и полную переинициализацию
       });

    } else {
      console.warn('🚫 Карусель изображений не найдена, пуста или отсутствуют кнопки.');
    }

    // --- Логика загрузки и отображения отзывов ---

    // 1. Загружаем сгенерированные отзывы
    const generatedReviews = await loadGeneratedReviews();
    
    // 2. Загружаем локальные отзывы
    const localReviews = getLocalReviews(); // Функция из reviews-local.js
    
    // 3. Объединяем все отзывы и добавляем их в DOM
    allReviews = generatedReviews.concat(localReviews); // Объединяем данные для пагинации
    
    const reviewsContainer = document.querySelector('.reviews-carousel');
    if (reviewsContainer) {
        // Очищаем контейнер перед добавлением
        reviewsContainer.innerHTML = '';
        // Создаем и добавляем все карточки отзывов (сгенерированные и локальные) в DOM
        allReviews.forEach(review => {
            const card = createReviewCard(review);
            reviewsContainer.appendChild(card);
        });
    }

    // 4. Инициализируем пагинацию отзывов и отображаем первую страницу
    // Определяем начальное количество отзывов на странице
    reviewsPerPage = getReviewsPerPage();
    initReviewsPagination(); // Настраиваем обработчики кнопок
    updateReviewsDisplay(); // Отображаем первую страницу отзывов

    // --- Логика для модального окна новостей ---
    const newsModal = document.querySelector('.news-modal');
    const newsModalCloseBtn = document.querySelector('.news-modal-close');

    if (newsModal && newsModalCloseBtn) {
      // Закрытие модального окна по клику на кнопку закрытия
      newsModalCloseBtn.addEventListener('click', () => {
        newsModal.classList.remove('active');
      });

      // Закрытие модального окна по клику вне содержимого
      newsModal.addEventListener('click', (e) => {
        if (e.target === newsModal) {
          newsModal.classList.remove('active');
        }
      });
    }

    console.log('✅ Приложение инициализировано.');

  } catch (error) {
    console.error('❌ Ошибка при инициализации приложения:', error);
  }
}

// Запускаем приложение после полной загрузки DOM
document.addEventListener('DOMContentLoaded', initializeApp);

// Функция для получения локальных отзывов (нужна здесь для initializeApp)
function getLocalReviews() {
    try {
      // Предполагаем, что localStorage уже доступен на DOMContentLoaded
      return JSON.parse(localStorage.getItem('localReviews') || '[]');
    } catch {
      console.error('Error reading local reviews from localStorage.');
      return [];
    }
  }


document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    let hasScrolled = false;
    
    // Проверяем, находимся ли мы на главной странице
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                      window.location.pathname.endsWith('/') ||
                      window.location.pathname.endsWith('index');
    
    // Если мы не на главной странице или уже прокрутили страницу, показываем навбар
    if (!isHomePage || window.scrollY > 0) {
        navbar.classList.add('visible');
        hasScrolled = true;
    }
    
    // Добавляем обработчик скролла только на главной странице
    if (isHomePage) {
        window.addEventListener('scroll', function() {
            if (!hasScrolled && window.scrollY > 0) {
                navbar.classList.add('visible');
                hasScrolled = true;
            }
        });
    }
}); 