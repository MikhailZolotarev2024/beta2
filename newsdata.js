// Константы
const NEWS_CONFIG = {
    ITEMS_PER_PAGE: 3,
    DATE_FORMATS: {
        ru: { locale: 'ru-RU', options: { year: 'numeric', month: 'long', day: 'numeric' } },
        en: { locale: 'en-US', options: { year: 'numeric', month: 'long', day: 'numeric' } }
    }
};

// Кэширование DOM элементов
const DOM = {
    newsCarousel: document.getElementById('newsCarousel'),
    newsModal: document.getElementById('newsModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalDate: document.getElementById('modalDate'),
    modalText: document.getElementById('modalText'),
    pagination: document.querySelector('.news-pagination')
};

// Состояние новостей
const state = {
    currentPage: 1,
    newsItems: [
        {
            id: 1,
            titleKey: "news-launch-title",
            shortTextKey: "news-launch-short",
            fullTextKey: "news-launch-full",
            date: "2024-06-01",
            fullText: "Подробное описание новости, все детали, ссылки и т.д."
        },
        {
            id: 2,
            titleKey: "news-update-title",
            shortTextKey: "news-update-short",
            fullTextKey: "news-update-full",
            date: "2024-05-20",
            fullText: "Теперь доступна мультисетевая проверка, улучшена адаптация и добавлены новые анимации."
        },
        {
            id: 3,
            titleKey: "news-blog-title",
            shortTextKey: "news-blog-short",
            fullTextKey: "news-blog-full",
            date: "2024-05-10",
            fullText: "В статье подробно разбираются основные угрозы и способы защиты ваших активов."
        },
        {
            id: 4,
            titleKey: "news-partnership-title",
            shortTextKey: "news-partnership-short",
            fullTextKey: "news-partnership-full",
            date: "2024-04-28",
            fullText: "Теперь наши клиенты получают ещё больше преимуществ и консультаций."
        },
        {
            id: 5,
            titleKey: "news-team-title",
            shortTextKey: "news-team-short",
            fullTextKey: "news-team-full",
            date: "2024-04-15",
            fullText: "Это позволит нам ещё быстрее и качественнее решать ваши задачи!"
        },
        {
            id: 6,
            titleKey: "news-webinar-title",
            shortTextKey: "news-webinar-short",
            fullTextKey: "news-webinar-full",
            date: "2024-04-01",
            fullText: "Запись вебинара доступна в личном кабинете."
        },
        {
            id: 7,
            titleKey: "news-partners-title",
            shortTextKey: "news-partners-short",
            fullTextKey: "news-partners-full",
            date: "2024-03-20",
            fullText: "Это расширяет возможности для наших пользователей."
        },
        {
            id: 8,
            titleKey: "news-mobile-title",
            shortTextKey: "news-mobile-short",
            fullTextKey: "news-mobile-full",
            date: "2024-03-10",
            fullText: "Теперь пользоваться сервисом с телефона стало проще и быстрее."
        },
        {
            id: 9,
            titleKey: "news-holiday-title",
            shortTextKey: "news-holiday-short",
            fullTextKey: "news-holiday-full",
            date: "2024-02-23",
            fullText: "Скидки и бонусы для всех новых клиентов!"
        },
        {
            id: 10,
            titleKey: "news-faq-title",
            shortTextKey: "news-faq-short",
            fullTextKey: "news-faq-full",
            date: "2024-02-10",
            fullText: "Теперь вы можете быстро найти ответы на популярные вопросы."
        },
        {
            id: 11,
            titleKey: "news-privacy-title",
            shortTextKey: "news-privacy-short",
            fullTextKey: "news-privacy-full",
            date: "2024-01-30",
            fullText: "Пожалуйста, ознакомьтесь с новыми условиями на сайте."
        }
    ]
};

// Получение переведенных новостей
function getTranslatedNews() {
    return state.newsItems.map(item => ({
        ...item,
        title: t(item.titleKey),
        shortText: t(item.shortTextKey),
        fullText: t(item.fullTextKey || '') || item.fullText
    }));
}

// Форматирование даты
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const format = NEWS_CONFIG.DATE_FORMATS[currentLang];
    return date.toLocaleDateString(format.locale, format.options);
}

