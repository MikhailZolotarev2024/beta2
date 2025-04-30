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

// Основной скрипт выполняется после загрузки DOM
document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.addEventListener("click", async function (event) {
            event.preventDefault(); // Предотвращаем стандартную отправку формы

            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const message = document.getElementById("message").value;

            if (!name || !email || !message) {
                alert("Все поля обязательны!");
                return;
            }

            try {
                const response = await fetch("https://6a17-185-244-159-19.ngrok-free.app/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message }),
                });

                const result = await response.json();
                alert(result.success || result.error);
            } catch (error) {
                console.error("Ошибка при отправке формы:", error);
                alert("Ошибка при отправке. Проверьте соединение с сервером.");
            }
        });
    } else {
        console.error("Кнопка отправки не найдена. Проверьте ID 'submitBtn'.");
    }
});


particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 100, /* Количество частиц */
            "density": { "enable": true, "value_area": 800 } /* Плотность */
        },
        "color": { "value": "#00ffff" }, /* Цвет частиц */
        "shape": {
            "type": "circle", /* Форма частиц */
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
            "enable": true, /* Включить соединения между частицами */
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2, /* Скорость движения */
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
                "mode": "grab" /* Частицы реагируют на курсор */
            },
            "onclick": {
                "enable": true,
                "mode": "push" /* Частицы разлетаются при клике */
            }
        },
        "modes": {
            "grab": { "distance": 200, "line_linked": { "opacity": 1 } },
            "push": { "particles_nb": 4 }
        }
    },
    "retina_detect": true /* Улучшенная чёткость для ретина-экранов */
});






function loadMarkdown(section) {
    fetch(`law/${section}.md`)
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка загрузки ${section}.md`);
            return response.text();
        })
        .then(text => {
            const converter = new showdown.Converter();
            document.getElementById("content").innerHTML = converter.makeHtml(text);
        })
        .catch(error => console.error("Ошибка:", error));
}

// Загружаем первый раздел сразу после загрузки страницы
document.addEventListener("DOMContentLoaded", () => {
    loadMarkdown("point1");
});

    // ✅ Загружаем первый раздел сразу после загрузки страницы  
    window.onload = function() {
        setTimeout(() => loadMarkdown("point1"), 100); // Короткая задержка на 100мс для корректной загрузки
    };
	
	
	
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

  document.querySelectorAll('.circle-stat').forEach(circle => {
    const percent = parseInt(circle.dataset.percent);
    circle.style.background = `conic-gradient(#76c7c0 0% ${percent}%, rgba(255,255,255,0.08) ${percent}% 100%)`;
  });
  
  function openNewsModal(title, content) {
  document.querySelector('.news-modal-title').innerText = title;
  document.querySelector('.news-modal-content').innerText = content;
  document.querySelector('.news-modal').classList.add('visible');
}


document.addEventListener("DOMContentLoaded", function () {
  const rows = document.querySelectorAll(".wave-row");

  if (!rows.length) {
    console.warn("⚠️ Не найдено ни одного .wave-row");
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log("🎯 Видим элемент:", entry.target);
        entry.target.classList.remove("hidden");
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  rows.forEach((el, i) => {
    console.log(`📦 Подключаю к обзору элемент #${i + 1}:`, el);
    if (el instanceof Element) {
      observer.observe(el);
    } else {
      console.warn("⛔ Не является DOM-элементом:", el);
    }
  });
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
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('activated')) {
      entry.target.classList.add('activated');
      animateDots(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.dot-grid').forEach(grid => {
  observer.observe(grid);
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


async function validateAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

async function analyzeEthBalance(address, outputElementId = "output-block") {
  const output = document.getElementById(outputElementId);
  output.textContent = "⏳ Загружаю данные...";

  try {
    const provider = new ethers.JsonRpcProvider("https://green-thrumming-mountain.quiknode.pro/8a77a6ba8c1788e8a4c683d8fb4b85e52c4fe66f/");

    const [balance, txCount, block, ensName] = await Promise.all([
      provider.getBalance(address),
      provider.getTransactionCount(address),
      provider.getBlock("latest"),
      provider.lookupAddress(address)
    ]);

    const eth = ethers.formatEther(balance);
    const gasLimit = block.gasLimit.toString();

    output.textContent = `
📍 Адрес: ${address}
🔠 ENS: ${ensName || "—"}
💰 Баланс: ${eth} ETH
🔁 Кол-во транзакций (nonce): ${txCount}
⛽ Газовый лимит последнего блока: ${gasLimit}
    `.trim();
  } catch (err) {
    output.textContent = "❌ Ошибка при анализе адреса.";
    console.error(err);
  }
}

function analyzeWallet(address, outputElementId = "output-block") {
  if (!validateAddress(address)) {
    document.getElementById(outputElementId).textContent = "❌ Невалидный ETH-адрес";
    return;
  }
  analyzeEthBalance(address, outputElementId);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("analyze-btn").addEventListener("click", () => {
    const address = document.getElementById("wallet-address").value.trim();
    analyzeWallet(address);
  });
});