// 뒤로가기 버튼
document.getElementById('backButton')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// 필터 버튼 토글
const filterButtons = document.querySelectorAll('.filters button');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const isAll = btn.dataset.type === '전체보기';
    if (isAll) {
      const isActive = btn.classList.contains('active');
      filterButtons.forEach(b => b.classList.toggle('active', !isActive));
    } else {
      btn.classList.toggle('active');
      const others = [...filterButtons].filter(b => b.dataset.type !== '전체보기');
      const allActive = others.every(b => b.classList.contains('active'));
      document.querySelector('[data-type="전체보기"]').classList.toggle('active', allActive);
    }
  });
});

// 더미 게시글 카드 생성
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

// 무한 스크롤 로딩
const communityList = document.getElementById('communityList');
let page = 1;
let loading = false;

function loadMoreCommunity() {
  if (loading) return;
  loading = true;
  setTimeout(() => {
    for (let i = 0; i < 8; i++) {
      communityList.appendChild(createCommunityCard((page - 1) * 8 + i + 1));
    }
    page++;
    loading = false;
  }, 500);
}

// 초기 로딩 및 스크롤 이벤트
loadMoreCommunity();
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMoreCommunity();
  }
});

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
