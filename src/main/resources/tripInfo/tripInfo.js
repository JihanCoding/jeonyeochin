// 프로필 사진 업로드 및 미리보기
const profileImgInput = document.getElementById('profile-img-input');
const profileImgPreview = document.getElementById('profile-img-preview');

if (profileImgInput && profileImgPreview) {
    profileImgInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                profileImgPreview.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// 년월 옆 꺽쇠 클릭 시 mypage_postgroup.html로 이동
window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.posts-group-header .arrow').forEach(function(arrow) {
        arrow.style.cursor = 'pointer';
        arrow.addEventListener('click', function(e) {
            window.location.href = 'mypage_postgroup.html';
        });
    });
    // 데스크톱 가로 스크롤 드래그 지원
    enableHorizontalDragScroll('.posts-list.horizontal-scroll');
});

// 데스크톱에서 게시글 가로 스크롤 마우스 드래그 지원
function enableHorizontalDragScroll(selector) {
    document.querySelectorAll(selector).forEach(function(list) {
        let isDown = false;
        let startX, scrollLeft;
        list.style.cursor = 'grab';
        list.addEventListener('mousedown', function(e) {
            isDown = true;
            list.classList.add('dragging');
            startX = e.pageX - list.offsetLeft;
            scrollLeft = list.scrollLeft;
        });
        list.addEventListener('mouseleave', function() {
            isDown = false;
            list.classList.remove('dragging');
        });
        list.addEventListener('mouseup', function() {
            isDown = false;
            list.classList.remove('dragging');
        });
        list.addEventListener('mousemove', function(e) {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - list.offsetLeft;
            const walk = (x - startX);
            list.scrollLeft = scrollLeft - walk;
        });
    });
    window.addEventListener('DOMContentLoaded', function() {
        enableHorizontalDragScroll('.tripinfo-horizontal-scroll');
    });
}

// 검색창 엔터 시 새로고침 방지
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') e.preventDefault();
    });
}

// 카드 클릭 시 인터랙션(예시)
document.querySelectorAll('.info-card').forEach(card => {
    card.addEventListener('click', function() {
        card.classList.add('active');
        setTimeout(() => card.classList.remove('active'), 120);
    });
});

// 섹션 화살표 클릭 시(예시)
document.querySelectorAll('.section-arrow').forEach(arrow => {
    arrow.style.cursor = 'pointer';
    arrow.addEventListener('click', function() {
        
    });
});
