const newsItems = [
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
];

// Глобальная переменная для хранения текущей страницы
let currentPage = 1;
const itemsPerPage = 3;

// Функция для получения переведенного текста
function getTranslatedNews() {
  return newsItems.map(item => ({
    ...item,
    title: t(item.titleKey),
    shortText: t(item.shortTextKey),
    fullText: t(item.fullTextKey || '') || item.fullText
  }));
}

// Функция для форматирования даты
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Функция для создания элемента новости
function createNewsElement(news) {
  const div = document.createElement('div');
  div.className = 'news-card';
  div.innerHTML = `
    <div class="news-card-title">${news.title}</div>
    <div class="news-card-date">${t('news-date', { date: formatDate(news.date) })}</div>
    <div class="news-card-text">${news.shortText}</div>
    <button class="news-card-more" data-i18n="news-read-more">${t('news-read-more')}</button>
  `;
  
  // Добавляем обработчик для кнопки
  const button = div.querySelector('.news-card-more');
  if (button) {
    button.addEventListener('click', () => showNewsModal(news));
  }
  
  return div;
}

// Функция для показа модального окна с новостью
function showNewsModal(news) {
  const modal = document.getElementById('newsModal');
  const title = document.getElementById('modalTitle');
  const date = document.getElementById('modalDate');
  const text = document.getElementById('modalText');
  const modalBtn = document.querySelector('#newsModal .read-more');
  
  if (title) title.textContent = news.title;
  if (date) date.textContent = t('news-date', { date: formatDate(news.date) });
  if (text) text.textContent = news.fullText;
  // Скрываем кнопку внутри модалки, если она осталась
  if (modalBtn) modalBtn.style.display = 'none';
  if (modal) modal.classList.add('active');
}

// Функция для обновления пагинации
function updatePagination() {
  const news = getTranslatedNews();
  const totalPages = Math.ceil(news.length / itemsPerPage);
  const pagination = document.querySelector('.news-pagination');
  
  // Обновляем номера страниц
  const pageButtons = pagination.querySelectorAll('.pagination-page');
  pageButtons.forEach((button, index) => {
    if (index < totalPages) {
      button.style.display = 'flex';
      button.textContent = index + 1;
      button.classList.toggle('active', index + 1 === currentPage);
    } else {
      button.style.display = 'none';
    }
  });
  
  // Обновляем состояние стрелок
  const prevButton = pagination.querySelector('.pagination-arrow.prev');
  const nextButton = pagination.querySelector('.pagination-arrow.next');
  
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

// Функция для обновления карусели новостей
function updateNewsCarousel() {
  const carousel = document.getElementById('newsCarousel');
  const news = getTranslatedNews();
  
  // Очищаем карусель
  carousel.innerHTML = '';
  
  // Вычисляем индексы для текущей страницы
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, news.length);
  
  // Добавляем новости для текущей страницы
  for (let i = startIndex; i < endIndex; i++) {
    if (news[i]) {
      carousel.appendChild(createNewsElement(news[i]));
    }
  }
  
  // Обновляем пагинацию
  updatePagination();
}

// Инициализация карусели новостей
window.initNewsCarousel = function() {
  const carousel = document.getElementById('newsCarousel');
  const pagination = document.querySelector('.news-pagination');
  
  if (!carousel || !pagination) {
    console.error('❌ Required news carousel elements not found');
    return;
  }

  // Добавляем обработчики для кнопок пагинации
  pagination.addEventListener('click', (e) => {
    if (e.target.classList.contains('pagination-page')) {
      currentPage = parseInt(e.target.textContent);
      updateNewsCarousel();
    } else if (e.target.classList.contains('pagination-arrow')) {
      if (e.target.classList.contains('prev') && currentPage > 1) {
        currentPage--;
      } else if (e.target.classList.contains('next')) {
        const news = getTranslatedNews();
        const totalPages = Math.ceil(news.length / itemsPerPage);
        if (currentPage < totalPages) {
          currentPage++;
        }
      }
      updateNewsCarousel();
    }
  });
  
  // Инициализируем карусель
  updateNewsCarousel();
};

// Удаляем инициализацию из DOMContentLoaded
// document.addEventListener('DOMContentLoaded', () => {
//   initNewsCarousel();
// }); 