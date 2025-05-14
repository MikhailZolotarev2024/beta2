document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.reviews-carousel');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const cards = document.querySelectorAll('.review-card');
    const cardsPerColumn = 5;
    const columnsPerView = 2;
    let currentPosition = 0;
    const totalColumns = Math.ceil(cards.length / cardsPerColumn);

    // Создаем колонки
    function createColumns() {
        const columns = [];
        for (let i = 0; i < totalColumns; i++) {
            const column = document.createElement('div');
            column.className = 'reviews-column';
            columns.push(column);
        }

        // Распределяем карточки по колонкам
        cards.forEach((card, index) => {
            const columnIndex = Math.floor(index / cardsPerColumn);
            columns[columnIndex].appendChild(card);
        });

        // Добавляем колонки в карусель
        columns.forEach(column => carousel.appendChild(column));
    }

    // Обновляем состояние кнопок
    function updateButtons() {
        prevButton.disabled = currentPosition === 0;
        nextButton.disabled = currentPosition >= totalColumns - columnsPerView;
    }

    // Обработчики событий для кнопок
    prevButton.addEventListener('click', () => {
        if (currentPosition > 0) {
            currentPosition--;
            carousel.style.transform = `translateX(-${currentPosition * 100}%)`;
            updateButtons();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPosition < totalColumns - columnsPerView) {
            currentPosition++;
            carousel.style.transform = `translateX(-${currentPosition * 100}%)`;
            updateButtons();
        }
    });

    // Обработчик клика по карточке для раскрытия полного отзыва
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });

    // Инициализация
    createColumns();
    updateButtons();
}); 