// 프로필 사진 업로드 및 미리보기
const profileImgInput = document.getElementById('profile-img-input');
const profileImgPreview = document.getElementById('profile-img-preview');

function updateProfileImgUI() {
    const img = document.getElementById('profile-img-preview');
    const label = document.querySelector('.profile-img-label');
    if (!img.src || img.src.endsWith('/') || img.src === window.location.href) {
        label.classList.add('no-img');
        img.style.display = 'none';
    } else {
        label.classList.remove('no-img');
        img.style.display = 'block';
    }
}

if (profileImgInput && profileImgPreview) {
    profileImgInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                profileImgPreview.src = ev.target.result;
                updateProfileImgUI();
            };
            reader.readAsDataURL(file);
        }
    });
    // 페이지 로드시에도 체크
    updateProfileImgUI();
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
}

// 마이페이지 뒤로가기 버튼(index로 이동)
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '/index/index.html';
        });
    }
});
