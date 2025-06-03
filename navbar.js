document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    let hasScrolled = false;
    
    // Проверяем, находимся ли мы на главной странице
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                      window.location.pathname.endsWith('/') ||
                      window.location.pathname.endsWith('index');
    
    // Если мы не на главной странице или уже прокрутили страницу, показываем навбар
    if (!isHomePage || window.scrollY > 0) {
        navbar.classList.add('visible');
        hasScrolled = true;
    }
    
    // Добавляем обработчик скролла только на главной странице
    if (isHomePage) {
        window.addEventListener('scroll', function() {
            if (!hasScrolled && window.scrollY > 0) {
                navbar.classList.add('visible');
                hasScrolled = true;
            }
        });
    }
}); 