// Создание элемента новости
function createNewsElement(news) {
    const div = document.createElement('div');
    div.className = 'news-card';
    div.innerHTML = `
        <div class="news-card-title">${news.title}</div>
        <div class="news-card-date">${t('news-date', { date: formatDate(news.date) })}</div>
        <div class="news-card-text">${news.shortText}</div>
        <button class="news-card-more" data-i18n="news-read-more">${t('news-read-more')}</button>
    `;
    
    const button = div.querySelector('.news-card-more');
    if (button) {
        button.addEventListener('click', () => showNewsModal(news));
    }
    
    return div;
}

// Показ модального окна с новостью
function showNewsModal(news) {
    if (DOM.modalTitle) DOM.modalTitle.textContent = news.title;
    if (DOM.modalDate) DOM.modalDate.textContent = t('news-date', { date: formatDate(news.date) });
    if (DOM.modalText) DOM.modalText.textContent = news.fullText;
    
    const modalBtn = DOM.newsModal?.querySelector('.read-more');
    if (modalBtn) modalBtn.style.display = 'none';
    if (DOM.newsModal) DOM.newsModal.classList.add('active');
}

// Обновление пагинации
function updatePagination() {
    const news = getTranslatedNews();
    const totalPages = Math.ceil(news.length / NEWS_CONFIG.ITEMS_PER_PAGE);
    
    if (!DOM.pagination) return;
    
    // Обновляем номера страниц
    const pageButtons = DOM.pagination.querySelectorAll('.pagination-page');
    pageButtons.forEach((button, index) => {
        if (index < totalPages) {
            button.style.display = 'flex';
            button.textContent = index + 1;
            button.classList.toggle('active', index + 1 === state.currentPage);
        } else {
            button.style.display = 'none';
        }
    });
    
    // Обновляем состояние стрелок
    const prevButton = DOM.pagination.querySelector('.pagination-arrow.prev');
    const nextButton = DOM.pagination.querySelector('.pagination-arrow.next');
    
    if (prevButton) prevButton.disabled = state.currentPage === 1;
    if (nextButton) nextButton.disabled = state.currentPage === totalPages;
}

// Обновление карусели новостей
function updateNewsCarousel() {
    if (!DOM.newsCarousel) return;
    
    const news = getTranslatedNews();
    DOM.newsCarousel.innerHTML = '';
    
    const startIndex = (state.currentPage - 1) * NEWS_CONFIG.ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + NEWS_CONFIG.ITEMS_PER_PAGE, news.length);
    
    for (let i = startIndex; i < endIndex; i++) {
        if (news[i]) {
            DOM.newsCarousel.appendChild(createNewsElement(news[i]));
        }
    }
    
    updatePagination();
}

// Инициализация новостей
function initNews() {
    updateNewsCarousel();
    
    // Обработчики пагинации
    if (DOM.pagination) {
        const prevButton = DOM.pagination.querySelector('.pagination-arrow.prev');
        const nextButton = DOM.pagination.querySelector('.pagination-arrow.next');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (state.currentPage > 1) {
                    state.currentPage--;
                    updateNewsCarousel();
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const totalPages = Math.ceil(state.newsItems.length / NEWS_CONFIG.ITEMS_PER_PAGE);
                if (state.currentPage < totalPages) {
                    state.currentPage++;
                    updateNewsCarousel();
                }
            });
        }
        
        // Обработчики номеров страниц
        const pageButtons = DOM.pagination.querySelectorAll('.pagination-page');
        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const page = parseInt(button.textContent);
                if (page !== state.currentPage) {
                    state.currentPage = page;
                    updateNewsCarousel();
                }
            });
        });
    }
}

// Экспорт функций
window.updateNewsCarousel = updateNewsCarousel;
window.showNewsModal = showNewsModal;
window.initNews = initNews; 