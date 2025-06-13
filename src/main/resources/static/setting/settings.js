// 접기/펼치기 기능
window.addEventListener('DOMContentLoaded', function() {
    // 카드(계정 설정, 앱 설정) 접기/펼치기
    document.querySelectorAll('.settings-card-title').forEach(function(title) {
        title.addEventListener('click', function() {
            const card = title.closest('.settings-card');
            card.classList.toggle('collapsed');
            // 아이콘 회전
            const chevron = title.querySelector('.chevron');
            if (chevron) {
                chevron.classList.toggle('rotated', !card.classList.contains('collapsed'));
            }
        });
    });
    // 카테고리(계정 정보, 계정 관리 등) 접기/펼치기
    document.querySelectorAll('.settings-category-title').forEach(function(title) {
        title.addEventListener('click', function(e) {
            e.stopPropagation(); // 카드와 이벤트 분리
            const category = title.closest('.settings-category');
            category.classList.toggle('collapsed');
            const chevron = title.querySelector('.chevron');
            if (chevron) {
                chevron.classList.toggle('rotated', !category.classList.contains('collapsed'));
            }
        });
    });
});