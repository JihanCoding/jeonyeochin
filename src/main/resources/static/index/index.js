// 커뮤니티로 검색어와 함께 이동하는 함수
function goToCommunityWithSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.trim() : '';

    if (searchTerm !== '') {
        localStorage.setItem('lastSearch', searchTerm);
    }

    window.location.href = '/community/community.html';
}

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

const writeBtn = document.getElementById('writeButton');
if (writeBtn) {
    // 기존 이벤트 리스너 제거 (중복 방지)
    writeBtn.removeEventListener('click', handleWriteButtonClick);
    writeBtn.addEventListener('click', handleWriteButtonClick);
}

function handleWriteButtonClick() {
    const userDataString = sessionStorage.getItem("user");
    let userData = null;

    if (userDataString) {
        try {
            userData = JSON.parse(userDataString);
        } catch (e) {
            console.error('사용자 데이터 파싱 오류:', e);
            userData = null;
        }
    }

    if (userData) {
        sessionStorage.setItem('sideMenuOpen', 'false');
        setTimeout(() => {
            window.location.replace('/newpost/newpost.html');
        }, 200);
    } else {
        alert('로그인이 필요합니다.');
        window.location.href = '/login/login.html';
    }
}

const filterButtons = document.querySelectorAll('.filters button');
const allButton = document.querySelector('.filters button[data-type="전체"]');

function updateAllButtonState() {
    // "전체" 버튼 제외한 나머지 버튼들 중 active인 게 모두 있으면 전체 버튼도 active, 아니면 비활성화
    const others = [...filterButtons].filter(btn => btn !== allButton);
    const allActive = others.every(btn => btn.classList.contains('active'));
    allButton.classList.toggle('active', allActive);
}

// 게시물이 3일 이내에 작성되었는지 확인하는 함수
function isWithinThreeDays(createdAt) {
    if (!createdAt) return false;

    const now = new Date();
    const postDate = new Date(createdAt);
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3일을 밀리초로 변환

    return (now - postDate) <= threeDaysInMs;
}

function filterPostsByTags() {
    const activeFilters = [...filterButtons]
        .filter(btn => btn.classList.contains('active') && btn.dataset.type !== '전체')
        .map(btn => btn.dataset.type);

    const isAllActive = allButton.classList.contains('active');

    console.log('🔍 필터 상태:', {
        '전체버튼활성화': isAllActive,
        '활성필터': activeFilters,
        '활성필터개수': activeFilters.length
    });

    const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');
    const publicData = JSON.parse(localStorage.getItem('publicData') || '[]');

    // 3일 이내 게시물만 필터링 (사용자 게시글에만 적용)
    const recentPosts = posts.filter(post => isWithinThreeDays(post.createdAt));

    let filteredData = [];

    // 전체가 선택된 경우
    if (isAllActive) {
        filteredData = [...recentPosts, ...publicData]; // 3일 이내 게시물만 포함
        console.log('✅ 전체 필터 활성화 - 모든 데이터 표시');
    }
    // 아무것도 선택되지 않은 경우 (전체도 비활성화)
    else if (activeFilters.length === 0) {
        filteredData = []; // 빈 배열로 아무것도 표시하지 않음
        console.log('❌ 모든 필터 비활성화 - 데이터 숨김');
    }
    else {
        console.log('🎯 개별 필터 활성화:', activeFilters);
        // 게시글 필터가 선택된 경우 - 3일 이내 사용자 게시글만 포함
        if (activeFilters.includes('게시글')) {
            filteredData = [...filteredData, ...recentPosts];
        }

        // 공공데이터 필터들이 선택된 경우 (공공데이터는 날짜 제한 없음)
        ['축제', '공연', '관광', '테마파크'].forEach(filter => {
            if (activeFilters.includes(filter)) {
                const matchingData = publicData.filter(item => item.type === filter);
                filteredData = [...filteredData, ...matchingData];
            }
        });
    }    // 마커 필터링 (3일 제한 적용)
    let hiddenCount = 0, visibleCount = 0;

    mapMarkers.forEach(({ marker, category, dataType, post }) => {
        let shouldShow = false;

        // 전체가 비활성화되고 다른 필터도 없으면 모든 마커 숨김
        if (!isAllActive && activeFilters.length === 0) {
            shouldShow = false; // 모든 필터가 꺼져있으면 무조건 숨김
        } else {
            // 사용자 게시글인 경우 3일 제한 확인
            if ((dataType === 'user_post' || !dataType) && post) {
                const isRecent = isWithinThreeDays(post.createdAt);
                if (!isRecent) {
                    shouldShow = false; // 3일 지난 게시물은 무조건 숨김
                } else {
                    // 3일 이내인 경우 필터 조건 확인
                    if (isAllActive) {
                        shouldShow = true;
                    } else if (activeFilters.includes('게시글')) {
                        shouldShow = true;
                    } else {
                        shouldShow = false; // 게시글 필터가 없으면 숨김
                    }
                }
            }
            // 공공데이터인 경우 (날짜 제한 없음)
            else if (['축제', '공연', '관광', '테마파크'].includes(dataType)) {
                if (isAllActive) {
                    shouldShow = true;
                } else if (activeFilters.includes(dataType)) {
                    shouldShow = true;
                } else {
                    shouldShow = false; // 해당 필터가 없으면 숨김
                }
            }
        }

        marker.setVisible(shouldShow);
        if (shouldShow) visibleCount++;
        else hiddenCount++;
    });

    console.log(`📍 마커 상태: 보임 ${visibleCount}개, 숨김 ${hiddenCount}개`);// 하단 시트 업데이트 - 현재 지도에 보이는 게시물만 표시
    updateBottomSheetWithVisiblePosts();
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
    postsListContainer.style.margin = '0'; filteredPosts.reverse().forEach((post, index) => {
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

        // 게시물 클릭 시 상세 페이지로 이동
        li.addEventListener('click', () => {
            sessionStorage.setItem('selectedPost', JSON.stringify(post));
            window.location.href = '/community/post_detail.html';
        });

        postsListContainer.appendChild(li);
    });

    sheetContent.innerHTML = '';
    sheetContent.appendChild(postsListContainer);
}

