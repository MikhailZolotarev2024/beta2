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

// Глобальная переменная для хранения текущей позиции карусели
let currentIndex = 0;

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

// Инициализация карусели новостей
window.initNewsCarousel = function() {
  const carousel = document.getElementById('newsCarousel');
  const prevBtn = document.getElementById('newsPrevBtn');
  const nextBtn = document.getElementById('newsNextBtn');
  const closeBtn = document.getElementById('newsModalClose');
  const modal = document.getElementById('newsModal');
  
  if (!carousel || !prevBtn || !nextBtn) {
    console.error('❌ Required news carousel elements not found');
    return;
  }

  // Очищаем карусель и добавляем начальные карточки
  carousel.innerHTML = '';
  const news = getTranslatedNews();
  for (let i = 0; i < 3; i++) {
    if (news[i]) {
      carousel.appendChild(createNewsElement(news[i]));
    }
  }
  
  window.updateNewsCarousel = function() {
    const news = getTranslatedNews();
    const cards = carousel.querySelectorAll('.news-card');
    
    cards.forEach((card, i) => {
      const newsItem = news[i + currentIndex];
      if (!newsItem) return;
      
      const title = card.querySelector('.news-card-title');
      const date = card.querySelector('.news-card-date');
      const text = card.querySelector('.news-card-text');
      const button = card.querySelector('.news-card-more');
      
      if (title) title.textContent = newsItem.title;
      if (date) date.textContent = t('news-date', { date: formatDate(newsItem.date) });
      if (text) text.textContent = newsItem.shortText;
      if (button) {
        button.textContent = t('news-read-more');
        button.onclick = () => showNewsModal(newsItem);
      }
    });
  };
  
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateNewsCarousel();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentIndex < newsItems.length - 3) {
      currentIndex++;
      updateNewsCarousel();
    }
  });
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  }
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
  
  updateNewsCarousel();
};

// Удаляем инициализацию из DOMContentLoaded
// document.addEventListener('DOMContentLoaded', () => {
//   initNewsCarousel();
// }); 