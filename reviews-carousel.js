document.addEventListener('DOMContentLoaded', async function() {
    const carousel = document.querySelector('.reviews-carousel');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    
    // Проверяем наличие необходимых элементов
    if (!carousel || !prevButton || !nextButton) {
        console.error('❌ Required carousel elements not found');
        return;
    }

    const cardsPerColumn = 5;
    let currentPosition = 0;
    let columns = [];
    let columnsPerView = getColumnsPerView();
    let maxPosition = 0;
    let cards;

    // Модальное окно для отзыва
    let modal = document.getElementById('modal');
    let modalText = document.getElementById('modal-text');
    let closeModalBtn = document.querySelector('.modal .close-modal');
    
    if (closeModalBtn) {
        closeModalBtn.onclick = () => {
            if (modal) {
                modal.classList.remove('show');
                resetAutoplay();
            }
        };
    }

    window.addEventListener('click', (e) => {
        if (modal && e.target === modal) {
            modal.classList.remove('show');
            resetAutoplay();
        }
    });

    // Загрузка отзывов из JSON
    async function loadReviews() {
        const response = await fetch('reviews.json');
        return await response.json();
    }

    // Генерация случайной даты с 2021 по текущий год
    function getRandomDate() {
        const start = new Date(2021, 0, 1).getTime();
        const end = new Date().getTime();
        const date = new Date(start + Math.random() * (end - start));
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    // Создание DOM-элемента карточки
    function createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card';
        // Добавляем дату
        const reviewDate = review.date || getRandomDate();
        card.innerHTML = `
            <div class="review-header">
                <div class="review-avatar">${review.letter}</div>
                <div class="review-info">
                    <div class="review-name">${review.name} <span style="font-size:0.9em;color:#76c7c0;">${review.flag}</span></div>
                    <span class="review-date">${reviewDate}</span>
                    <div style="font-size:0.95em;color:#aaa;">${review.lang}</div>
                </div>
            </div>
            <div class="review-content">
                <span class="review-short">${review.short}</span>
                <button class="expand-btn">Читать полностью</button>
            </div>
        `;
        // Кнопка раскрытия — теперь открывает модалку
        card.querySelector('.expand-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            if (modal && modalText) {
                modalText.textContent = review.full;
                modal.classList.add('show');
                pauseAutoplay(15000); // Остановить автопрокрутку на 15 секунд
            }
        });
        return card;
    }

    // Формирование колонок
    function createColumns(cards) {
        columns = [];
        const total = Math.ceil(cards.length / cardsPerColumn);
        for (let i = 0; i < total; i++) {
            const column = document.createElement('div');
            column.className = 'reviews-column';
            columns.push(column);
        }
        cards.forEach((card, idx) => {
            const colIdx = Math.floor(idx / cardsPerColumn);
            columns[colIdx].appendChild(card);
        });

        // Удалить пустые колонки
        columns = columns.filter(col => col.children.length > 0);

        // Пересчитать максимальную позицию
        maxPosition = Math.max(0, columns.length - columnsPerView);
        if (currentPosition > maxPosition) {
            currentPosition = maxPosition;
        }
    }

    // Рендер колонок в карусель
    function renderColumns() {
        if (currentPosition > maxPosition) {
            currentPosition = maxPosition;
        }
        carousel.innerHTML = '';
        for (let i = currentPosition; i < currentPosition + columnsPerView && i < columns.length; i++) {
            carousel.appendChild(columns[i]);
        }
    }

    // Обновление состояния кнопок
    function updateButtons() {
        const actualMax = Math.max(0, columns.length - columnsPerView);
        prevButton.disabled = currentPosition === 0;
        nextButton.disabled = currentPosition >= actualMax;
    }

    // Обработчики кнопок
    function goPrev() {
        if (currentPosition > 0) {
            currentPosition--;
            renderColumns();
            updateButtons();
        }
    }
    function goNext() {
        const max = Math.max(0, columns.length - columnsPerView);
        if (currentPosition >= max) return;
        currentPosition++;
        renderColumns();
        updateButtons();
    }
    prevButton.onclick = function() {
        goPrev();
        pauseAutoplay(15000);
    };
    nextButton.onclick = function() {
        goNext();
        pauseAutoplay(15000);
    };

    // Определение количества колонок вью в зависимости от ширины экрана
    function getColumnsPerView() {
        return window.innerWidth <= 768 ? 1 : 3;
    }

    // Главная инициализация
    const reviews = await loadReviews();
    cards = reviews.map(createReviewCard);
    createColumns(cards);
    columnsPerView = getColumnsPerView(); // пересчёт по фактической ширине
    maxPosition = Math.max(0, columns.length - columnsPerView);
    renderColumns();
    updateButtons();

    // Обновленный обработчик resize
    window.addEventListener('resize', () => {
        const newColumnsPerView = getColumnsPerView();
        if (newColumnsPerView !== columnsPerView) {
            columnsPerView = newColumnsPerView;

            // Пересоздаем колонки под новую ширину
            createColumns(cards);
            maxPosition = Math.max(0, columns.length - columnsPerView);

            if (currentPosition > maxPosition) {
                currentPosition = maxPosition;
            }

            renderColumns();
            updateButtons();
        }
    });

    // Автопрокрутка: 7 секунд, пауза 15 секунд при ручном действии
    let autoplayInterval = setInterval(goNext, 7000);
    let autoplayPaused = false;
    let pauseTimeout = null;
    function pauseAutoplay(ms) {
        clearInterval(autoplayInterval);
        autoplayPaused = true;
        if (pauseTimeout) clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(() => {
            autoplayPaused = false;
            autoplayInterval = setInterval(goNext, 7000);
        }, ms);
    }
    function resetAutoplay() {
        if (pauseTimeout) clearTimeout(pauseTimeout);
        clearInterval(autoplayInterval);
        autoplayPaused = false;
        autoplayInterval = setInterval(goNext, 7000);
    }
}); 