// 중복 제거: 필터 버튼 클릭 이벤트 리스너는 한 번만 선언
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
        if (currentSearchTerm !== '') {
            updateBottomSheetWithSearch();
        } else {
            filterPostsByTags();
        }
    });
});
// 초기 상태도 맞춰주기 (필터 버튼들 모두 켜져있다고 가정)
updateAllButtonState();

// 현재 지도 뷰포트에 보이는 마커들만 가져오는 함수
function getVisibleMarkers() {
    if (!map) return [];

    const bounds = map.getBounds();
    const visibleMarkers = [];

    mapMarkers.forEach(({ marker, post, dataType, category }) => {
        const position = marker.getPosition();
        if (bounds.hasLatLng(position) && marker.getVisible()) {
            visibleMarkers.push({ marker, post, dataType, category });
        }
    });

    return visibleMarkers;
}

// 지도 뷰포트에 보이는 게시물만 하단 시트에 표시하는 함수
function updateBottomSheetWithVisiblePosts() {
    // 필터 상태 확인
    const activeFilters = [...document.querySelectorAll('.filters button.active')]
        .filter(btn => btn.dataset.type !== '전체')
        .map(btn => btn.dataset.type);
    const allFiltersActive = document.querySelector('.filters button[data-type="전체"]').classList.contains('active');

    const sheetContent = document.getElementById('sheetContent');

    // 전체가 비활성화되고 다른 필터도 없으면 안내 메시지 표시
    if (!allFiltersActive && activeFilters.length === 0) {
        sheetContent.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">필터를 선택하면 게시물이 표시됩니다.<br>상단의 필터 버튼을 활성화해주세요.</div>';
        return;
    }

    const visibleMarkers = getVisibleMarkers();
    const visibleItems = [];

    // 공공데이터에서 실제 데이터 가져오기
    const publicData = JSON.parse(localStorage.getItem('publicData') || '[]');

    visibleMarkers.forEach(({ marker, post, dataType, category }) => {
        if (post) {
            // 사용자 게시물
            visibleItems.push(post);
        } else if (['축제', '공연', '관광', '테마파크'].includes(dataType)) {
            // 공공데이터 - 해당 위치의 실제 데이터 찾기
            const position = marker.getPosition();
            const matchingPublicData = publicData.find(item =>
                item.type === dataType &&
                Math.abs(item.lat - position.lat()) < 0.0001 &&
                Math.abs(item.lng - position.lng()) < 0.0001
            );

            if (matchingPublicData) {
                visibleItems.push(matchingPublicData);
            }
        }
    });

    console.log(`현재 지도에 보이는 항목: ${visibleItems.length}개`);

    if (visibleItems.length === 0) {
        sheetContent.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">현재 지도 영역에 표시된 게시물이 없습니다.<br>지도를 이동하거나 확대/축소해보세요.</div>';
        return;
    }

    // 최신 게시물부터가 아니라, 랜덤 섞기
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    const shuffledItems = shuffleArray([...visibleItems]);

    const postsListContainer = document.createElement('div');
    const postsList = document.createElement('ul');
    postsList.style.listStyle = 'none';
    postsList.style.padding = '0';
    postsList.style.margin = '0';

    shuffledItems.forEach((item, index) => {
        const li = createPostListItem(item, false);
        postsList.appendChild(li);
    });
    postsListContainer.appendChild(postsList);
    sheetContent.innerHTML = '';
    sheetContent.appendChild(postsListContainer);
}

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
    maxHeight = window.innerHeight - searchRect.bottom - 55; // 55px 여백
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
    e.stopPropagation(); // 이벤트 버블링 방지
    if (e.pointerType === 'mouse' && e.button !== 0) return; // 마우스는 왼쪽 버튼만 허용, 터치/펜은 무조건 허용
    isDragging = true;
    startY = e.clientY;
    startHeight = bottomSheet.getBoundingClientRect().height;
    dragHandle.style.cursor = 'grabbing';

    // 지도 이벤트 비활성화
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.style.pointerEvents = 'none';
    }

    document.addEventListener('pointermove', pointerMoveHandler);
    document.addEventListener('pointerup', pointerUpHandler);
    document.addEventListener('pointercancel', pointerCancelHandler);
});
function pointerMoveHandler(e) {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    const dy = e.clientY - startY; // 위로 올리면 음수, 아래로 내리면 양수
    setHeight(startHeight - dy); // 위로 올릴수록 height 증가
}
function pointerUpHandler(e) {
    if (!isDragging) return;
    isDragging = false;
    dragHandle.style.cursor = 'grab';

    // 지도 이벤트 재활성화
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.style.pointerEvents = 'auto';
    }

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

    // 지도 이벤트 재활성화
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.style.pointerEvents = 'auto';
    }

    setHeight(minHeight);
    document.removeEventListener('pointermove', pointerMoveHandler);
    document.removeEventListener('pointerup', pointerUpHandler);
    document.removeEventListener('pointercancel', pointerCancelHandler);
}


