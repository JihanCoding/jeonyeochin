// 뒤로가기 버튼
document.getElementById('backButton')?.addEventListener('click', () => {
  window.location.href = '/index/index.html';
});

// 사용자 게시글 로드 및 표시 함수
function loadUserPosts() {
  const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');

  console.log('로드된 게시글 수:', posts.length);
  console.log('게시글 데이터:', posts);

  // 전역 변수에 저장하여 검색에서 사용
  allCommunityPosts = posts.slice().reverse(); // 최신 게시글부터 표시

  displayCommunityPosts(allCommunityPosts);
}

// 사용자 게시글 카드 생성 함수
function createUserPostCard(post, index, isSearchResult = false) {
  const card = document.createElement('div');
  card.className = 'community-card';
  card.dataset.type = post.category || '자유게시글';
  // 검색 결과인 경우 스타일 적용
  if (isSearchResult) {
    card.style.backgroundColor = 'transparent';
    card.style.borderLeft = '3px solid #2196f3';
  }
  // 검색어 하이라이트 함수
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // 태그 HTML 생성 (검색어 하이라이트 포함)
  let tagsHtml = '';
  if (post.tags && post.tags.length > 0) {
    tagsHtml = post.tags.map(tag => {
      const highlightedTag = currentCommunitySearchTerm !== ''
        ? highlightText(tag, currentCommunitySearchTerm)
        : tag;
      return `#${highlightedTag}`;
    }).join(' ');
  }

  // 제목과 내용에 검색어 하이라이트 적용
  const highlightedTitle = currentCommunitySearchTerm !== ''
    ? highlightText(post.title, currentCommunitySearchTerm)
    : post.title;

  const highlightedContent = currentCommunitySearchTerm !== ''
    ? highlightText(post.content, currentCommunitySearchTerm)
    : post.content;

  // 작성일 포맷팅
  const createdDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  // 이미지가 있는지 확인
  const hasImage = post.cameraImage || (post.galleryImages && post.galleryImages.length > 0);

  // 이미지 HTML 생성 (이미지가 있을 때만)
  let imageSection = '';
  if (hasImage) {
    let imageHtml = '';
    if (post.cameraImage) {
      imageHtml = `<img src="${post.cameraImage}" alt="게시글 이미지" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    } else if (post.galleryImages && post.galleryImages.length > 0) {
      imageHtml = `<img src="${post.galleryImages[0]}" alt="게시글 이미지" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    }
    imageSection = `<div class="card-image">${imageHtml}</div>`;
  }
  card.innerHTML = `
    <div class="card-header">
      <div class="card-profile"></div>
      <div class="card-meta">
        <div class="card-type">${post.category || '자유게시글'}</div>
        <div class="card-title">${highlightedTitle}</div>
      </div>
      <div class="card-info">
        <div class="card-author">사용자${index + 1}</div>
        <div class="card-date">${createdDate}</div>
      </div>
    </div>
    ${imageSection}
    <div class="card-tags">${tagsHtml}</div>
    <div class="card-content">${highlightedContent}</div>
  `;

  // 카드 클릭 시 상세 페이지로 이동 (나중에 구현)
  card.addEventListener('click', () => {
    // 상세 페이지로 게시글 정보 전달
    localStorage.setItem('selectedPost', JSON.stringify(post));
    window.location.href = '/community/post_detail.html';
  });

  return card;
}

// 필터 버튼 토글
const filterButtons = document.querySelectorAll('.filters button');

