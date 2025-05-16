document.addEventListener('DOMContentLoaded', async function() {
    const carousel = document.querySelector('.reviews-carousel');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const cardsPerColumn = 5;
    let currentPosition = 0;
    let totalColumns = 0;
    let columns = [];

    // Загрузка отзывов из JSON
    async function loadReviews() {
        const response = await fetch('reviews.json');
        return await response.json();
    }

    // Создание DOM-элемента карточки
    function createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-header">
                <div class="review-avatar">${review.letter}</div>
                <div class="review-info">
                    <div class="review-name">${review.name} <span style="font-size:0.9em;color:#76c7c0;">${review.flag}</span></div>
                    <div style="font-size:0.95em;color:#aaa;">${review.lang}</div>
                </div>
            </div>
            <div class="review-content">
                <span class="review-short">${review.short}</span>
                <span class="review-full">${review.full}</span>
                <button class="expand-btn">Читать полностью</button>
            </div>
        `;
        // Кнопка раскрытия
        card.querySelector('.expand-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            card.classList.toggle('expanded');
            if(card.classList.contains('expanded')) {
                this.textContent = 'Скрыть';
            } else {
                this.textContent = 'Читать полностью';
            }
        });
        return card;
    }

    // Формирование колонок
    function createColumns(cards) {
        columns = [];
        totalColumns = Math.ceil(cards.length / cardsPerColumn);
        for (let i = 0; i < totalColumns; i++) {
            const column = document.createElement('div');
            column.className = 'reviews-column';
            columns.push(column);
        }
        cards.forEach((card, idx) => {
            const colIdx = Math.floor(idx / cardsPerColumn);
            columns[colIdx].appendChild(card);
        });
    }

    // Рендер колонок в карусель
    function renderColumns() {
        carousel.innerHTML = '';
        columns.forEach(col => carousel.appendChild(col));
        carousel.style.transform = `translateX(-${currentPosition * 100}%)`;
    }

    // Обновление состояния кнопок
    function updateButtons() {
        prevButton.disabled = currentPosition === 0;
        nextButton.disabled = currentPosition >= totalColumns - columnsPerView;
    }

    // Обработчики кнопок
    function goPrev() {
        if (currentPosition > 0) {
            currentPosition--;
            carousel.style.transform = `translateX(-${currentPosition * 100}%)`;
            updateButtons();
        }
    }
    function goNext() {
        if (currentPosition < totalColumns - columnsPerView) {
            currentPosition++;
            carousel.style.transform = `translateX(-${currentPosition * 100}%)`;
            updateButtons();
        } else if (currentPosition >= totalColumns - columnsPerView) {
            // Если достигли конца — возвращаемся в начало
            currentPosition = 0;
            carousel.style.transform = `translateX(-${currentPosition * 100}%)`;
            updateButtons();
        }
    }
    prevButton.onclick = function() {
        goPrev();
        resetAutoplay();
    };
    nextButton.onclick = function() {
        goNext();
        resetAutoplay();
    };

    // Определение количества колонок вью в зависимости от ширины экрана
    function getColumnsPerView() {
        return window.innerWidth <= 768 ? 1 : 2;
    }
    let columnsPerView = getColumnsPerView();
    window.addEventListener('resize', () => {
        const newColumnsPerView = getColumnsPerView();
        if (newColumnsPerView !== columnsPerView) {
            columnsPerView = newColumnsPerView;
            renderColumns();
            updateButtons();
        }
    });

    // Обновляю автопрокрутку на 5 секунд
    let autoplayInterval = setInterval(goNext, 5000);
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(goNext, 5000);
    }

    // Главная инициализация
    const reviews = await loadReviews();
    const cards = reviews.map(createReviewCard);
    createColumns(cards);
    renderColumns();
    updateButtons();
}); 