// 하단 시트 콘텐츠 업데이트 함수 (3일 제한 적용)
function updateBottomSheetContent() {
    const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');
    const sheetContent = document.getElementById('sheetContent');

    // 3일 이내 게시물만 필터링
    const recentPosts = posts.filter(post => isWithinThreeDays(post.createdAt));

    if (recentPosts.length === 0) {
        sheetContent.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">최근 3일 이내 등록된 게시글이 없습니다.</div>';
        return;
    }

    const postsListContainer = document.createElement('ul');
    postsListContainer.style.listStyle = 'none';
    postsListContainer.style.padding = '0';
    postsListContainer.style.margin = '0'; recentPosts.reverse().forEach((post, index) => {
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

        // 게시물 클릭 시 상세 페이지로 이동
        li.addEventListener('click', () => {
            sessionStorage.setItem('selectedPost', JSON.stringify(post));
            window.location.href = '/community/post_detail.html';
        });

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

// [DB 연동] Info 마커 데이터 불러오기 및 localStorage에 저장
function fetchInfoMarkersFromDB() {
    fetch('/api/info/list')
        .then(response => response.json())
        .then(data => {
            // Info 엔티티의 카테고리별 type 매핑
            const publicData = data.result.map(item => ({
                lat: item.infoLatitude,
                lng: item.infoLongitude,
                type: item.infoCategory, // '축제', '공연', '관광', '테마파크' 등
                title: item.infoTitle,
                content: item.infoContent || '',
                image: item.infoImages || '',
                address: item.infoAddress || '',
                eventStartDate: item.infoEventStartDate || '',
                eventEndDate: item.infoEventEndDate || ''
            }));
            localStorage.setItem('publicData', JSON.stringify(publicData));
            // 마커 및 하단 시트 갱신
            if (typeof renderMarkersByCategory === 'function') {
                renderMarkersByCategory();
            }
            if (typeof updateBottomSheetWithVisiblePosts === 'function') {
                updateBottomSheetWithVisiblePosts();
            }
        })
        .catch(err => {
            console.error('DB에서 마커 데이터 불러오기 실패:', err);
        });
}

// [DB 연동] 사용자 게시물 마커 데이터 불러오기
function fetchUserPostsFromDB() {
    console.log('🔄 DB에서 사용자 게시물 불러오기 시작...');

    fetch('/api/post/all')
        .then(response => {
            console.log('📡 API 응답 상태:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('📦 받은 데이터:', data);

            if (data.result && Array.isArray(data.result)) {
                console.log('✅ 게시물 개수:', data.result.length);

                // 사용자 게시물 데이터를 testPosts 형태로 변환
                const userPosts = data.result.map(item => {
                    console.log('📋 게시물 데이터:', item);
                    return {
                        id: item.postId,
                        title: item.postTitle,
                        content: item.postContent,
                        category: item.postCategory || '게시글',
                        lat: item.postLatitude,
                        lng: item.postLongitude,
                        tags: item.postTags ? item.postTags.split(',') : [],
                        createdAt: item.postCreatedAt,
                        cameraImage: item.postImage || null,
                        galleryImages: item.postImages ? item.postImages.split(',') : []
                    };
                });

                console.log('🔄 변환된 게시물 데이터:', userPosts);

                // localStorage의 기존 testPosts를 DB 데이터로 교체
                localStorage.setItem('testPosts', JSON.stringify(userPosts));
                console.log('💾 localStorage에 저장 완료');

                // 기존 마커들 제거하고 다시 렌더링
                if (typeof window.mapMarkers !== 'undefined') {
                    window.mapMarkers.forEach(({ marker }) => marker.setMap(null));
                    window.mapMarkers = [];
                    console.log('🗑️ 기존 마커 제거 완료');
                }

                // 마커 다시 렌더링
                console.log('🎯 마커 렌더링 시작...');
                renderUserPostMarkers();
            } else {
                console.warn('⚠️ 데이터 형식이 올바르지 않음:', data);
            }
        })
        .catch(err => {
            console.error('❌ DB에서 사용자 게시물 불러오기 실패:', err);
        });
}

window.addEventListener('DOMContentLoaded', function () {
    fetchInfoMarkersFromDB(); // 페이지 로드시 DB에서 공공데이터 마커 불러오기
    fetchUserPostsFromDB(); // 페이지 로드시 DB에서 사용자 게시물 마커 불러오기

    // 공공데이터는 별도로 처리
    const publicData = JSON.parse(localStorage.getItem('publicData') || '[]');
    mapMarkers = [];
    updateBottomSheetWithVisiblePosts();

    // 공공데이터 마커 추가 (날짜 제한 없음)
    publicData.forEach(item => {
        if (item.lat && item.lng) {
            let iconOptions = {};
            switch (item.type) {
                case '축제':
                    iconOptions = { icon: { content: '<div style="background:#ffb300;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '공연':
                    iconOptions = { icon: { content: '<div style="background:#42a5f5;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '관광':
                    iconOptions = { icon: { content: '<div style="background:#66bb6a;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '테마파크':
                    iconOptions = { icon: { content: '<div style="background:#ab47bc;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                default:
                    iconOptions = {};
            }
            const marker = new naver.maps.Marker(Object.assign({
                position: new naver.maps.LatLng(item.lat, item.lng),
                map: map
            }, iconOptions));
            mapMarkers.push({
                marker,
                category: item.type || '기타',
                dataType: item.type || 'public_data',
                post: null // 공공데이터는 게시물 정보 없음
            });            // 공공데이터 마커 클릭 시 제목+사진, 사진 클릭 시 상세 정보 모달 표시
            const title = item.title || item.infoTitle || '제목 없음';
            const rawImage = item.image || item.infoImages || '';
            let image = (!rawImage || rawImage === '없음') ? '/common/no-image.png' : rawImage;
            if (image !== '/common/no-image.png') {
                image = encodeURI(image);
            }

            let publicPhotoHtml = '';
            if (rawImage && rawImage !== '없음') {
                const lower = rawImage.toLowerCase();
                if (lower.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
                    publicPhotoHtml = `<img src='${encodeURI(rawImage)}' style='width:100%;max-height:120px;margin-top:6px;border-radius:8px;object-fit:cover;cursor:pointer;'>`;
                }
            }

            // InfoWindow 내용 구성
            const infoHtml = `
                <div id="publicInfoWindowContent_${item.lat}_${item.lng}" style="min-width:180px;max-width:220px;word-break:break-all;position:relative;cursor:pointer;padding:8px;">
                    <div style="font-weight:500;margin-bottom:8px;">${title}</div>
                    ${publicPhotoHtml}
                    <div style="font-size:0.85em;color:#666;margin-top:4px;">클릭하여 상세정보 보기</div>
                </div>
            `;

            const infowindow = new naver.maps.InfoWindow({ content: infoHtml, zIndex: 9999 });

            naver.maps.Event.addListener(marker, 'click', function () {
                // 기존 InfoWindow 모두 닫기
                if (globalInfoWindow && globalInfoWindow !== infowindow) {
                    globalInfoWindow.close();
                }

                infowindow.open(map, marker);
                globalInfoWindow = infowindow;

                // InfoWindow 내부 클릭 시 상세 모달 띄우기
                setTimeout(() => {
                    const contentDiv = document.getElementById(`publicInfoWindowContent_${item.lat}_${item.lng}`);
                    if (contentDiv) {
                        contentDiv.onclick = function (e) {
                            e.stopPropagation(); // 이벤트 버블링 방지
                            infowindow.close(); // 팝업창 닫기
                            showPublicDetail(title, image, item.overview || item.infoText || item.content || '상세 정보가 없습니다.');
                        };
                    }
                }, 100);

                // 지도 클릭 시 InfoWindow 닫기 (팝업창 밖 클릭)
                if (globalMapClickListener) {
                    naver.maps.Event.removeListener(globalMapClickListener);
                }
                globalMapClickListener = naver.maps.Event.addListener(map, 'click', function () {
                    infowindow.close();
                    if (globalMapClickListener) {
                        naver.maps.Event.removeListener(globalMapClickListener);
                        globalMapClickListener = null;
                    }
                });

                // 이미지가 있으면 이미지 로드 후 위치 보정
                if (publicPhotoHtml) {
                    setTimeout(() => {
                        const iwEl = document.querySelector('.ncp_infowindow_inner, .ncp_infowindow');
                        if (iwEl) {
                            const img = iwEl.querySelector('img');
                            if (img) {
                                img.onload = function () {
                                    const markerPos = marker.getPosition();
                                    const proj = map.getProjection();
                                    if (proj && markerPos) {
                                        const point = proj.fromCoordToPoint(markerPos);
                                        point.y -= 70 / Math.pow(2, map.getZoom() - 7);
                                        const newCoord = proj.fromPointToCoord(point);
                                        infowindow.setPosition(newCoord);
                                    }
                                };
                            }
                        }
                    }, 200);
                }
            });
        }
    });    // 지도 이동/줌 변경 시 하단 시트 업데이트
    naver.maps.Event.addListener(map, 'bounds_changed', function () {
        // 디바운스를 위해 약간의 지연 후 업데이트
        setTimeout(() => {
            if (currentSearchTerm === '') {
                updateBottomSheetWithVisiblePosts();
            }
        }, 300);
    });

    naver.maps.Event.addListener(map, 'zoom_changed', function () {
        setTimeout(() => {
            if (currentSearchTerm === '') {
                updateBottomSheetWithVisiblePosts();
            }
        }, 300);
    });

    // 초기 필터 상태 적용
    filterPostsByTags();

    // 검색 기능 초기화
    initializeSearch();
});

// 필터 버튼 클릭 시 마커 필터링
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterPostsByTags();
    });
});

// 네이버 지도 및 위치 선택 관련 코드 (기존 index.html <script>에서 이동)
var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(34.96605, 126.7869061),
    zoom: 10
});

// 지도 롱프레스(2초)로 newPost 이동 및 좌표 전달 (PC+모바일 완벽 지원)
(function () {
    let pressTimer = null;
    let downLatLng = null;
    let moved = false;    // 통합 이벤트 처리 함수
    function startPress(coord) {
        if (!coord) return;
        downLatLng = coord;
        moved = false;
        pressTimer = setTimeout(function () {
            if (downLatLng && !moved) {
                try {
                    localStorage.setItem('selectedCoords', JSON.stringify({ lat: downLatLng.y, lng: downLatLng.x }));
                    // 디버그 모드 방지를 위해 replace 사용
                    window.location.replace('/newPost/newPost.html');
                } catch (error) {
                    console.error('페이지 이동 중 오류:', error);
                    // 에러 발생 시 일반적인 방법으로 이동
                    window.location.href = '/newPost/newPost.html';
                }
            }
        }, 2000);
    }

    function endPress() {
        clearTimeout(pressTimer);
        pressTimer = null;
    }

    function onMove() {
        moved = true;
    }

    // PC: 마우스 이벤트
    naver.maps.Event.addListener(map, 'mousedown', function (e) {
        startPress(e.coord);
    });
    naver.maps.Event.addListener(map, 'mouseup', endPress);
    naver.maps.Event.addListener(map, 'mouseout', endPress);
    naver.maps.Event.addListener(map, 'mousemove', onMove);

    // 모바일: 터치 이벤트 (네이버 지도 API 사용)
    naver.maps.Event.addListener(map, 'touchstart', function (e) {
        startPress(e.coord);
    });
    naver.maps.Event.addListener(map, 'touchend', endPress);
    naver.maps.Event.addListener(map, 'touchmove', onMove);
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

// bottomSheet의 드래그 핸들에서만 터치 이벤트 차단, 콘텐츠 영역은 스크롤 허용
const bottomSheetElement = document.getElementById('bottomSheet');
const dragHandleElement = document.getElementById('dragHandle');
const sheetContentElement = document.getElementById('sheetContent');

if (bottomSheetElement && dragHandleElement && sheetContentElement) {
    // sheetContent에서 스크롤 중일 때 드래그 방지
    let isScrolling = false;

    sheetContentElement.addEventListener('touchstart', (e) => {
        isScrolling = true;
    });

    sheetContentElement.addEventListener('touchend', (e) => {
        setTimeout(() => {
            isScrolling = false;
        }, 100);
    });

    // 드래그 핸들에서만 pointer 이벤트 허용 (기존 pointer 이벤트와 별개)
    dragHandleElement.addEventListener('touchstart', (e) => {
        if (!isScrolling) {
            e.stopPropagation();
        }
    });

    dragHandleElement.addEventListener('touchmove', (e) => {
        if (!isScrolling) {
            e.stopPropagation();
        }
    });

    dragHandleElement.addEventListener('touchend', (e) => {
        if (!isScrolling) {
            e.stopPropagation();
        }
    });
}

// 전역 검색어 변수 선언 (currentSearchTerm 오류 방지)
let currentSearchTerm = '';

// initializeSearch 오류 방지: 함수가 필요 없으면 아래 호출 주석처리 또는 함수 더미 추가
function initializeSearch() {
    // 필요시 검색 초기화 코드 작성, 현재는 빈 함수로 둠
}

// 게시글/공공데이터(축제, 공연, 관광, 테마파크 등) 모두 지원하는 리스트 아이템 생성 함수
function createPostListItem(item, isSearchResult = false) {
    // 게시글/공공데이터 구분
    const isPublic = ['축제', '공연', '관광', '테마파크'].includes(item.type);
    const title = item.title || item.infoTitle || item.postTitle || '제목 없음';
    const content = item.content || item.infoContent || item.postContent || '';
    const category = item.type || item.category || item.infoCategory || '기타';
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.eventStartDate || '');
    let image = item.image || item.infoImages || item.postImage || '';

    // 이미지가 없거나, '없음', 'no-image', 확장자 미포함, src가 비정상(깨진 링크 포함)일 때 이미지 태그를 절대 렌더링하지 않음
    let imageTag = '';
    if (image && typeof image === 'string') {
        const lower = image.toLowerCase();
        if (
            lower &&
            lower !== '없음' &&
            !lower.includes('no-image') &&
            lower.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)
        ) {
            // 이미지가 실제로 로드 가능한지 동적으로 검사
            const img = new window.Image();
            img.src = image;
            img.onload = function () {
                // 정상 이미지일 때만 추가
                if (img.width > 0 && img.height > 0) {
                    img.style.cssText = 'width:100px;max-height:60px;margin-top:6px;border-radius:8px;object-fit:cover;';
                    li.appendChild(img);
                }
            };
            // onerror는 아무것도 하지 않음(깨진 이미지 무시)
        }
    }

    const li = document.createElement('li');
    li.style.padding = '12px 20px';
    li.style.borderBottom = '1px solid #eee';
    li.style.cursor = 'pointer';

    li.innerHTML = `
        <div style="font-weight:500;">${title}</div>
        <div style="color:#888;font-size:0.85em;margin-top:4px;"></div>
    `;
    // 이미지 태그는 위에서 동적으로 append

    // 클릭 시 상세 페이지 이동(게시글만), 공공데이터는 상세 없음
    if (!isPublic) {
        li.addEventListener('click', () => {
            sessionStorage.setItem('selectedPost', JSON.stringify(item));
            window.location.href = '/community/post_detail.html';
        });
    }
    return li;
}

// 중복 제거: 마커 생성 및 이벤트 바인딩 함수화
function createMarker(options) {
    // options: { position, map, iconOptions, infoHtml, onClick }
    const marker = new naver.maps.Marker(Object.assign({
        position: options.position,
        map: options.map
    }, options.iconOptions));
    if (options.infoHtml) {
        const infowindow = new naver.maps.InfoWindow({ content: options.infoHtml, zIndex: 9999 });
        naver.maps.Event.addListener(marker, 'click', function () {
            infowindow.open(options.map, marker);
            const closeOnMapClick = function () {
                infowindow.close();
                naver.maps.Event.removeListener(mapClickListener);
            };
            const mapClickListener = naver.maps.Event.addListener(map, 'click', closeOnMapClick);
        });
    }
    if (options.onClick) {
        naver.maps.Event.addListener(marker, 'click', options.onClick);
    }
    return marker;
}

// 상세 정보 모달 표시 함수 (전역에 추가)
function showPublicDetail(title, image, content) {
    // 모달이 이미 있으면 제거
    const oldModal = document.getElementById('publicDetailModal');
    if (oldModal) oldModal.remove();

    // 모달 생성
    const modal = document.createElement('div');
    modal.id = 'publicDetailModal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
        <div id="modalContent" style="background:#fff;padding:24px 20px 16px 20px;border-radius:12px;max-width:340px;width:90vw;box-shadow:0 4px 24px #0002;position:relative;max-height:80vh;overflow-y:auto;">
            <div style="font-size:1.1em;font-weight:600;margin-bottom:10px;">${title}</div>
            <img src="${image}" style="width:100%;max-height:220px;border-radius:8px;object-fit:cover;" onerror="this.onerror=null;this.src='/common/no-image.png';">
            <div style="margin-top:12px;color:#444;font-size:0.98em;white-space:pre-line;line-height:1.5;">${content || '상세 정보가 없습니다.'}</div>
            <button id="closeModalBtn" style="position:absolute;top:8px;right:12px;font-size:1.3em;background:none;border:none;cursor:pointer;color:#888;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">&times;</button>
        </div>
    `;

    document.body.appendChild(modal);

    // 모달 닫기 이벤트들
    function closeModal() {
        const modalEl = document.getElementById('publicDetailModal');
        if (modalEl) modalEl.remove();
    }

    // X 버튼 클릭 시 닫기
    document.getElementById('closeModalBtn').onclick = closeModal;

    // 모달 배경(밖) 클릭 시 닫기
    modal.onclick = function (e) {
        if (e.target === modal) {
            closeModal();
        }
    };

    // ESC 키로 닫기
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscKey);
        }
    }
    document.addEventListener('keydown', handleEscKey);

    // 모달 내용 클릭 시 이벤트 버블링 방지
    document.getElementById('modalContent').onclick = function (e) {
        e.stopPropagation();
    };
}

// 전역 InfoWindow 인스턴스 하나만 사용
let globalInfoWindow = null;
let globalMapClickListener = null;

function openGlobalInfoWindow(map, marker, html) {
    if (globalInfoWindow) {
        globalInfoWindow.close();
    }
    globalInfoWindow = new naver.maps.InfoWindow({ content: html, zIndex: 9999 });
    globalInfoWindow.open(map, marker);
    // 지도 클릭 시 InfoWindow 닫기 이벤트 등록
    if (globalMapClickListener) {
        naver.maps.Event.removeListener(globalMapClickListener);
    }
    globalMapClickListener = naver.maps.Event.addListener(map, 'click', function () {
        if (globalInfoWindow) globalInfoWindow.close();
        if (globalMapClickListener) naver.maps.Event.removeListener(globalMapClickListener);
    });
}

// 사용자 게시물 마커 렌더링 함수
function renderUserPostMarkers() {
    const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');
    const recentPosts = posts.filter(post => isWithinThreeDays(post.createdAt));

    recentPosts.forEach(post => {
        if (post.lat && post.lng) {
            // 카테고리별 마커 색상 지정
            let iconOptions = {};
            switch (post.category) {
                case '축제':
                    iconOptions = { icon: { content: '<div style="background:#ffb300;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '공연':
                    iconOptions = { icon: { content: '<div style="background:#42a5f5;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '관광':
                    iconOptions = { icon: { content: '<div style="background:#66bb6a;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '테마파크':
                    iconOptions = { icon: { content: '<div style="background:#ab47bc;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px #0002;"></div>', anchor: new naver.maps.Point(12, 12) } };
                    break;
                case '게시글':
                    iconOptions = { icon: { content: '<div style="color:#ef5350;font-size:32px;text-shadow:0 2px 4px rgba(0,0,0,0.3);"><span class="material-icons" style="font-size:32px;">location_on</span></div>', anchor: new naver.maps.Point(16, 32) } };
                    break;
                default:
                    iconOptions = { icon: { content: '<div style="color:#ef5350;font-size:32px;text-shadow:0 2px 4px rgba(0,0,0,0.3);"><span class="material-icons" style="font-size:32px;">location_on</span></div>', anchor: new naver.maps.Point(16, 32) } };
            }

            const marker = new naver.maps.Marker(Object.assign({
                position: new naver.maps.LatLng(post.lat, post.lng),
                map: map
            }, iconOptions));

            if (!window.mapMarkers) window.mapMarkers = [];
            window.mapMarkers.push({
                marker,
                category: post.category || '기타',
                dataType: post.type || 'user_post',
                post: post
            });

            // 마커 클릭 시 정보창
            const tagsHtml = post.tags && post.tags.length > 0
                ? `<div style="margin:4px 0 6px 0;">${post.tags.map(tag =>
                    `<span style="display:inline-block;margin:1px 2px;padding:1px 8px;border-radius:10px;background:#e8f4fd;color:#2193b0;font-size:0.8em;">${tag}</span>`
                ).join('')}</div>`
                : '';

            const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : '날짜 없음';

            // 사용자 게시글 팝업: 본인이 등록한 사진만 출력
            let photoHtml = '';
            if (post.cameraImage) {
                photoHtml = `<img src='${encodeURI(post.cameraImage)}' style='width:100%;max-height:120px;margin-top:6px;border-radius:8px;object-fit:cover;'>`;
            } else if (post.galleryImages && post.galleryImages.length > 0 && post.galleryImages[0] && post.galleryImages[0] !== '없음') {
                photoHtml = `<img src='${encodeURI(post.galleryImages[0])}' style='width:100%;max-height:120px;margin-top:6px;border-radius:8px;object-fit:cover;'>`;
            }

            const infoHtml = `
                <div style="min-width:180px;max-width:220px;word-break:break-all;position:relative;">
                    <b>${post.title}</b><br>
                    <span style='display:inline-block;margin:4px 0 6px 0;padding:2px 10px;border-radius:12px;background:#6dd5ed;color:#fff;font-size:0.9em;'>${post.category ? post.category : '기타'}</span><br>
                    ${tagsHtml} <span>${post.category ? '[' + post.category + '] ' : ''}${post.content}</span><br>
                    <div style="margin-top:8px;padding-top:6px;border-top:1px solid #eee;color:#666;font-size:0.85em;">
                        게시일: ${postDate}
                    </div>
                    ${photoHtml}
                </div>
            `;

            const infowindow = new naver.maps.InfoWindow({ content: infoHtml, zIndex: 9999 });
            naver.maps.Event.addListener(marker, 'click', function () {
                infowindow.open(map, marker);
                setTimeout(() => {
                    const mapClickListener = naver.maps.Event.addListener(map, 'click', function () {
                        infowindow.close();
                        naver.maps.Event.removeListener(mapClickListener);
                    });
                }, 0);
            });
        }
    });

    // 하단 시트 업데이트
    updateBottomSheetWithVisiblePosts();
}

