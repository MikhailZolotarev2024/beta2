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
      <button class="read-more">Подробнее</button>
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
    const [nameInput, flagInput, langInput, shortTextarea, fullTextarea, submitBtn] = form.querySelectorAll('input, textarea, button');
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const name = nameInput.value.trim();
      const flag = flagInput.value.trim();
      const lang = langInput.value.trim();
      const short = shortTextarea.value.trim();
      const full = fullTextarea.value.trim();
      if (!name || !flag || !lang || !short) {
        submitBtn.textContent = 'Заполните все поля';
        setTimeout(() => submitBtn.textContent = '📩 Отправить отзыв', 1500);
        return;
      }
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
      // Очистить форму
      nameInput.value = '';
      flagInput.value = '';
      langInput.value = '';
      shortTextarea.value = '';
      fullTextarea.value = '';
      submitBtn.textContent = 'Спасибо!';
      setTimeout(() => submitBtn.textContent = '📩 Отправить отзыв', 1500);
      renderLocalReviews();
      // Вызываем обновление отображения пагинации после добавления нового отзыва
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