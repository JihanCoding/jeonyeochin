const menuToggle = document.getElementById('menuToggle');
const sideMenu = document.getElementById('sideMenu');
menuToggle.addEventListener('click', () => {
    sideMenu.classList.toggle('show');
    sessionStorage.setItem('sideMenuOpen', sideMenu.classList.contains('show') ? 'true' : 'false');
});

document.getElementById('notificationBtn').onclick = function () {
    sessionStorage.setItem('sideMenuOpen', 'false');
    setTimeout(() => {
        window.location.href = '/notifications/notifications.html';
    }, 200);
};

const writeBtn = document.querySelector('.write-button');
if (writeBtn) {
    writeBtn.addEventListener('click', function () {
        sessionStorage.setItem('sideMenuOpen', 'false');
        setTimeout(() => {
            window.location.replace('/newpost/newpost.html');
        }, 200);
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

function filterPostsByTags() {
    const activeFilters = [...filterButtons]
        .filter(btn => btn.classList.contains('active') && btn.dataset.type !== '전체')
        .map(btn => btn.dataset.type);

    const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');
    const publicData = JSON.parse(localStorage.getItem('publicData') || '[]');

    let filteredData = [];

    // 전체가 선택된 경우 또는 아무것도 선택 안된 경우
    if (allButton.classList.contains('active') || activeFilters.length === 0) {
        filteredData = [...posts, ...publicData];
    } else {
        // 게시글 필터가 선택된 경우 - 모든 사용자 게시글 포함
        if (activeFilters.includes('게시글')) {
            filteredData = [...filteredData, ...posts];
        }

        // 공공데이터 필터들이 선택된 경우
        ['축제', '공연', '전시', '테마파크'].forEach(filter => {
            if (activeFilters.includes(filter)) {
                const matchingData = publicData.filter(item => item.type === filter);
                filteredData = [...filteredData, ...matchingData];
            }
        });
    }

    // 마커 필터링
    mapMarkers.forEach(({ marker, category, dataType }) => {
        let shouldShow = false;

        if (allButton.classList.contains('active') || activeFilters.length === 0) {
            shouldShow = true;
        } else {
            // 사용자 게시글인 경우
            if ((dataType === 'user_post' || !dataType) && activeFilters.includes('게시글')) {
                shouldShow = true;
            }
            // 공공데이터인 경우
            else if (['축제', '공연', '전시', '테마파크'].includes(dataType) && activeFilters.includes(dataType)) {
                shouldShow = true;
            }
        }

        marker.setVisible(shouldShow);
    });

    // 하단 시트 업데이트
    updateBottomSheetContentWithFilter(filteredData);
}

function updateBottomSheetContentWithFilter(filteredPosts) {
    const sheetContent = document.getElementById('sheetContent');

    if (filteredPosts.length === 0) {
        sheetContent.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">선택한 필터에 해당하는 게시글이 없습니다.</div>';
        return;
    }

    const postsListContainer = document.createElement('ul');
    postsListContainer.style.listStyle = 'none';
    postsListContainer.style.padding = '0';
    postsListContainer.style.margin = '0';

    filteredPosts.reverse().forEach((post, index) => {
        const li = document.createElement('li');
        li.style.padding = '12px 20px';
        li.style.borderBottom = '1px solid #eee';
        li.style.cursor = 'pointer';

        const tagsHtml = post.tags && post.tags.length > 0
            ? `<div style="margin:4px 0;">${post.tags.map(tag =>
                `<span style="display:inline-block;margin:1px 2px;padding:1px 6px;border-radius:8px;background:#e8f4fd;color:#2193b0;font-size:0.75em;">${tag}</span>`
            ).join('')}</div>`
            : '';

        const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

        li.innerHTML = `
            <div style="font-weight:500;">${post.title}</div>
            ${tagsHtml}
            <div style="color:#888;font-size:0.85em;margin-top:4px;">
                ${post.category ? '[' + post.category + '] ' : ''}${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}
            </div>
            <div style="color:#999;font-size:0.8em;margin-top:4px;">작성일: ${dateStr}</div>
        `;

        postsListContainer.appendChild(li);
    });

    sheetContent.innerHTML = '';
    sheetContent.appendChild(postsListContainer);
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

        // 필터 적용
        filterPostsByTags();
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


// 하단 시트 콘텐츠 업데이트 함수
function updateBottomSheetContent() {
    const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');
    const sheetContent = document.getElementById('sheetContent');

    if (posts.length === 0) {
        sheetContent.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">등록된 게시글이 없습니다.</div>';
        return;
    }

    const postsListContainer = document.createElement('ul');
    postsListContainer.style.listStyle = 'none';
    postsListContainer.style.padding = '0';
    postsListContainer.style.margin = '0';

    posts.reverse().forEach((post, index) => {
        const li = document.createElement('li');
        li.style.padding = '12px 20px';
        li.style.borderBottom = '1px solid #eee';
        li.style.cursor = 'pointer';

        const tagsHtml = post.tags && post.tags.length > 0
            ? `<div style="margin:4px 0;">${post.tags.map(tag =>
                `<span style="display:inline-block;margin:1px 2px;padding:1px 6px;border-radius:8px;background:#e8f4fd;color:#2193b0;font-size:0.75em;">${tag}</span>`
            ).join('')}</div>`
            : '';

        const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

        li.innerHTML = `
            <div style="font-weight:500;">${post.title}</div>
            ${tagsHtml}
            <div style="color:#888;font-size:0.85em;margin-top:4px;">
                ${post.category ? '[' + post.category + '] ' : ''}${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}
            </div>
            <div style="color:#999;font-size:0.8em;margin-top:4px;">작성일: ${dateStr}</div>
        `;

        postsListContainer.appendChild(li);
    });

    sheetContent.innerHTML = '';
    sheetContent.appendChild(postsListContainer);
}

// 무한 스크롤 콘텐츠 샘플 추가 (위에 보여준 무한 스크롤 코드 참고)
let page = 1;
let loading = false;

function loadMoreContent() {
    // 실제 데이터로 교체되었으므로 이 함수는 비활성화
    return;
}

// 기존 샘플 로드 함수 비활성화
// loadMoreContent();

// 스크롤 이벤트도 비활성화 (실제 구현에서는 페이지네이션 적용 가능)
// sheetContent.addEventListener('scroll', () => {
//     if (sheetContent.scrollTop + sheetContent.clientHeight >= sheetContent.scrollHeight - 50) {
//         loadMoreContent();
//     }
// });


// 검색창 클릭 시 search.html로 이동 (SPA 오버레이 제거)
const searchBar = document.querySelector('.search-bar');
searchBar.addEventListener('click', function (e) {
    sideMenu.classList.remove('show');
    sessionStorage.setItem('sideMenuOpen', 'false');
    window.location.href = '/search/search.html';
});

// 지도에 마커 표시 (글 목록)
let mapMarkers = [];
function renderMarkersByCategory() {
    const activeTypes = Array.from(document.querySelectorAll('.filters button.active')).map(btn => btn.dataset.type);
    mapMarkers.forEach(({ marker, category }) => {
        if (activeTypes.includes('전체') || activeTypes.includes(category)) {
            marker.setMap(map);
        } else {
            marker.setMap(null);
        }
    });
}

window.addEventListener('DOMContentLoaded', function () {
    // localStorage에서 임시 글 목록 읽어 마커 표시
    const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');
    mapMarkers = [];

    // 하단 시트 콘텐츠 업데이트
    updateBottomSheetContent();

    posts.forEach(post => {
        if (post.lat && post.lng) {
            // 카테고리별 마커 색상 지정 (네이버 지도 기본 마커)
            let iconOptions = {};
            switch (post.category) {
                case '축제':
                    iconOptions = { icon: { content: '<div style="background:#ffb300;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '공연':
                    iconOptions = { icon: { content: '<div style="background:#42a5f5;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '전시':
                    iconOptions = { icon: { content: '<div style="background:#66bb6a;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '테마파크':
                    iconOptions = { icon: { content: '<div style="background:#ab47bc;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '게시글':
                    iconOptions = { icon: { content: '<div style="background:#ef5350;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                default:
                    iconOptions = {};
            }
            const marker = new naver.maps.Marker(Object.assign({
                position: new naver.maps.LatLng(post.lat, post.lng),
                map: map
            }, iconOptions));
            mapMarkers.push({
                marker,
                category: post.category || '기타',
                dataType: post.type || 'user_post' // 데이터 타입 추가
            });

            // 마커 클릭 시 정보창
            const tagsHtml = post.tags && post.tags.length > 0
                ? `<div style="margin:4px 0 6px 0;">${post.tags.map(tag =>
                    `<span style="display:inline-block;margin:1px 2px;padding:1px 8px;border-radius:10px;background:#e8f4fd;color:#2193b0;font-size:0.8em;">${tag}</span>`
                ).join('')}</div>`
                : '';

            const infoHtml = `
                <div style="min-width:180px;max-width:220px;word-break:break-all;position:relative;">
                    <b>${post.title}</b><br>
                    <span style='display:inline-block;margin:4px 0 6px 0;padding:2px 10px;border-radius:12px;background:#6dd5ed;color:#fff;font-size:0.9em;'>${post.category ? post.category : '기타'}</span><br>
                    ${tagsHtml}
                    <span>${post.category ? '[' + post.category + '] ' : ''}${post.content}</span><br>
                    ${post.cameraImage ? `<img src='${post.cameraImage}' style='width:100%;max-height:120px;margin-top:6px;border-radius:8px;object-fit:cover;'>` : ''}
                    ${post.galleryImages && post.galleryImages.length > 0 ? `<img src='${post.galleryImages[0]}' style='width:100%;max-height:120px;margin-top:6px;border-radius:8px;object-fit:cover;'>` : ''}
                </div>
            `;
            const infowindow = new naver.maps.InfoWindow({ content: infoHtml, zIndex: 9999 });
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

    // 초기 필터 상태 적용
    filterPostsByTags();
});

// 필터 버튼 클릭 시 마커 필터링
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterPostsByTags();
    });
});

// 네이버 지도 및 위치 선택 관련 코드 (기존 index.html <script>에서 이동)
var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(34.7950926, 126.378867),
    zoom: 12
});

// 지도 롱프레스(2초)로 newPost 이동 및 좌표 전달 (PC+모바일 완벽 지원)
(function () {
    let pressTimer = null;
    let downLatLng = null;
    let moved = false;
    const mapDom = map.getElement();

    // PC: 마우스
    naver.maps.Event.addListener(map, 'mousedown', function (e) {
        if (!e.coord) return;
        downLatLng = e.coord;
        moved = false;
        pressTimer = setTimeout(function () {
            if (downLatLng && !moved) {
                localStorage.setItem('selectedCoords', JSON.stringify({ lat: downLatLng.y, lng: downLatLng.x }));
                window.location.href = '/newPost/newPost.html';
            }
        }, 2000);
    });
    naver.maps.Event.addListener(map, 'mouseup', function (e) {
        clearTimeout(pressTimer);
        pressTimer = null;
    });
    naver.maps.Event.addListener(map, 'mouseout', function (e) {
        clearTimeout(pressTimer);
        pressTimer = null;
    });
    naver.maps.Event.addListener(map, 'mousemove', function (e) {
        moved = true;
    });

    // 모바일: 지도 DOM에 직접 터치 이벤트
    mapDom.addEventListener('touchstart', function (e) {
        if (!e.touches || e.touches.length === 0) return;
        moved = false;
        const touch = e.touches[0];
        const offset = mapDom.getBoundingClientRect();
        const x = touch.clientX - offset.left;
        const y = touch.clientY - offset.top;
        // 픽셀 → 위경도 변환 (지도 중심 기준 보정)
        const proj = map.getProjection();
        const mapSize = map.getSize();
        const center = map.getCenter();
        const centerPoint = proj.fromCoordToPoint(center);
        // 지도 중심에서의 픽셀 오프셋 계산
        const dx = x - mapSize.width / 2;
        const dy = y - mapSize.height / 2;
        // 실제 클릭 위치의 지도 포인트
        const clickPoint = new naver.maps.Point(centerPoint.x + dx, centerPoint.y + dy);
        downLatLng = proj.fromPointToCoord(clickPoint);
        pressTimer = setTimeout(function () {
            if (downLatLng && !moved) {
                localStorage.setItem('selectedCoords', JSON.stringify({ lat: downLatLng.y, lng: downLatLng.x }));
                window.location.href = '/newPost/newPost.html';
            }
        }, 2000);
    });
    mapDom.addEventListener('touchend', function (e) {
        clearTimeout(pressTimer);
        pressTimer = null;
    });
    mapDom.addEventListener('touchmove', function (e) {
        moved = true;
    });
})();

// 뒤로가기/복귀 시 사이드 메뉴 상태 복원
window.addEventListener('pageshow', function () {
    const sideMenu = document.getElementById('sideMenu');
    if (sessionStorage.getItem('sideMenuOpen') !== 'true' && sideMenu) {
        sideMenu.classList.remove('show');
    }
});

// 사용자 세션 정보 로드 개발 끝나면 지우세요
window.addEventListener("DOMContentLoaded", () => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log("✅ 세션에 저장된 사용자 정보:", user);
        } catch (e) {
            console.warn("⚠️ 세션 데이터 파싱 실패:", e);
        }
    } else {
        console.log("❌ 세션에 사용자 정보 없음");
    }
});


// ---------------------------  페이지 이동 ---------------------------

const goMyPage = document.getElementById('goMypage');
goMyPage.addEventListener('click', () => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData) {
        window.location.href = '/mypage/mypage.html';
    } else {
        alert('로그인이 필요합니다.');
        window.location.href = '/login/login.html';
    }
});

const plan = document.getElementById('plan');
plan.addEventListener('click', () => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData) {
        window.location.href = '/tripplan/tripplan.html';
    } else {
        alert('로그인이 필요합니다.');
        window.location.href = '/login/login.html';
    }
});

const writeButton = document.getElementById('writeButton');
writeButton.addEventListener('click', () => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData) {
        window.location.replace('/newPost/newPost.html');
    } else {
        alert('로그인이 필요합니다.');
        window.location.href = '/login/login.html';
    }
});