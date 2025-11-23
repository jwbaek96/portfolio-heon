const imgContainer = document.querySelector('#imgContainer');
const slideDots = document.querySelector('.slideDots');
// 이미지 클릭 이벤트 -----------------------------------------------
function addImageClickEvent() {
    const images = document.querySelectorAll('.sc-images img'); // 모든 이미지 선택
    images.forEach(image => {
        image.addEventListener('click', () => {
            const imgSrc = image.getAttribute('src'); // 클릭된 이미지의 src 가져오기
            window.open(imgSrc, '_blank'); // 새 창에서 이미지 열기
        });
    });
}

// 이미지 초기 세팅 프린트 -----------------------------------------------
function setslideImg() {
    const slideImgHTML = slideDB.map(item => `
            <img src="${item.img}">
        `).join('');
    imgContainer.innerHTML = slideImgHTML;

    const dotsHTML = slideDB.map(item => `
        <div class="dot" data-num="${item.num}"></div>
    `).join('');
    slideDots.innerHTML = dotsHTML;
    addImageClickEvent(); 
}
setslideImg();
// 슬라이더 컨트롤 -----------------------------------------------
let slideStatu = 1;
const totalSlides = slideDB.length;

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[slideStatu - 1].classList.add('active');

    console.log(slideStatu)
}

function moveSlide(direction) {
    if (direction === 'next') {
        slideStatu = slideStatu < totalSlides ? slideStatu + 1 : 1;
        imgContainer.style.transform = `translateX(calc(-100% * ${slideStatu - 1}))`;
    } else if (direction === 'prev') {
        slideStatu = slideStatu > 1 ? slideStatu - 1 : totalSlides;
        imgContainer.style.transform = `translateX(calc(-100% * ${slideStatu - 1}))`;
    }

    updateDots();
}

function jumpToSlide(num) {
    slideStatu = parseInt(num);
    imgContainer.style.transform = `translateX(calc(-100% * ${slideStatu - 1}))`;
    updateDots();
}

const prev = document.querySelector('.btn-move-prev');
const next = document.querySelector('.btn-move-next');
prev.addEventListener('click', () => moveSlide('prev'));
next.addEventListener('click', () => moveSlide('next'));

slideDots.addEventListener('click', (e) => {
    if (e.target.classList.contains('dot')) {
        jumpToSlide(e.target.getAttribute('data-num'));
    }
});
updateDots();
