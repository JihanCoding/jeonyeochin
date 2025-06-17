
// 데스크톱에서 게시글 가로 스크롤 마우스 드래그 지원
function enableHorizontalDragScroll(selector) {
    document.querySelectorAll(selector).forEach(function (list) {
        let isDown = false;
        let startX, scrollLeft;
        list.style.cursor = 'grab';
        list.addEventListener('mousedown', function (e) {
            isDown = true;
            list.classList.add('dragging');
            startX = e.pageX - list.offsetLeft;
            scrollLeft = list.scrollLeft;
        });
        list.addEventListener('mouseleave', function () {
            isDown = false;
            list.classList.remove('dragging');
        });
        list.addEventListener('mouseup', function () {
            isDown = false;
            list.classList.remove('dragging');
        });
        list.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - list.offsetLeft;
            const walk = (x - startX);
            list.scrollLeft = scrollLeft - walk;
        });
    });
    window.addEventListener('DOMContentLoaded', function () {
        enableHorizontalDragScroll('.tripinfo-horizontal-scroll');
    });
}

// 카드 클릭 시 인터랙션 datail 페이지로 이동
document.querySelectorAll('.info-card').forEach(card => {
    card.addEventListener('click', function () {
        card.classList.add('active');
        setTimeout(() => card.classList.remove('active'), 120);
    });
});

// 섹션 화살표 클릭 시 tripInfo_group 페이지로 이동
document.querySelectorAll('.section-arrow').forEach(arrow => {
    arrow.style.cursor = 'pointer';
    arrow.addEventListener('click', function () {
        window.location.href = '/tripInfo_group/tripInfo_group.html';
    });
});
