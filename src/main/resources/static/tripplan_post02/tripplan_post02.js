window.addEventListener('DOMContentLoaded', () => {
    // tripplan_post01에서 저장한 데이터 불러오기
    const start = localStorage.getItem('trip_start') || '출발지';
    const waypoints = JSON.parse(localStorage.getItem('trip_waypoints') || '[]');
    const end = localStorage.getItem('trip_end') || '도착지';

    // 여행루트 표시
    const routeList = document.getElementById('routeList');
    let routeHtml = `<span class="route-item">${start}</span>`;
    waypoints.forEach(wp => {
        routeHtml += ` &gt; <span class="route-item">${wp}</span>`;
    });
    routeHtml += ` &gt; <span class="route-item">${end}</span>`;
    routeList.innerHTML = routeHtml;

    // 입력 요소들 가져오기
    const titleInput = document.getElementById('plan-title');
    const dateInput = document.getElementById('plan-date');
    const contentInput = document.getElementById('plan-content');
    const submitBtn = document.querySelector('.submit-btn');
    const dateText = document.querySelector('.plan-date-text');

    // 오늘 날짜 기본값 세팅
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
    dateText.textContent = formatDateToKorean(today);

    // 날짜 바뀌면 텍스트에 반영
    dateInput.addEventListener('input', () => {
        dateText.textContent = formatDateToKorean(dateInput.value);
        checkForm();
    });

    // 날짜 텍스트 클릭 시 date picker 열기
    dateText.style.cursor = 'pointer';
    dateText.addEventListener('click', () => {
        if (typeof dateInput.showPicker === 'function') {
            dateInput.showPicker();
        } else {
            dateInput.focus();
            dateInput.click();
        }
    });

    // 게시 버튼 활성화
    function checkForm() {
        submitBtn.disabled = !(titleInput.value && dateInput.value && contentInput.value);
    }

    titleInput.addEventListener('input', checkForm);
    contentInput.addEventListener('input', checkForm);

    // 폼 제출 시 처리
    document.querySelector('.plan-form').addEventListener('submit', e => {
        e.preventDefault();
        alert('여행 플랜이 저장되었습니다!');
    });

    // 날짜 포맷 함수 (yyyy-mm-dd -> yy-mm-dd 형식으로 보기 좋게 변환)
    function formatDateToKorean(dateStr) {
        if (!dateStr) return '';
        const [yyyy, mm, dd] = dateStr.split('-');
        return `${yyyy.slice(2)}-${mm}-${dd}`; // 예: 25-06-21
    }
});
