document.addEventListener('DOMContentLoaded', () => {
  const reviewsGrid = document.querySelector('.reviews-grid');
  const reviewForm = document.getElementById('reviewForm');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modal-text');
  const closeModalBtn = document.querySelector('.modal .close-modal');

  // Отправка новой формы
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = this.name.value.trim();
    const lang = this.lang.value.trim();
    const flag = this.flag.value.trim();
    const short = this.short.value.trim();
    const full = this.full.value.trim();
    const letter = name.charAt(0).toUpperCase();

    const newReview = { name, lang, flag, short, full, letter };
    const card = createReviewCard(newReview);
    reviewsGrid.appendChild(card);

    this.reset();
  });

  function createReviewCard(review) {
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

    card.querySelector('.read-more').addEventListener('click', () => {
      modalText.textContent = review.full;
      modal.classList.add('show');
    });

    return card;
  }

  // Закрыть модалку
  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
});