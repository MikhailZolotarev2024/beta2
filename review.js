fetch('reviews.json')
  .then(response => response.json())
  .then(data => {
    const reviewsGrid = document.querySelector('.reviews-grid');
    data.forEach(review => {
      const card = document.createElement('div');
      card.classList.add('review-card');

      card.innerHTML = `
        <div class="review-header">
          <div class="avatar">${review.letter}</div>
          <div>
            <div class="review-name">${review.name} ${review.flag}</div>
            <div class="review-lang">${review.lang.toUpperCase()}</div>
          </div>
        </div>
        <div class="review-text">${review.short}</div>
        <button class="read-more" data-full="${review.full}">Читать полностью</button>
      `;

      reviewsGrid.appendChild(card);
    });

    attachReadMoreLogic(); // Привязываем обработчики к новым кнопкам
  });

function attachReadMoreLogic() {
  const readMoreButtons = document.querySelectorAll('.read-more');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modal-text');
  const closeModal = document.querySelector('.close-modal');

  readMoreButtons.forEach(button => {
    button.addEventListener('click', () => {
      modalText.textContent = button.getAttribute('data-full');
      modal.style.display = 'flex';
    });
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target == modal) {
      modal.style.display = 'none';
    }
  });
}