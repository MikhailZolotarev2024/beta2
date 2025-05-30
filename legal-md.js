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
    // law/point1.md и т.д.
    await loadAndConvertMarkdown(`law/${pointId}.md`, 'content');
    // Обновляем активную кнопку
    document.querySelectorAll('.nav-links button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(pointId)) {
            btn.classList.add('active');
        }
    });
}

// Добавляем стили для Markdown (по желанию)
// document.addEventListener('DOMContentLoaded', () => {
//     // Стилизация Markdown
//     const style = document.createElement('style');
//     style.textContent = `
//         .markdown-content {
//             font-family: Arial, sans-serif;
//             line-height: 1.6;
//             color: #333;
//         }
//         .markdown-content h1 {
//             color: #2c3e50;
//             border-bottom: 2px solid #eee;
//             padding-bottom: 10px;
//         }
//         .markdown-content h2 {
//             color: #34495e;
//             margin-top: 20px;
//         }
//         .markdown-content p {
//             margin: 15px 0;
//         }
//         .markdown-content code {
//             background-color: #f8f9fa;
//             padding: 2px 4px;
//             border-radius: 4px;
//             font-family: monospace;
//         }
//         .markdown-content pre {
//             background-color: #f8f9fa;
//             padding: 15px;
//             border-radius: 5px;
//             overflow-x: auto;
//         }
//         .markdown-content blockquote {
//             border-left: 4px solid #ddd;
//             padding-left: 15px;
//             color: #666;
//             margin: 15px 0;
//         }
//         .markdown-content ul, .markdown-content ol {
//             padding-left: 20px;
//         }
//         .markdown-content img {
//             max-width: 100%;
//             height: auto;
//         }
//     `;
//     document.head.appendChild(style);
// });

loadMarkdown('point1'); // Load the first point immediately 