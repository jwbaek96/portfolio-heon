const navCheckbox = document.querySelector('#navCheckbox');
const nav = document.querySelector('.nav');

// 체크박스 상태에 따라 .dpnone 클래스 토글
navCheckbox.addEventListener('change', () => {
    if (navCheckbox.checked) {
        nav.style.zIndex = '1';
        nav.style.visibility = 'visible';
        nav.style.opacity = '1';
    } else {
        nav.style.opacity = '0'; 
        nav.addEventListener('transitionend', () => {
            if (!navCheckbox.checked) {
                nav.style.zIndex = '-1'; 
                nav.style.visibility = 'hidden';
            }
        }, { once: true });
    }
});