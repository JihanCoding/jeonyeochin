// 뒤로가기 버튼 동작
const backBtn = document.getElementById('backButton');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        history.back();
    });
}

const filterButtons = document.querySelectorAll('.filters button');
const allButton = document.querySelector('.filters button[data-type="전체"]');
function updateAllButtonState() {
    const others = [...filterButtons].filter(btn => btn !== allButton);
    const allActive = others.every(btn => btn.classList.contains('active'));
    allButton.classList.toggle('active', allActive);
}
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.type;

        if (type === '전체') {
            const isAllActive = button.classList.contains('active');
            filterButtons.forEach(btn => {
                btn.classList.toggle('active', !isAllActive);
            });
        } else {
            button.classList.toggle('active');
            updateAllButtonState();
        }
    });
});
updateAllButtonState();

// 검색기록 X버튼 동작
const removeBtns = document.querySelectorAll('.search-history .remove-btn');
removeBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const item = this.closest('.search-history-item');
        if (item) item.remove();
    });
});




// 검색창에서 엔터 또는 검색 버튼 클릭 시 community 페이지로 이동하며 검색어 저장
const searchInput = document.querySelector('.search-bar input');
const searchBtn = document.querySelector('.search-bar button');
if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            localStorage.setItem('lastSearch', searchInput.value);
                        window.location.href = '/community/community.html';
        }
    });
}
if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        localStorage.setItem('lastSearch', searchInput.value);
        window.location.href = '/community/community.html';
    });
}

// 페이지 진입 시 검색 input에 자동 포커스
window.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('searchInput');
    if (input) input.focus();
});







