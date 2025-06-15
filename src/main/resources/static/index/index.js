const menuToggle = document.getElementById('menuToggle');
const sideMenu = document.getElementById('sideMenu');
menuToggle.addEventListener('click', () => {
    sideMenu.classList.toggle('show');
});

document.getElementById('notificationBtn').onclick = function () {
    window.location.href = '/notifications/notifications.html';
};

const writeBtn = document.querySelector('.write-button');
if (writeBtn) {
    writeBtn.addEventListener('click', function () {
        window.location.href = '/newpost/newpost.html';
    });
}

const filterButtons = document.querySelectorAll('.filters button');
const allButton = document.querySelector('.filters button[data-type="전체"]');
function updateAllButtonState() {
    // "전체" 버튼 제외한 나머지 버튼들 중 active인 게 모두 있으면 전체 버튼도 active, 아니면 비활성화
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
// 초기 상태도 맞춰주기 (필터 버튼들 모두 켜져있다고 가정)
updateAllButtonState();


// 사이드 메뉴 뒤로가기 클릭시 모든 메뉴 닫기
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    sideMenu.classList.remove('show');
});


// JS - 드래그 & 스와이프 업/다운 토글 기능
const bottomSheet = document.getElementById('bottomSheet');
const dragHandle = document.getElementById('dragHandle');
const sheetContent = document.getElementById('sheetContent');

let startY = 0;
let startHeight = 0;
let isDragging = false;

let minHeight = 40;    // 접힌 상태 높이
let maxHeight = 0;    // 확장 상태 높이 (필터 아래까지)

function updateMaxHeight() {
    // 검색창(.search-bar)의 bottom ~ window의 bottom 거리
    const searchBar = document.querySelector('.search-bar');
    const searchRect = searchBar.getBoundingClientRect();
    maxHeight = window.innerHeight - searchRect.bottom - 8; // 8px 여백
    // 최소값 보장
    if (maxHeight < minHeight + 40) maxHeight = minHeight + 40;
}

function setHeight(height) {
    height = Math.min(Math.max(height, minHeight), maxHeight);
    bottomSheet.style.height = height + 'px';
}

// 화면 크기 바뀔 때마다 maxHeight 재계산
window.addEventListener('resize', () => {
    updateMaxHeight();
    if (parseInt(bottomSheet.style.height) > maxHeight) {
        setHeight(maxHeight);
    }
});

// 페이지 로드시 바텀시트 높이 초기화 및 maxHeight 계산
updateMaxHeight();
bottomSheet.style.transition = 'none';
setHeight(minHeight);
requestAnimationFrame(() => {
    bottomSheet.style.transition = 'height 0.2s ease';
});


// 바텀시트: pointer 이벤트만 사용 (PC/모바일 모두 지원)
dragHandle.addEventListener('pointerdown', (e) => {
    e.preventDefault(); // sheetContent 등 내용 드래그/선택 방지
    if (e.pointerType === 'mouse' && e.button !== 0) return; // 마우스는 왼쪽 버튼만 허용, 터치/펜은 무조건 허용
    isDragging = true;
    startY = e.clientY;
    startHeight = bottomSheet.getBoundingClientRect().height;
    dragHandle.style.cursor = 'grabbing';
    document.addEventListener('pointermove', pointerMoveHandler);
    document.addEventListener('pointerup', pointerUpHandler);
    document.addEventListener('pointercancel', pointerCancelHandler);
});
function pointerMoveHandler(e) {
    if (!isDragging) return;
    const dy = e.clientY - startY; // 위로 올리면 음수, 아래로 내리면 양수
    setHeight(startHeight - dy); // 위로 올릴수록 height 증가
}
function pointerUpHandler(e) {
    if (!isDragging) return;
    isDragging = false;
    dragHandle.style.cursor = 'grab';
    updateMaxHeight();
    const currentHeight = bottomSheet.getBoundingClientRect().height;
    document.removeEventListener('pointermove', pointerMoveHandler);
    document.removeEventListener('pointerup', pointerUpHandler);
    document.removeEventListener('pointercancel', pointerCancelHandler);
    if (currentHeight - startHeight > 12) {
        setHeight(maxHeight);
    } else if (startHeight - currentHeight > 12) {
        setHeight(minHeight);
    } else {
        if (startHeight === minHeight) {
            setHeight(maxHeight);
        } else {
            setHeight(minHeight);
        }
    }
}
function pointerCancelHandler(e) {
    if (!isDragging) return;
    isDragging = false;
    dragHandle.style.cursor = 'grab';
    setHeight(minHeight);
    document.removeEventListener('pointermove', pointerMoveHandler);
    document.removeEventListener('pointerup', pointerUpHandler);
    document.removeEventListener('pointercancel', pointerCancelHandler);
}


// 무한 스크롤 콘텐츠 샘플 추가 (위에 보여준 무한 스크롤 코드 참고)
let page = 1;
let loading = false;

function loadMoreContent() {
    if (loading) return;
    loading = true;
    setTimeout(() => {
        for (let i = 0; i < 10; i++) {
            const item = document.createElement('div');
            item.textContent = `게시물 #${(page - 1) * 10 + i + 1}`;
            item.style.padding = '12px 0';
            item.style.borderBottom = '1px solid #ddd';
            sheetContent.appendChild(item);
        }
        page++;
        loading = false;
    }, 1000);
}

loadMoreContent();

sheetContent.addEventListener('scroll', () => {
    if (sheetContent.scrollTop + sheetContent.clientHeight >= sheetContent.scrollHeight - 50) {
        loadMoreContent();
    }
});


// 검색창 클릭 시 search.html로 이동 (SPA 오버레이 제거)
const searchBar = document.querySelector('.search-bar');
searchBar.addEventListener('click', function (e) {
    window.location.href = '/search/search.html';
});

// 지도에 마커 표시 (글 목록)
window.addEventListener('DOMContentLoaded', function () {
    // localStorage에서 임시 글 목록 읽어 마커 표시
    const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');
    posts.forEach(post => {
        if (post.lat && post.lng) {
            const marker = new naver.maps.Marker({
                position: new naver.maps.LatLng(post.lat, post.lng),
                map: map
            });
            // 마커 클릭 시 정보창
            const infoHtml = `
                <div style="min-width:180px;max-width:220px;word-break:break-all;position:relative;">
                    <b>${post.title}</b><br>
                    <span>${post.category ? '[' + post.category + '] ' : ''}${post.content}</span><br>
                    ${post.cameraImage ? `<img src='${post.cameraImage}' style='width:100%;max-height:120px;margin-top:6px;border-radius:8px;object-fit:cover;'>` : ''}
                    ${post.galleryImages && post.galleryImages.length > 0 ? `<img src='${post.galleryImages[0]}' style='width:100%;max-height:120px;margin-top:6px;border-radius:8px;object-fit:cover;'>` : ''}
                </div>
            `;
            const infowindow = new naver.maps.InfoWindow({ content: infoHtml });
            naver.maps.Event.addListener(marker, 'click', function () {
                infowindow.open(map, marker);
                // 지도 클릭 시 InfoWindow 닫기
                const closeOnMapClick = function () {
                    infowindow.close();
                    naver.maps.Event.removeListener(mapClickListener);
                };
                const mapClickListener = naver.maps.Event.addListener(map, 'click', closeOnMapClick);
            });
        }
    });
});