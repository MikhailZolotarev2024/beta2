// Глобальные функции
function toggleMenu() {
  const menuIcon = document.querySelector(".menu-icon");
  const menuDropdown = document.querySelector(".menu-dropdown");

  if (menuIcon && menuDropdown) {
    menuIcon.classList.toggle("active");
    menuDropdown.classList.toggle("active");
  }
}

// 👇 безопасное навешивание обработчика
document.addEventListener("DOMContentLoaded", () => {
  const icon = document.querySelector(".menu-icon");
  if (icon) {
    icon.addEventListener("click", toggleMenu);
  }
});

function toggleSection(event) {
    const section = event.target.parentElement;
    if (section) {
        section.classList.toggle("active");
    }
}




particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 100,
            "density": { "enable": true, "value_area": 800 }
        },
        "color": { "value": "#00ffff" },
        "shape": {
            "type": "circle",
            "stroke": { "width": 1, "color": "#ffffff" }
        },
        "opacity": {
            "value": 0.6,
            "random": true
        },
        "size": {
            "value": 3,
            "random": true
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out"
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            }
        },
        "modes": {
            "grab": { "distance": 200, "line_linked": { "opacity": 1 } },
            "push": { "particles_nb": 4 }
        }
    },
    "retina_detect": true
});







	
	
	
document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector(".carousel-inner");
    let items = Array.from(document.querySelectorAll(".carousel-item"));
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let index = items.length; // Начинаем с конца списка, чтобы первые элементы сразу были в очереди
    let itemWidth = items[0].offsetWidth + 20;
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
    itemWidth = allItems[1].offsetWidth + 20;

    // Устанавливаем начальное смещение
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

    nextBtn.addEventListener("click", function () {
        index++;
        updateCarousel();
    });

    prevBtn.addEventListener("click", function () {
        index--;
        updateCarousel();
    });

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
        itemWidth = allItems[1].offsetWidth + 20;
        carousel.style.transition = "none";
        carousel.style.transform = `translateX(${-index * itemWidth}px)`;
    });
});

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

    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalDate').innerText = item.date;
    document.getElementById('modalText').innerText = item.fullText || item.shortText;
    document.getElementById('newsModal').classList.add('active');
  }

  document.getElementById('newsModalClose').onclick = function() {
    document.getElementById('newsModal').classList.remove('active');
  };

document.addEventListener("DOMContentLoaded", function () {
  const rows = document.querySelectorAll(".wave-row");

  if (!rows.length) {
    console.warn("❗ wave-row не найдены даже после DOMContentLoaded");
    return;
  }

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
  }, {
    threshold: 0,
    rootMargin: "0px"
  });

  rows.forEach(row => waveObserver.observe(row));

  // 🔧 Пинаем scroll для GitHub Pages
  setTimeout(() => window.dispatchEvent(new Event('scroll')), 100);
});



  
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
    setTimeout(() => dot.classList.add('visible'), i * 20); // скорость появления
  });
}

// Активируем при скролле
const dotObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('activated')) {
      entry.target.classList.add('activated');
      animateDots(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.dot-grid').forEach(grid => {
  dotObserver.observe(grid);
});

document.addEventListener("DOMContentLoaded", function() {
  if (!document.cookie.includes('cookiesAccepted=true')) {
    document.getElementById('cookieConsent').style.display = 'flex';
  }

  document.getElementById('acceptCookiesBtn').addEventListener('click', function() {
    document.cookie = "cookiesAccepted=true; path=/; max-age=31536000"; // 1 год
    document.getElementById('cookieConsent').style.display = 'none';
  });
});

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
  document.getElementById('newsPrevBtn').disabled = currentPage === 0;
  document.getElementById('newsNextBtn').disabled = currentPage === totalPages - 1;
}

document.getElementById('newsPrevBtn').onclick = function() {
  if (currentPage > 0) {
    currentPage--;
    updateNewsCarousel();
  }
};
document.getElementById('newsNextBtn').onclick = function() {
  const NEWS_PER_PAGE = getNewsPerPage();
  const news = typeof newsItems !== 'undefined' ? newsItems : [];
  const totalPages = Math.ceil(news.length / NEWS_PER_PAGE);
  if (currentPage < totalPages - 1) {
    currentPage++;
    updateNewsCarousel();
  }
};

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('newsCarousel')) renderNewsPages();
});

window.addEventListener('resize', function() {
  currentPage = 0;
  renderNewsPages();
  updateNewsCarousel();
});
// --- Конец блока новостей ---


