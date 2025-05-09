// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем первый пункт при загрузке страницы
    loadMarkdown('point1');
});

// Функция для загрузки Markdown файлов
async function loadMarkdown(point) {
    const content = document.getElementById('content');
    content.innerHTML = 'Загрузка...';
    
    try {
        // Загружаем соответствующий Markdown файл из папки law
        await window.loadMarkdown(`law/${point}.md`, 'content');
        
        // Обновляем активную кнопку
        document.querySelectorAll('.nav-links button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick').includes(point)) {
                btn.classList.add('active');
            }
        });
    } catch (error) {
        content.innerHTML = 'Ошибка загрузки контента. Пожалуйста, попробуйте позже.';
        console.error('Ошибка загрузки Markdown:', error);
    }
} 