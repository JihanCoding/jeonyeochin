// 모든 post-card 클릭 시 mypage_post.html로 이동
window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.post-card').forEach(function(card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            window.location.href = 'mypage_post.html';
        });
    });
});
