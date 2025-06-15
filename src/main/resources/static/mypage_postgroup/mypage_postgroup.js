// 모든 post-card 클릭 시 mypage_post.html로 이동
window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.post-card').forEach(function(card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            window.location.href = 'mypage_post.html';
        });
    });
});

// URL 파라미터로 전달된 년월로 스크롤
window.addEventListener('DOMContentLoaded', function() {
    // 년월 파라미터 읽기
    const params = new URLSearchParams(window.location.search);
    const year = params.get('year');
    const month = params.get('month');
    if (year && month) {
        // 해당 년월 posts-group-header 찾기
        const headers = document.querySelectorAll('.posts-group-header');
        headers.forEach(function(header) {
            if (header.textContent.includes(year + '년') && header.textContent.includes(month + '월')) {
                header.scrollIntoView({behavior: 'smooth', block: 'start'});
            }
        });
    }
});
