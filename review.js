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
            <div class="avatar">${review.name.charAt(0)}</div>
            <div>
              <div class="review-name">${review.name} <small>${review.flag}</small></div>
              <div class="review-lang">${review.lang}</div>
            </div>
          </div>
          <div class="review-text">${review.text.substring(0, 120)}...</div>
          <button class="read-more" data-full="${review.text}">Читать полностью</button>
        `;

        reviewsGrid.appendChild(card);
      });

      // после генерации отзывов вешаем обработчики
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