function filterCommunityCards() {
  const communityCards = document.querySelectorAll('.community-card');

  // 활성화된 버튼의 data-type을 배열로 수집
  const activeTypes = Array.from(filterButtons)
    .filter(btn => btn.classList.contains('active'))
    .map(btn => btn.dataset.type);

  // 전체가 선택된 경우 모두 표시
  if (activeTypes.includes('전체')) {
    communityCards.forEach(card => card.style.display = '');
    return;
  }

  // 각 카드의 data-type이 활성화된 타입에 포함되는 경우만 표시
  communityCards.forEach(card => {
    if (activeTypes.includes(card.dataset.type)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // 기존 토글 로직 유지
    const isAll = btn.dataset.type === '전체';
    if (isAll) {
      const isActive = btn.classList.contains('active');
      filterButtons.forEach(b => b.classList.toggle('active', !isActive));
    } else {
      btn.classList.toggle('active');
      const others = [...filterButtons].filter(b => b.dataset.type !== '전체');
      const allActive = others.every(b => b.classList.contains('active'));
      document.querySelector('[data-type="전체"]').classList.toggle('active', allActive);
    }
    filterCommunityCards(); // 필터링 적용
  });
});

// 더미 게시글 카드 생성 (비활성화 - 사용자 게시글을 사용)
function createCommunityCard(index) {
  const card = document.createElement('div');
  card.className = 'community-card';
  card.innerHTML = `
    <div class="card-header">
      <div class="card-profile">👤</div>
      <div class="card-meta">
        <div class="card-type">게시글 종류</div>
        <div class="card-author">작성자</div>
      </div>
    </div>
    <div class="card-image">이미지</div>
  `;
  return card;
}

// 무한 스크롤 로딩 (비활성화 - 사용자 게시글을 사용)
const communityList = document.getElementById('communityList');
let page = 1;
let loading = false;

function loadMoreCommunity() {
  // 더미 카드 생성 비활성화
  return;
  /*
  if (loading) return;
  loading = true;
  setTimeout(() => {
    for (let i = 0; i < 8; i++) {
      communityList.appendChild(createCommunityCard((page - 1) * 8 + i + 1));
    }
    page++;
    loading = false;
  }, 500);
  */
}

// 초기 로딩 및 스크롤 이벤트 (비활성화)
// loadMoreCommunity();
/*
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMoreCommunity();
  }
});
*/

// 가로 스크롤 드래그 지원
function enableHorizontalDragScroll(selector) {
  document.querySelectorAll(selector).forEach(scrollEl => {
    let isDown = false;
    let startX, scrollLeft;

    scrollEl.addEventListener('mousedown', (e) => {
      isDown = true;
      scrollEl.classList.add('dragging');
      startX = e.pageX - scrollEl.offsetLeft;
      scrollLeft = scrollEl.scrollLeft;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - scrollEl.offsetLeft;
      scrollEl.scrollLeft = scrollLeft - (x - startX);
    });

    document.addEventListener('mouseup', () => {
      isDown = false;
      scrollEl.classList.remove('dragging');
    });

    scrollEl.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].pageX;
      scrollLeft = scrollEl.scrollLeft;
    });

    scrollEl.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      const x = e.touches[0].pageX;
      scrollEl.scrollLeft = scrollLeft - (x - startX);
    });
  });
}

enableHorizontalDragScroll('.horizontal-scroll');

// 알림 아이콘 클릭 시 알림 페이지로 이동
const notificationBtn = document.getElementById('notificationBtn');
if (notificationBtn) {
  notificationBtn.addEventListener('click', function () {
    window.location.href = '/notifications/notifications.html';
  });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
  // 검색 기능 초기화
  initializeCommunitySearch();

  // 사용자 게시글 로드
  loadUserPosts();

  // 저장된 검색어가 있으면 자동 검색 실행
  const searchInput = document.getElementById('communitySearchInput');
  const lastSearch = localStorage.getItem('lastSearch');
  if (searchInput && lastSearch && lastSearch.trim() !== '') {
    searchInput.value = lastSearch;
    // 검색 실행
    setTimeout(() => {
      performCommunitySearch();
    }, 100);
    // 사용 후 삭제
    localStorage.removeItem('lastSearch');
  }
});

// 검색 관련 변수 및 기능
let currentCommunitySearchTerm = '';
let allCommunityPosts = [];

