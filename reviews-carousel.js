// Константы
const CAROUSEL_CONFIG = {
    CARDS_PER_COLUMN: 5,
    AUTOPLAY_INTERVAL: 7000,
    PAUSE_DURATION: 15000,
    MOBILE_BREAKPOINT: 768
};

// Кэширование DOM элементов
const DOM = {
    carousel: document.querySelector('.reviews-carousel'),
    prevButton: document.querySelector('.carousel-button.prev'),
    nextButton: document.querySelector('.carousel-button.next'),
    modal: document.getElementById('modal'),
    modalText: document.getElementById('modal-text'),
    closeModalBtn: document.querySelector('.modal .close-modal')
};

// Состояние карусели
const state = {
    currentPosition: 0,
    columns: [],
    columnsPerView: getColumnsPerView(),
    maxPosition: 0,
    cards: [],
    autoplayInterval: null,
    autoplayPaused: false,
    pauseTimeout: null
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', async function() {
    if (!validateElements()) return;
    
    setupEventListeners();
    await initializeCarousel();
});

// Валидация необходимых элементов
function validateElements() {
    if (!DOM.carousel || !DOM.prevButton || !DOM.nextButton) {
        console.error('❌ Required carousel elements not found');
        return false;
    }
    return true;
}

// Настройка обработчиков событий
function setupEventListeners() {
    if (DOM.closeModalBtn) {
        DOM.closeModalBtn.onclick = () => {
            if (DOM.modal) {
                DOM.modal.classList.remove('show');
                resetAutoplay();
            }
        };
    }

    window.addEventListener('click', (e) => {
        if (DOM.modal && e.target === DOM.modal) {
            DOM.modal.classList.remove('show');
            resetAutoplay();
        }
    });

    DOM.prevButton.onclick = () => {
        goPrev();
        pauseAutoplay(CAROUSEL_CONFIG.PAUSE_DURATION);
    };

    DOM.nextButton.onclick = () => {
        goNext();
        pauseAutoplay(CAROUSEL_CONFIG.PAUSE_DURATION);
    };

    window.addEventListener('resize', debounce(handleResize, 250));
}

// Инициализация карусели
async function initializeCarousel() {
    try {
        const reviews = await loadReviews();
        state.cards = reviews.map(createReviewCard);
        createColumns(state.cards);
        state.columnsPerView = getColumnsPerView();
        state.maxPosition = Math.max(0, state.columns.length - state.columnsPerView);
        renderColumns();
        updateButtons();
        startAutoplay();
    } catch (error) {
        console.error('❌ Error initializing carousel:', error);
    }
}

// Загрузка отзывов
async function loadReviews() {
    const response = await fetch('reviews.json');
    return await response.json();
}

// Создание карточки отзыва
function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
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

    card.querySelector('.expand-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (DOM.modal && DOM.modalText) {
            DOM.modalText.textContent = review.full;
            DOM.modal.classList.add('show');
            pauseAutoplay(CAROUSEL_CONFIG.PAUSE_DURATION);
        }
    });

    return card;
}

// Управление колонками
function createColumns(cards) {
    state.columns = [];
    const total = Math.ceil(cards.length / CAROUSEL_CONFIG.CARDS_PER_COLUMN);
    
    for (let i = 0; i < total; i++) {
        const column = document.createElement('div');
        column.className = 'reviews-column';
        state.columns.push(column);
    }

    cards.forEach((card, idx) => {
        const colIdx = Math.floor(idx / CAROUSEL_CONFIG.CARDS_PER_COLUMN);
        state.columns[colIdx].appendChild(card);
    });

    state.columns = state.columns.filter(col => col.children.length > 0);
    state.maxPosition = Math.max(0, state.columns.length - state.columnsPerView);
    
    if (state.currentPosition > state.maxPosition) {
        state.currentPosition = state.maxPosition;
    }
}

// Рендеринг колонок
function renderColumns() {
    if (state.currentPosition > state.maxPosition) {
        state.currentPosition = state.maxPosition;
    }
    
    DOM.carousel.innerHTML = '';
    for (let i = state.currentPosition; i < state.currentPosition + state.columnsPerView && i < state.columns.length; i++) {
        DOM.carousel.appendChild(state.columns[i]);
    }
}

// Обновление состояния кнопок
function updateButtons() {
    const actualMax = Math.max(0, state.columns.length - state.columnsPerView);
    DOM.prevButton.disabled = state.currentPosition === 0;
    DOM.nextButton.disabled = state.currentPosition >= actualMax;
}

// Навигация
function goPrev() {
    if (state.currentPosition > 0) {
        state.currentPosition--;
        renderColumns();
        updateButtons();
    }
}

function goNext() {
    const max = Math.max(0, state.columns.length - state.columnsPerView);
    if (state.currentPosition >= max) return;
    state.currentPosition++;
    renderColumns();
    updateButtons();
}

// Автопрокрутка
function startAutoplay() {
    state.autoplayInterval = setInterval(goNext, CAROUSEL_CONFIG.AUTOPLAY_INTERVAL);
}

function pauseAutoplay(ms) {
    clearInterval(state.autoplayInterval);
    state.autoplayPaused = true;
    if (state.pauseTimeout) clearTimeout(state.pauseTimeout);
    state.pauseTimeout = setTimeout(() => {
        state.autoplayPaused = false;
        startAutoplay();
    }, ms);
}

function resetAutoplay() {
    if (state.pauseTimeout) clearTimeout(state.pauseTimeout);
    if (!state.autoplayPaused) {
        startAutoplay();
    }
}

// Вспомогательные функции
function getColumnsPerView() {
    return window.innerWidth <= CAROUSEL_CONFIG.MOBILE_BREAKPOINT ? 1 : 3;
}

function getRandomDate() {
    const start = new Date(2021, 0, 1).getTime();
    const end = new Date().getTime();
    const date = new Date(start + Math.random() * (end - start));
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleResize() {
    const newColumnsPerView = getColumnsPerView();
    if (newColumnsPerView !== state.columnsPerView) {
        state.columnsPerView = newColumnsPerView;
        createColumns(state.cards);
        renderColumns();
        updateButtons();
    }
} 