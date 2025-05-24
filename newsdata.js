const newsItems = [
  {
    id: 1,
    titleKey: "news-launch-title",
    shortTextKey: "news-launch-short",
    date: "2024-06-01",
    fullText: "Подробное описание новости, все детали, ссылки и т.д."
  },
  {
    id: 2,
    titleKey: "news-update-title",
    shortTextKey: "news-update-short",
    date: "2024-05-20",
    fullText: "Теперь доступна мультисетевая проверка, улучшена адаптация и добавлены новые анимации."
  },
  {
    id: 3,
    titleKey: "news-blog-title",
    shortTextKey: "news-blog-short",
    date: "2024-05-10",
    fullText: "В статье подробно разбираются основные угрозы и способы защиты ваших активов."
  },
  {
    id: 4,
    titleKey: "news-partnership-title",
    shortTextKey: "news-partnership-short",
    date: "2024-04-28",
    fullText: "Теперь наши клиенты получают ещё больше преимуществ и консультаций."
  },
  {
    id: 5,
    titleKey: "news-team-title",
    shortTextKey: "news-team-short",
    date: "2024-04-15",
    fullText: "Это позволит нам ещё быстрее и качественнее решать ваши задачи!"
  },
  {
    id: 6,
    titleKey: "news-webinar-title",
    shortTextKey: "news-webinar-short",
    date: "2024-04-01",
    fullText: "Запись вебинара доступна в личном кабинете."
  },
  {
    id: 7,
    titleKey: "news-partners-title",
    shortTextKey: "news-partners-short",
    date: "2024-03-20",
    fullText: "Это расширяет возможности для наших пользователей."
  },
  {
    id: 8,
    titleKey: "news-mobile-title",
    shortTextKey: "news-mobile-short",
    date: "2024-03-10",
    fullText: "Теперь пользоваться сервисом с телефона стало проще и быстрее."
  },
  {
    id: 9,
    titleKey: "news-holiday-title",
    shortTextKey: "news-holiday-short",
    date: "2024-02-23",
    fullText: "Скидки и бонусы для всех новых клиентов!"
  },
  {
    id: 10,
    titleKey: "news-faq-title",
    shortTextKey: "news-faq-short",
    date: "2024-02-10",
    fullText: "Теперь вы можете быстро найти ответы на популярные вопросы."
  },
  {
    id: 11,
    titleKey: "news-privacy-title",
    shortTextKey: "news-privacy-short",
    date: "2024-01-30",
    fullText: "Пожалуйста, ознакомьтесь с новыми условиями на сайте."
  }
];

// Функция для получения переведенного текста
function getTranslatedNews() {
  return newsItems.map(item => ({
    ...item,
    title: t(item.titleKey),
    shortText: t(item.shortTextKey)
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
  div.className = 'news-item';
  div.innerHTML = `
    <h3>${news.title}</h3>
    <div class="news-date">${t('news-date', { date: formatDate(news.date) })}</div>
    <p>${news.shortText}</p>
    <button class="read-more" data-i18n="news-read-more">${t('news-read-more')}</button>
  `;
  
  div.querySelector('.read-more').addEventListener('click', () => {
    showNewsModal(news);
  });
  
  return div;
}

// Функция для показа модального окна с новостью
function showNewsModal(news) {
  const modal = document.getElementById('newsModal');
  const title = document.getElementById('modalTitle');
  const date = document.getElementById('modalDate');
  const text = document.getElementById('modalText');
  
  title.textContent = news.title;
  date.textContent = t('news-date', { date: formatDate(news.date) });
  text.textContent = news.fullText;
  
  modal.style.display = 'block';
}

// Инициализация карусели новостей
function initNewsCarousel() {
  const carousel = document.getElementById('newsCarousel');
  const prevBtn = document.getElementById('newsPrevBtn');
  const nextBtn = document.getElementById('newsNextBtn');
  const closeBtn = document.getElementById('newsModalClose');
  const modal = document.getElementById('newsModal');
  
  let currentIndex = 0;
  const news = getTranslatedNews();
  
  function updateCarousel() {
    carousel.innerHTML = '';
    const start = currentIndex;
    const end = Math.min(start + 3, news.length);
    
    for (let i = start; i < end; i++) {
      carousel.appendChild(createNewsElement(news[i]));
    }
  }
  
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentIndex < news.length - 3) {
      currentIndex++;
      updateCarousel();
    }
  });
  
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  updateCarousel();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initNewsCarousel();
}); 