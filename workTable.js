
// -------------------------------------
const itemContainer = document.querySelector('.item-container');
// "on" 상태인 항목만 필터링
const onItems = itemDB.filter(item => item.onoff === "on");
// -------------------------------------


// 고유한 카테고리 종류 추출
const categories = [...new Set(itemDB.filter(item => item.onoff === "on").map(item => item.categories))];
// -------------------------------------
// item-filter-option-container에 옵션 추가
const optionContainer = document.querySelector('.item-filter-option-container');
const itemFilter = document.querySelector('.item-filter');
const itemFilterTop = document.querySelector('.item-filter-top');
const itemFilterTopText = document.querySelector('.item-filter-top-text');

// "ALL" 옵션 추가 후 나머지 옵션 추가
optionContainer.innerHTML = `
    <li class="item-filter-option" for="filterCheckbox">
        <span class="item-filter-checksvg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11" stroke-width="1.5">
                <path d="M 2.5 5.5 L 3.5 6.5 L 4.5 7.5 L 8.5 3.5" fill="transparent" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </span>
        ALL
    </li>` +  categories.map(category => `<li class="item-filter-option">${category}</li>`).join('');

// 필터 옵션 클릭 이벤트 핸들러
optionContainer.addEventListener('click', event => {
    if (event.target.classList.contains('item-filter-option')) {
        const selectedCategory = event.target.textContent.trim();
        itemFilterTopText.textContent = selectedCategory;

        document.querySelectorAll('.item-filter-option svg').forEach(svg => svg.remove());

        // 선택된 옵션에 SVG 추가
        event.target.innerHTML = `
            <span class="item-filter-checksvg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11" stroke-width="1.5">
                    <path d="M 2.5 5.5 L 3.5 6.5 L 4.5 7.5 L 8.5 3.5" fill="transparent" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </span>
            ${selectedCategory}`;
        
        // "ALL"이 선택되면 모든 항목을 렌더링
        const filteredItems = selectedCategory === 'ALL'
            ? itemDB.filter(item => item.onoff === "on")
            : itemDB.filter(item => item.onoff === "on" && item.categories === selectedCategory);

        // 필터링된 항목 렌더링
        renderItems(filteredItems);
        filterCheckbox.click();
    }
});

// 필터링된 아이템 수를 업데이트
function updateItemCount(count) {
    const resultsSpan = document.querySelector('.worksNavBar-r span');
    resultsSpan.textContent = `${count} results`;
}

// 아이템 렌더링
function renderItems(items) {
    const itemsHTML = items.map(item => `
        <a href="page/${item.num}.html" class="witem">
            <div class="witem-thumb">
                <img src="${item.img}" alt="product thumbnail" class="witem-img">
            </div>
            <div class="witem-info">
                <span class="witem-categories">${item.categories}</span>
                <div class="witem-title">${item.title}</div>
            </div>
        </a>
    `).join('');
    itemContainer.innerHTML = itemsHTML;

    // 필터된 아이템 개수 업데이트
    updateItemCount(items.length);
}

// 초기 렌더링
renderItems(itemDB.filter(item => item.onoff === "on"));
//
const filterCheckbox = document.querySelector('#filterCheckbox');