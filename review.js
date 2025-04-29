document.addEventListener('DOMContentLoaded', () => {
  const reviewsGrid = document.querySelector('.reviews-grid');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modal-text');
  const closeModal = document.querySelector('.close-modal');

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

      document.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', () => {
          modalText.textContent = button.getAttribute('data-full');
          modal.classList.add('show');
        });
      });
    });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
});
    function openAddModal() {
      document.getElementById('addModal').style.display = 'flex';
    }
    function closeAddModal() {
      document.getElementById('addModal').style.display = 'none';
    }
    function closeModal() {
      document.getElementById('modal').classList.remove('show');
    }
 document.getElementById('reviewForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = this.name.value;
    const lang = this.lang.value;
    const flag = this.flag.value;
    const short = this.short.value;
    const full = this.full.value;
    const letter = name.trim()[0].toUpperCase();

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

    document.querySelector('.reviews-grid').appendChild(newCard);
    closeAddModal();

    // Повторно навешиваем слушатель
    newCard.querySelector('.read-more').addEventListener('click', () => {
      modalText.textContent = full;
      modal.classList.add('show');
    });

    this.reset();
  });

document.addEventListener('DOMContentLoaded', () => {
  // (у тебя тут уже код загрузки отзывов)

  const reviewForm = document.getElementById('reviewForm');
  const addModal = document.getElementById('addModal');

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

    document.querySelector('.reviews-grid').appendChild(newCard);

    // Сразу привязываем кнопку "читать полностью" к новой карточке
    newCard.querySelector('.read-more').addEventListener('click', () => {
      modalText.textContent = full;
      modal.classList.add('show');
    });

    // Закрываем окно и очищаем форму
    addModal.style.display = 'none';
    this.reset();
  });
});