// 커뮤니티 검색 기능 초기화
function initializeCommunitySearch() {
  const searchInput = document.getElementById('communitySearchInput');
  const searchButton = searchInput?.nextElementSibling;

  if (!searchInput || !searchButton) return;

  // 검색 버튼 클릭 이벤트
  searchButton.addEventListener('click', performCommunitySearch);

  // 엔터 키 이벤트
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      performCommunitySearch();
    }
  });

  // 검색창이 비워질 때 검색 결과 초기화
  searchInput.addEventListener('input', function (e) {
    if (e.target.value.trim() === '') {
      currentCommunitySearchTerm = '';
      displayCommunityPosts(allCommunityPosts);
    }
  });
}

// 커뮤니티 검색 실행 함수
function performCommunitySearch() {
  const searchInput = document.getElementById('communitySearchInput');
  const searchTerm = searchInput.value.trim();

  if (searchTerm === '') {
    currentCommunitySearchTerm = '';
    displayCommunityPosts(allCommunityPosts);
    return;
  }

  currentCommunitySearchTerm = searchTerm;

  // 태그와 제목, 내용에서 검색어가 포함된 게시물 찾기
  const searchResults = allCommunityPosts.filter(post => {
    // 태그에서 검색
    const tagMatch = post.tags && Array.isArray(post.tags) &&
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // 제목에서 검색
    const titleMatch = post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase());

    // 내용에서 검색
    const contentMatch = post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase());

    return tagMatch || titleMatch || contentMatch;
  });

  console.log(`검색어: "${searchTerm}", 검색 결과: ${searchResults.length}개`);

  // 검색 결과와 나머지 게시물 분리
  const otherPosts = allCommunityPosts.filter(post => !searchResults.includes(post));

  // 검색 결과를 먼저 표시하고 나머지를 뒤에 표시
  displayCommunitySearchResults(searchResults, otherPosts);
}

// 검색 결과 표시 함수
function displayCommunitySearchResults(searchResults, otherPosts) {
  const communityList = document.getElementById('communityList');
  communityList.innerHTML = '';

  console.log(`표시할 검색 결과: ${searchResults.length}개, 기타 게시물: ${otherPosts.length}개`);

  if (searchResults.length === 0) {
    communityList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #888;">
                "<strong>${currentCommunitySearchTerm}</strong>"에 대한 검색 결과가 없습니다.
            </div>
        `;
    return;
  }

  // 검색 결과 섹션
  if (searchResults.length > 0) {
    const searchSection = document.createElement('div');
    searchSection.innerHTML = `
            <div style="padding:12px 20px;background:#f8f9fa;border-bottom:2px solid #e9ecef;font-weight:600;color:#495057;margin-bottom:10px;">
                🔍 검색 결과 "${currentCommunitySearchTerm}" (${searchResults.length}개)
            </div>
        `;
    communityList.appendChild(searchSection);

    searchResults.forEach((post, index) => {
      const card = createUserPostCard(post, index, true); // 검색 결과임을 표시
      communityList.appendChild(card);
    });
  }

  // 나머지 게시물 섹션 (15px 공백 후)
  if (otherPosts.length > 0) {
    const otherSection = document.createElement('div');
    otherSection.style.marginTop = '15px';
    otherSection.innerHTML = `
            <div style="padding:12px 20px;background:#f8f9fa;border-bottom:2px solid #e9ecef;font-weight:600;color:#495057;margin-bottom:10px;">
                📋 다른 게시물 (${otherPosts.length}개)
            </div>
        `;
    communityList.appendChild(otherSection);

    otherPosts.forEach((post, index) => {
      const card = createUserPostCard(post, index, false);
      communityList.appendChild(card);
    });
  }
}

// 일반 게시물 표시 함수
function displayCommunityPosts(posts) {
  const communityList = document.getElementById('communityList');
  communityList.innerHTML = '';

  if (posts.length === 0) {
    communityList.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">작성된 게시글이 없습니다.<br>첫 번째 게시글을 작성해보세요!</div>';
    return;
  }

  posts.forEach((post, index) => {
    const card = createUserPostCard(post, index, false);
    communityList.appendChild(card);
  });
}
