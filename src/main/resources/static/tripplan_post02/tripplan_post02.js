window.addEventListener('DOMContentLoaded', () => {
    // tripplan_post01에서 저장한 데이터 불러오기
    const start = localStorage.getItem('trip_start') || '출발지';
    const waypoints = JSON.parse(localStorage.getItem('trip_waypoints') || '[]');
    const end = localStorage.getItem('trip_end') || '도착지';

    // 여행루트 표시
    const routeList = document.getElementById('routeList');
    let routeHtml = '';
    routeHtml += `<span class="route-item">${start}</span>`;
    waypoints.forEach(wp => {
        routeHtml += ` &gt; <span class="route-item">${wp}</span>`;
    });
    routeHtml += ` &gt; <span class="route-item">${end}</span>`;
    routeList.innerHTML = routeHtml;

    // 게시 버튼 활성화 로직
    const titleInput = document.getElementById('plan-title');
    const dateInput = document.getElementById('plan-date');
    const contentInput = document.getElementById('plan-content');
    const submitBtn = document.querySelector('.submit-btn');

    function checkForm() {
        submitBtn.disabled = !(titleInput.value && dateInput.value && contentInput.value);
    }
    titleInput.addEventListener('input', checkForm);
    dateInput.addEventListener('input', checkForm);
    contentInput.addEventListener('input', checkForm);

    // 오늘 날짜 기본값
    dateInput.value = new Date().toISOString().slice(0, 10);

    // 폼 제출 시 처리
    document.querySelector('.plan-form').addEventListener('submit', e => {
        e.preventDefault();
        alert('여행 플랜이 저장되었습니다!');
    });
});