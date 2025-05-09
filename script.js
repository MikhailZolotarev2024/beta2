window.addEventListener('DOMContentLoaded', () => {
// Глобальные функции
function toggleMenu() {
  const menuIcon = document.querySelector(".menu-icon");
  const menuDropdown = document.querySelector(".menu-dropdown");
  if (menuIcon && menuDropdown) {
    menuIcon.classList.toggle("active");
    menuDropdown.classList.toggle("active");
  }
}

const icon = document.querySelector(".menu-icon");
if (icon) {
  icon.addEventListener("click", toggleMenu);
}

function toggleSection(event) {
  const section = event.target.parentElement;
  if (section) {
    section.classList.toggle("active");
  }
}

if (window.particlesJS) {
  const particlesEl = document.getElementById('particles-js');
  if (particlesEl) {
    particlesJS("particles-js", {
      "particles": {
        "number": { "value": 100, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#00ffff" },
        "shape": { "type": "circle", "stroke": { "width": 1, "color": "#ffffff" } },
        "opacity": { "value": 0.6, "random": true },
        "size": { "value": 3, "random": true },
        "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
        "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out" }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } },
        "modes": { "grab": { "distance": 200, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
      },
      "retina_detect": true
    });
  }
}

// Карусель
const carousel = document.querySelector(".carousel-inner");
let items = Array.from(document.querySelectorAll(".carousel-item"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

if (carousel && items.length) {
  let index = items.length;
  let itemWidth = items[0]?.offsetWidth ? items[0].offsetWidth + 20 : 0;
  let isMoving = false;
  let autoSlideInterval;

  // Клонируем элементы
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    carousel.appendChild(clone);
  });
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    carousel.insertBefore(clone, items[0]);
  });
  const allItems = Array.from(document.querySelectorAll(".carousel-item"));
  itemWidth = allItems[1]?.offsetWidth ? allItems[1].offsetWidth + 20 : 0;
  carousel.style.transform = `translateX(${-index * itemWidth}px)`;

  function updateCarousel() {
    if (isMoving) return;
    isMoving = true;
    carousel.style.transition = "transform 0.5s ease-in-out";
    carousel.style.transform = `translateX(${-index * itemWidth}px)`;
    setTimeout(() => {
      if (index >= allItems.length - items.length) {
        carousel.style.transition = "none";
        index = items.length;
        carousel.style.transform = `translateX(${-index * itemWidth}px)`;
      }
      if (index <= 0) {
        carousel.style.transition = "none";
        index = allItems.length - items.length * 2;
        carousel.style.transform = `translateX(${-index * itemWidth}px)`;
      }
      isMoving = false;
    }, 500);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      index++;
      updateCarousel();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      index--;
      updateCarousel();
    });
  }

  function autoSlide() {
    index++;
    updateCarousel();
  }
  autoSlideInterval = setInterval(autoSlide, 3000);
  carousel.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
  carousel.addEventListener("mouseleave", () => {
    autoSlideInterval = setInterval(autoSlide, 3000);
  });
  window.addEventListener("resize", function () {
    itemWidth = allItems[1]?.offsetWidth ? allItems[1].offsetWidth + 20 : 0;
    carousel.style.transition = "none";
    carousel.style.transform = `translateX(${-index * itemWidth}px)`;
  });
}

const showMoreBtn = document.getElementById('showMoreNews');
if (showMoreBtn) {
  showMoreBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const widget = document.querySelector('.news-widget');
    if (widget) {
      widget.classList.remove('collapsed');
      this.style.display = 'none';
    }
  });
}

function openNewsModal(id) {
  const news = typeof newsItems !== 'undefined' ? newsItems : [];
  const item = news.find(n => n.id === id);
  if (!item) return;
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalText = document.getElementById('modalText');
  const newsModal = document.getElementById('newsModal');
  if (modalTitle) modalTitle.innerText = item.title;
  if (modalDate) modalDate.innerText = item.date;
  if (modalText) modalText.innerText = item.fullText || item.shortText;
  if (newsModal) newsModal.classList.add('active');
}

const newsModalClose = document.getElementById('newsModalClose');
if (newsModalClose) {
  newsModalClose.onclick = function() {
    const newsModal = document.getElementById('newsModal');
    if (newsModal) newsModal.classList.remove('active');
  };
}

const rows = document.querySelectorAll(".wave-row");
if (rows.length) {
  const shown = new Set();
  const waveObserver = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting && !shown.has(entry.target)) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, delay);
        delay += 200;
        shown.add(entry.target);
        waveObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: "0px" });
  rows.forEach(row => waveObserver.observe(row));
  setTimeout(() => window.dispatchEvent(new Event('scroll')), 100);
}

