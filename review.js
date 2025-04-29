document.addEventListener('DOMContentLoaded', () => {
  const reviewsGrid = document.querySelector('.reviews-grid');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modal-text');
  const closeModalBtn = document.querySelector('.modal .close-modal');
  const addModal = document.getElementById('addModal');
  const closeAddModalBtn = document.querySelector('.add-modal .close-modal');
  const addReviewBtn = document.querySelector('.add-review-btn');
  const reviewForm = document.getElementById('reviewForm');

  // Загрузка отзывов
  fetch('reviews.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
          <div class="review-header">
            <div class="avatar">${review.letter}</div>
            <div>
              <div class="review-name">${review.name} <small>${review.flag}</small></div>
              <div class="review-lang">${review.lang}</div>
            </div>
          </div>
          <div class="review-text">${review.short}</div>
          <button class="read-more" data-full="${review.full}">Читать полностью</button>
        `;
        reviewsGrid.appendChild(card);
      });

      // Навешиваем обработчики на кнопки "читать полностью"
      document.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', () => {
          modalText.textContent = button.getAttribute('data-full');
          modal.classList.add('show');
        });
      });
    });

  // Открытие модалки отзыва
  addReviewBtn.addEventListener('click', () => {
    addModal.style.display = 'flex';
  });

  // Закрытие модалки отзыва
  closeAddModalBtn.addEventListener('click', () => {
    addModal.style.display = 'none';
  });

  // Закрытие основной модалки
  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
    if (e.target === addModal) {
      addModal.style.display = 'none';
    }
  });

  // Обработка отправки формы
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = this.name.value.trim();
    const lang = this.lang.value.trim();
    const flag = this.flag.value.trim();
    const short = this.short.value.trim();
    const full = this.full.value.trim();
    const letter = name.charAt(0).toUpperCase();

    const newCard = document.createElement('div');
    newCard.className = 'review-card';
    newCard.innerHTML = `
      <div class="review-header">
        <div class="avatar">${letter}</div>
        <div>
          <div class="review-name">${name} <small>${flag}</small></div>
          <div class="review-lang">${lang}</div>
        </div>
      </div>
      <div class="review-text">${short}</div>
      <button class="read-more" data-full="${full}">Читать полностью</button>
    `;

    reviewsGrid.appendChild(newCard);

    // Навешиваем событие на новую кнопку "читать полностью"
    newCard.querySelector('.read-more').addEventListener('click', () => {
      modalText.textContent = full;
      modal.classList.add('show');
    });

    // Закрываем окно и чистим форму
    addModal.style.display = 'none';
    this.reset();
  });
});

function openAddModal() {
  const addModal = document.getElementById('addModal');
  if (addModal) {
    addModal.style.display = 'flex';
  }
}

function closeAddModal() {
  const addModal = document.getElementById('addModal');
  if (addModal) {
    addModal.style.display = 'none';
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('show');
  }
}