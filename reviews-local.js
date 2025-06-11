// --- Локальные отзывы ---
(function() {
  // Генерация случайного ID
  function randomId() {
    return 'r' + Math.random().toString(36).substr(2, 9);
  }

  // Получить дату в формате DD.MM.YYYY
  function getCurrentDate() {
    const d = new Date();
    return d.toLocaleDateString('ru-RU');
  }

  // Получить отзывы из localStorage
  function getLocalReviews() {
    try {
      return JSON.parse(localStorage.getItem('localReviews') || '[]');
    } catch {
      return [];
    }
  }

  // Сохранить отзывы в localStorage
  function saveLocalReviews(arr) {
    localStorage.setItem('localReviews', JSON.stringify(arr));
  }

  // Создать DOM-элемент карточки отзыва
  function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-header">
        <div class="avatar">${review.name[0] || '?'}</div>
        <div>
          <div class="review-name">${review.name}</div>
          <div class="review-lang">${review.flag ? '🇬🇧🇷🇺🇵🇱🇪🇸🇩🇪🇫🇷'.includes(review.flag) ? review.flag : review.flag : ''} ${review.lang || ''}</div>
        </div>
      </div>
      <div class="review-text">${review.short}</div>
      <div class="review-date" style="margin-top:10px;opacity:0.7;font-size:13px;">${review.date}</div>
      <button class="read-more" data-i18n="review.more_details">Подробнее</button>
    `;
    // Модалка для полного отзыва
    card.querySelector('.read-more').onclick = function() {
      showModal(review.full);
    };
    return card;
  }

  // Показать модалку с полным отзывом
  function showModal(text) {
    let modal = document.getElementById('localReviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'localReviewModal';
      modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
      modal.innerHTML = `<div style="background:#0b1428;padding:24px 32px;border-radius:12px;max-width:500px;width:90%;color:#fff;position:relative;">
        <button id="closeLocalReviewModal" style="position:absolute;top:10px;right:10px;font-size:22px;background:none;border:none;color:#fff;cursor:pointer;">&times;</button>
        <div id="localReviewModalText"></div>
      </div>`;
      document.body.appendChild(modal);
      modal.querySelector('#closeLocalReviewModal').onclick = () => modal.remove();
    }
    modal.querySelector('#localReviewModalText').textContent = text;
    modal.style.display = 'flex';
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
  }

  // Вывести отзывы в .reviews-carousel
  function renderLocalReviews() {
    const container = document.querySelector('.reviews-carousel');
    if (!container) return;
    // Удаляем только свои карточки
    container.querySelectorAll('.review-card.local').forEach(e => e.remove());
    const reviews = getLocalReviews();
    reviews.forEach(r => {
      const card = createReviewCard(r);
      card.classList.add('local');
      container.appendChild(card);
    });
  }

  // Обработка формы
  function setupForm() {
    const form = document.querySelector('.chat-style-form');
    if (!form) return;

    // Получаем все поля формы
    const nameInput = form.querySelector('input[placeholder="Введите имя..."]');
    const flagInput = form.querySelector('input.chat-flag');
    const langInput = form.querySelector('input[placeholder="UA"]');
    const shortTextarea = form.querySelector('textarea[placeholder="Краткий отзыв..."]');
    const fullTextarea = form.querySelector('textarea[placeholder="Полный отзыв..."]');
    const submitBtn = form.querySelector('.chat-submit');

    // Настройка выпадающего списка стран
    const countryBtn = form.querySelector('.country-btn');
    const countryDropdown = form.querySelector('.country-dropdown');
    const countryOptions = form.querySelectorAll('.country-option');

    // Обработчик клика по кнопке выбора страны
    countryBtn.addEventListener('click', function(e) {
      e.preventDefault();
      countryDropdown.classList.toggle('active');
    });

    // Обработчик клика по опциям
    countryOptions.forEach(option => {
      option.addEventListener('click', function() {
        const flag = this.dataset.flag;
        const lang = this.dataset.lang;
        
        // Обновляем текст кнопки
        countryBtn.textContent = `${flag} ${lang}`;
        
        // Обновляем скрытое поле с флагом
        flagInput.value = flag;
        
        // Обновляем поле с языком
        langInput.value = lang;
        
        // Закрываем выпадающий список
        countryDropdown.classList.remove('active');
        
        // Убираем подсветку с поля языка
        clearHighlight(langInput);
      });
    });

    // Закрытие выпадающего списка при клике вне его
    document.addEventListener('click', function(e) {
      if (!countryBtn.contains(e.target) && !countryDropdown.contains(e.target)) {
        countryDropdown.classList.remove('active');
      }
    });

    // Создаем элемент для сообщения об ошибке
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
      color: #ff5555;
      font-size: 14px;
      margin-left: 10px;
      display: inline-block;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    submitBtn.parentNode.insertBefore(errorMessage, submitBtn);

    // Функция для подсветки пустых полей
    function highlightEmptyFields() {
      const fields = [nameInput, langInput, shortTextarea];
      fields.forEach(field => {
        if (!field.value.trim()) {
          field.style.border = '1px solid #ff5555';
          field.style.background = 'rgba(255, 0, 0, 0.1)';
        } else {
          field.style.border = '';
          field.style.background = '';
        }
      });
    }

    // Функция для очистки подсветки
    function clearHighlight(field) {
      field.style.border = '';
      field.style.background = '';
    }

    // Добавляем обработчики для очистки подсветки при вводе
    [nameInput, langInput, shortTextarea].forEach(field => {
      field.addEventListener('input', () => clearHighlight(field));
    });

    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const name = nameInput.value.trim();
      const flag = flagInput.value.trim();
      const lang = langInput.value.trim();
      const short = shortTextarea.value.trim();
      const full = fullTextarea.value.trim();

      // Проверяем все обязательные поля
      if (!name || !flag || !lang || !short) {
        // Подсвечиваем пустые поля
        highlightEmptyFields();
        
        // Показываем сообщение об ошибке
        errorMessage.textContent = 'Заполните все поля';
        errorMessage.style.opacity = '1';
        
        // Скрываем сообщение через 2 секунды
        setTimeout(() => {
          errorMessage.style.opacity = '0';
        }, 2000);
        
        return;
      }

      // Если все поля заполнены, создаем отзыв
      const review = {
        id: randomId(),
        name,
        flag,
        lang,
        short,
        full,
        date: getCurrentDate()
      };

      const reviews = getLocalReviews();
      reviews.push(review);
      saveLocalReviews(reviews);

      // Очищаем форму
      nameInput.value = '';
      flagInput.value = '🇷🇺';
      langInput.value = '';
      shortTextarea.value = '';
      fullTextarea.value = '';
      countryBtn.textContent = '🇷🇺 RU';

      // Показываем сообщение об успехе
      submitBtn.textContent = 'Спасибо!';
      setTimeout(() => submitBtn.textContent = '📩 Отправить отзыв', 1500);

      // Обновляем отображение
      if (typeof updateReviewsDisplay === 'function') {
        updateReviewsDisplay();
      }
    });
  }

  // Добавить стили для .review-card.local (если нужно)
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .review-card.local { border: 1.5px dashed #00e0e0; background: rgba(0,255,255,0.04); }
      #localReviewModal { animation: fadeIn 0.2s; }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    `;
    document.head.appendChild(style);
  }

  // Инициализация
  document.addEventListener('DOMContentLoaded', function() {
    setupForm();
    renderLocalReviews();
    injectStyles();
  });
})(); 