function animateDots(grid) {
  const activeCount = parseInt(grid.getAttribute('data-active')) || 0;
  const dots = [];
  for (let i = 0; i < 100; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i < activeCount) dot.classList.add('active');
    dots.push(dot);
    grid.appendChild(dot);
  }
  dots.forEach((dot, i) => {
    setTimeout(() => dot.classList.add('visible'), i * 20);
  });
}
const dotGrids = document.querySelectorAll('.dot-grid');
if (dotGrids.length) {
  const dotObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('activated')) {
        entry.target.classList.add('activated');
        animateDots(entry.target);
      }
    });
  }, { threshold: 0.5 });
  dotGrids.forEach(grid => {
    dotObserver.observe(grid);
  });
}
const cookieConsent = document.getElementById('cookieConsent');
if (cookieConsent) {
  // Проверяем наличие cookie
  const cookiesAccepted = document.cookie.split(';').some(cookie => cookie.trim().startsWith('cookiesAccepted='));
  
  if (!cookiesAccepted) {
    cookieConsent.style.display = 'flex';
    const acceptBtn = document.getElementById('acceptCookiesBtn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function() {
        // Устанавливаем cookie с дополнительными параметрами
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `cookiesAccepted=true; path=/; expires=${date.toUTCString()}; SameSite=Lax`;
        
        // Скрываем уведомление
        cookieConsent.style.display = 'none';
        
        // Проверяем, что cookie установился
        console.log('Cookie установлен:', document.cookie);
      });
    }
  } else {
    cookieConsent.style.display = 'none';
  }
}
// --- Новости: вывод, листание, модальное окно (оптимизировано под 3x2) ---
function getNewsPerPage() {
  return window.innerWidth <= 600 ? 2 : 6;
}
let currentPage = 0;
function renderNewsPages() {
  const news = typeof newsItems !== 'undefined' ? newsItems : [];
  const NEWS_PER_PAGE = getNewsPerPage();
  const totalPages = Math.ceil(news.length / NEWS_PER_PAGE);
  const carousel = document.getElementById('newsCarousel');
  if (!carousel) return;
  let pagesHTML = '';
  for (let p = 0; p < totalPages; p++) {
    const pageNews = news.slice(p * NEWS_PER_PAGE, (p + 1) * NEWS_PER_PAGE);
    pagesHTML += '<div class="news-grid">';
    for (let i = 0; i < NEWS_PER_PAGE; i++) {
      const newsItem = pageNews[i];
      if (newsItem) {
        pagesHTML += `
          <div class="news-card" data-id="${newsItem.id}">
            <div class="news-card-title">${newsItem.title}</div>
            <div class="news-card-date">${newsItem.date}</div>
            <div class="news-card-text">${newsItem.shortText}</div>
            <button class="news-card-more" data-id="${newsItem.id}">Подробнее</button>
          </div>
        `;
      } else {
        pagesHTML += `<div class="news-card news-card-empty"></div>`;
      }
    }
    pagesHTML += '</div>';
  }
  carousel.innerHTML = pagesHTML;
  updateNewsCarousel();
  document.querySelectorAll('.news-card-more').forEach(btn => {
    btn.onclick = function() {
      const id = +this.dataset.id;
      openNewsModal(id);
    };
  });
}
function updateNewsCarousel() {
  const carousel = document.getElementById('newsCarousel');
  const NEWS_PER_PAGE = getNewsPerPage();
  const news = typeof newsItems !== 'undefined' ? newsItems : [];
  const totalPages = Math.ceil(news.length / NEWS_PER_PAGE);
  if (carousel) {
    carousel.style.transform = `translateX(-${currentPage * 100}%)`;
  }
  const prevBtn = document.getElementById('newsPrevBtn');
  const nextBtn = document.getElementById('newsNextBtn');
  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
}
const newsPrevBtn = document.getElementById('newsPrevBtn');
if (newsPrevBtn) {
  newsPrevBtn.onclick = function() {
    if (currentPage > 0) {
      currentPage--;
      updateNewsCarousel();
    }
  };
}
const newsNextBtn = document.getElementById('newsNextBtn');
if (newsNextBtn) {
  newsNextBtn.onclick = function() {
    const NEWS_PER_PAGE = getNewsPerPage();
    const news = typeof newsItems !== 'undefined' ? newsItems : [];
    const totalPages = Math.ceil(news.length / NEWS_PER_PAGE);
    if (currentPage < totalPages - 1) {
      currentPage++;
      updateNewsCarousel();
    }
  };
}
document.addEventListener('DOMContentLoaded', function() {
  const newsCarousel = document.getElementById('newsCarousel');
  if (newsCarousel) renderNewsPages();
});
window.addEventListener('resize', function() {
  currentPage = 0;
  renderNewsPages();
  updateNewsCarousel();
});
// --- Конец блока новостей ---
});


