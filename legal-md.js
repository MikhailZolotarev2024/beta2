// --- legal-md.js ---
// Функция для загрузки и конвертации Markdown
async function loadAndConvertMarkdown(mdFilePath, targetElementId) {
    try {
        const response = await fetch(mdFilePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdown = await response.text();
        // Конвертируем Markdown в HTML
        const html = marked.parse(markdown);
        // Вставляем результат в указанный элемент
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            targetElement.innerHTML = html;
        } else {
            console.error(`Элемент с id "${targetElementId}" не найден`);
        }
    } catch (error) {
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            targetElement.innerHTML = 'Ошибка загрузки контента. Пожалуйста, попробуйте позже.';
        }
        console.error('Ошибка загрузки Markdown:', error);
    }
}

// Функция для загрузки нужного раздела
async function loadMarkdown(pointId) {
    const currentLang = localStorage.getItem('preferredLang') || 'en';
    const filePath = `law/${currentLang}/${pointId}.md`;
    await loadAndConvertMarkdown(filePath, 'content');

    document.querySelectorAll('.nav-links button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(pointId)) {
            btn.classList.add('active');
        }
    });
}

// При загрузке страницы — грузим первый пункт:
loadMarkdown('point1');



