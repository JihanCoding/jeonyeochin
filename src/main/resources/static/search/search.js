// 뒤로가기 버튼 동작
const backBtn = document.getElementById('backButton');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        history.back();
    });
}

const filterButtons = document.querySelectorAll('.filters button');
const allButton = document.querySelector('.filters button[data-type="전체"]');
function updateAllButtonState() {
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

        // 검색 중이면 검색 결과 업데이트
        if (currentSearchTerm) {
            performSearch(currentSearchTerm);
        }

        // 필터 버튼 클릭 시 해당 카테고리 태그 표시
        updateTagsForActiveFilters();
    });
});
updateAllButtonState();

// 검색기록 X버튼 동작 및 태그 클릭 검색 기능
const removeBtns = document.querySelectorAll('.search-history .remove-btn');
const searchHistoryItems = document.querySelectorAll('.search-history-item');

// X버튼 클릭 시 삭제
removeBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation(); // 부모 요소의 클릭 이벤트 방지
        const item = this.closest('.search-history-item');
        if (item) item.remove();
    });
});

// 태그 클릭 시 검색 실행
searchHistoryItems.forEach(item => {
    item.addEventListener('click', function (e) {
        // X버튼 클릭이 아닌 경우에만 검색 실행
        if (!e.target.closest('.remove-btn')) {
            const tagText = this.textContent.trim();
            console.log('태그 클릭:', tagText);

            // 검색창에 태그 텍스트 입력
            if (searchInput) {
                searchInput.value = tagText;

                // 실시간 검색 실행
                performSearch(tagText);

                // 검색창에 포커스
                searchInput.focus();
            }
        }
    });

    // 호버 효과를 위한 커서 스타일
    item.style.cursor = 'pointer';
});

// 검색 관련 변수
let currentSearchTerm = '';
let searchResults = [];
let allPosts = [];
let searchMode = 'all'; // 'all' 또는 'tag'
let allTags = [];

// DOM 요소
const searchInput = document.querySelector('.search-bar input');
const searchBtn = document.querySelector('.search-bar button');
const searchResultsDiv = document.getElementById('searchResults');
const searchHistoryDiv = document.querySelector('.search-history-wrapper');
const tagSuggestionsDiv = document.getElementById('tagSuggestions');
const suggestionsList = document.getElementById('suggestionsList');
const tagModeBtn = document.getElementById('tagModeBtn');
const allModeBtn = document.getElementById('allModeBtn');
const searchBar = document.querySelector('.search-bar');

function initializeSearchData() {
    // 사용자 게시글과 공공데이터 가져오기
    const userPosts = JSON.parse(localStorage.getItem('testPosts') || '[]');
    const publicData = JSON.parse(localStorage.getItem('publicData') || '[]');
    allPosts = [...userPosts, ...publicData];

    // 모든 태그 수집 및 빈도 계산
    const tagFrequency = {};
    allPosts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        }
    });

    // 태그를 빈도순으로 정렬
    allTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));

    console.log('로드된 전체 게시물 수:', allPosts.length);
    console.log('수집된 태그 수:', allTags.length);

    // 초기 태그 제안 표시
    if (searchMode === 'tag') {
        showTagSuggestions();
    }
}

// 검색 모드 전환
function switchSearchMode(mode) {
    searchMode = mode;

    // 버튼 상태 업데이트
    tagModeBtn.classList.toggle('active', mode === 'tag');
    allModeBtn.classList.toggle('active', mode === 'all');

    // 검색창 스타일 변경
    searchBar.classList.toggle('tag-mode', mode === 'tag');

    // placeholder 변경
    if (mode === 'tag') {
        searchInput.placeholder = '태그로 검색 (예: 축제, 공연, 전시)';
        showTagSuggestions();
        hideSearchResults();
    } else {
        searchInput.placeholder = '강진수국길축제';
        hideTagSuggestions();
        if (currentSearchTerm) {
            performSearch(currentSearchTerm);
        }
    }
}

function showTagSuggestions(filterText = '') {
    if (searchMode !== 'tag') return;

    tagSuggestionsDiv.style.display = 'block';
    searchHistoryDiv.style.display = 'none';

    let tagsToShow = allTags;

    // 검색어가 있으면 필터링
    if (filterText.trim()) {
        const filterLower = filterText.toLowerCase();
        tagsToShow = allTags.filter(({ tag }) =>
            tag.toLowerCase().includes(filterLower)
        );
    }

    // 최대 20개만 표시
    tagsToShow = tagsToShow.slice(0, 20);

    suggestionsList.innerHTML = '';

    if (tagsToShow.length === 0) {
        suggestionsList.innerHTML = '<div style="color: #999; text-align: center; padding: 16px;">태그를 찾을 수 없습니다.</div>';
        return;
    }

    tagsToShow.forEach(({ tag, count }) => {
        const tagElement = document.createElement('div');
        tagElement.className = 'suggestion-tag';
        tagElement.innerHTML = `
            <span class="material-icons">label</span>
            ${tag}
            <span class="tag-count">${count}</span>
        `;

        tagElement.addEventListener('click', () => {
            searchInput.value = tag;
            performTagSearch(tag);
        });

        suggestionsList.appendChild(tagElement);
    });
}

function hideTagSuggestions() {
    tagSuggestionsDiv.style.display = 'none';
    searchHistoryDiv.style.display = 'block';
}

function performTagSearch(searchTerm) {
    if (!searchTerm.trim()) {
        hideSearchResults();
        if (searchMode === 'tag') {
            showTagSuggestions();
        }
        return;
    }

    currentSearchTerm = searchTerm.trim();

    // 현재 활성화된 필터 가져오기
    const activeFilters = [...document.querySelectorAll('.filters button.active')]
        .filter(btn => btn.dataset.type !== '전체')
        .map(btn => btn.dataset.type);

    const allFiltersActive = document.querySelector('.filters button[data-type="전체"]').classList.contains('active');

    // 태그에서만 검색
    let results = allPosts.filter(post => {
        // 필터 조건 확인
        let matchesFilter = false;
        if (allFiltersActive) {
            matchesFilter = true;
        } else {
            if (activeFilters.includes('게시글') && (!post.type || post.type === 'user_post')) {
                matchesFilter = true;
            }
            if (activeFilters.includes(post.type) || activeFilters.includes(post.category)) {
                matchesFilter = true;
            }
        }

        if (!matchesFilter) return false;

        // 태그에서만 검색
        const searchLower = currentSearchTerm.toLowerCase();
        return post.tags && Array.isArray(post.tags) &&
            post.tags.some(tag => tag.toLowerCase().includes(searchLower));
    });

    searchResults = results;
    displaySearchResults(true); // 태그 검색임을 표시

    console.log(`태그 검색어: "${currentSearchTerm}", 결과: ${searchResults.length}개`);
}

function performSearch(searchTerm) {
    if (!searchTerm.trim()) {
        hideSearchResults();
        return;
    }

    currentSearchTerm = searchTerm.trim();

    // 현재 활성화된 필터 가져오기
    const activeFilters = [...document.querySelectorAll('.filters button.active')]
        .filter(btn => btn.dataset.type !== '전체')
        .map(btn => btn.dataset.type);

    const allFiltersActive = document.querySelector('.filters button[data-type="전체"]').classList.contains('active');

    // 검색 모드에 따라 다른 검색 수행
    let results;

    // 검색어가 '#'으로 시작하면 태그 전용 검색
    if (currentSearchTerm.startsWith('#')) {
        const tagSearchTerm = currentSearchTerm.substring(1); // '#' 제거
        results = performTagOnlySearch(tagSearchTerm, activeFilters, allFiltersActive);
    } else {
        // 일반 검색 (태그, 제목, 내용 모두 검색)
        results = performAllSearch(currentSearchTerm, activeFilters, allFiltersActive);
    }

    searchResults = results;
    displaySearchResults();

    console.log(`검색어: "${currentSearchTerm}", 결과: ${searchResults.length}개`);
}

function performTagOnlySearch(searchTerm, activeFilters, allFiltersActive) {
    // 전체가 비활성화되어 있고 다른 필터도 없으면 빈 결과 반환
    if (!allFiltersActive && activeFilters.length === 0) {
        return [];
    }

    return allPosts.filter(post => {
        // 필터 조건 확인
        let matchesFilter = false;
        if (allFiltersActive) {
            matchesFilter = true;
        } else {
            if (activeFilters.includes('게시글') && (!post.type || post.type === 'user_post')) {
                matchesFilter = true;
            }
            if (activeFilters.includes(post.type) || activeFilters.includes(post.category)) {
                matchesFilter = true;
            }
        }

        if (!matchesFilter) return false;

        // 태그에서만 검색
        const searchLower = searchTerm.toLowerCase();
        return post.tags && Array.isArray(post.tags) &&
            post.tags.some(tag => tag.toLowerCase().includes(searchLower));
    });
}

function performAllSearch(searchTerm, activeFilters, allFiltersActive) {
    // 전체가 비활성화되어 있고 다른 필터도 없으면 빈 결과 반환
    if (!allFiltersActive && activeFilters.length === 0) {
        return [];
    }

    return allPosts.filter(post => {
        // 필터 조건 확인
        let matchesFilter = false;
        if (allFiltersActive) {
            matchesFilter = true;
        } else {
            if (activeFilters.includes('게시글') && (!post.type || post.type === 'user_post')) {
                matchesFilter = true;
            }
            if (activeFilters.includes(post.type) || activeFilters.includes(post.category)) {
                matchesFilter = true;
            }
        }

        if (!matchesFilter) return false;

        // 검색어 매칭
        const searchLower = searchTerm.toLowerCase();

        // 태그에서 검색
        const tagMatch = post.tags && Array.isArray(post.tags) &&
            post.tags.some(tag => tag.toLowerCase().includes(searchLower));

        // 제목에서 검색
        const titleMatch = post.title && post.title.toLowerCase().includes(searchLower);

        // 내용에서 검색
        const contentMatch = post.content && post.content.toLowerCase().includes(searchLower);

        return tagMatch || titleMatch || contentMatch;
    });
}

function displaySearchResults() {
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');
    const resultsList = document.getElementById('resultsList');

    // 검색 결과 영역 표시, 검색 기록 숨기기
    searchResultsDiv.style.display = 'block';
    searchHistoryDiv.style.display = 'none';

    // 태그 전용 검색인지 확인
    const isTagOnlySearch = currentSearchTerm.startsWith('#');
    const displayTerm = isTagOnlySearch ? currentSearchTerm.substring(1) : currentSearchTerm;
    const searchType = isTagOnlySearch ? '태그' : '전체';

    resultsTitle.textContent = `"${displayTerm}" ${searchType} 검색 결과`;
    resultsCount.textContent = `${searchResults.length}개 결과`;

    if (searchResults.length === 0) {
        const noResultsMessage = isTagOnlySearch
            ? `"${displayTerm}" 태그가 포함된 게시물이 없습니다.`
            : '검색 결과가 없습니다.';

        resultsList.innerHTML = `
            <div class="no-results">
                <span class="material-icons">search_off</span>
                <div>${noResultsMessage}</div>
                <div style="margin-top: 8px; font-size: 0.8rem; color: #999;">
                    ${isTagOnlySearch ? '다른 태그를 시도해보세요.' : '다른 검색어를 시도해보세요.'}
                </div>
            </div>
        `;
        return;
    }

    resultsList.innerHTML = '';

    searchResults.forEach((post, index) => {
        const resultItem = createResultItem(post, index, isTagOnlySearch);
        resultsList.appendChild(resultItem);
    });
}

function createResultItem(post, index, isTagOnlySearch = false) {
    const item = document.createElement('div');
    item.className = 'result-item';

    // 검색어 (# 제거한 실제 검색어)
    const searchTerm = currentSearchTerm.startsWith('#') ? currentSearchTerm.substring(1) : currentSearchTerm;

    // 태그에서 검색어가 매칭되는지 확인
    const hasMatchingTag = post.tags && Array.isArray(post.tags) &&
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // 태그 전용 검색이거나 태그가 매칭되면 하이라이트
    if (isTagOnlySearch || hasMatchingTag) {
        item.classList.add('highlight');
    }

    // 검색어 하이라이트 함수
    const highlightText = (text, searchTerm) => {
        if (!text || !searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    };

    // 태그 HTML 생성
    let tagsHtml = '';
    if (post.tags && post.tags.length > 0) {
        tagsHtml = `<div class="result-tags">${post.tags.map(tag => {
            const isMatched = tag.toLowerCase().includes(searchTerm.toLowerCase());
            const highlightedTag = highlightText(tag, searchTerm);
            return `<span class="result-tag ${isMatched ? 'matched' : ''}">${highlightedTag}</span>`;
        }).join('')}</div>`;
    }

    // 제목과 내용 하이라이트 (태그 전용 검색이 아닐 때만)
    const highlightedTitle = isTagOnlySearch ? post.title : highlightText(post.title, searchTerm);
    const highlightedContent = isTagOnlySearch ? post.content : highlightText(post.content, searchTerm);

    // 날짜 포맷팅
    const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '날짜 없음';

    // 태그 전용 검색일 때 특별한 표시
    const searchTypeIndicator = isTagOnlySearch ?
        `<div style="color: #ff9800; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">🏷️ 태그 검색 결과</div>` : '';

    item.innerHTML = `
        ${searchTypeIndicator}
        <div class="result-title">${highlightedTitle}</div>
        <div class="result-category">${post.category || post.type || '기타'}</div>
        ${tagsHtml}
        <div class="result-content">${highlightedContent ? highlightedContent.substring(0, 100) : ''}${highlightedContent && highlightedContent.length > 100 ? '...' : ''}</div>
        <div class="result-date">작성일: ${dateStr}</div>
    `;

    // 클릭 시 상세 페이지로 이동
    item.addEventListener('click', () => {
        localStorage.setItem('selectedPost', JSON.stringify(post));
        if (post.type && ['축제', '공연', '관광', '테마파크'].includes(post.type)) {
            // 공공데이터는 tripInfo 페이지로
            window.location.href = '/tripInfo/tripInfo.html';
        } else {
            // 사용자 게시글은 community 상세 페이지로
            window.location.href = '/community/post_detail.html';
        }
    });

    return item;
}

function hideSearchResults() {
    searchResultsDiv.style.display = 'none';
    searchHistoryDiv.style.display = 'block';
    currentSearchTerm = '';
    searchResults = [];
}

if (searchInput) {
    // 실시간 검색
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.trim();
        if (searchTerm === '') {
            hideSearchResults();
        } else {
            performSearch(searchTerm);
        }
    });

    // 엔터 키 처리
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // 검색 기록에 추가
                addToSearchHistory(searchTerm);
                // 커뮤니티 페이지로 이동
                localStorage.setItem('lastSearch', searchTerm);
                window.location.href = '/community/community.html';
            }
        }
    });
}

if (searchBtn) {
    searchBtn.addEventListener('click', function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // 검색 기록에 태그로 추가
            addSearchTagToHistory(searchTerm);
            // 커뮤니티 페이지로 이동
            localStorage.setItem('lastSearch', searchTerm);
            window.location.href = '/community/community.html';
        }
    });
}

function addSearchTagToHistory(searchTerm) {
    // 중복 태그 제거
    const existingTags = document.querySelectorAll('.search-history-item');
    existingTags.forEach(tag => {
        if (tag.textContent.trim() === searchTerm) {
            tag.remove();
        }
    });

    // 새 태그 추가
    addSearchTag(searchTerm);
}

function addToSearchHistory(searchTerm) {
    // 검색 기록을 localStorage에 저장하는 로직 (선택사항)
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

    // 중복 제거
    searchHistory = searchHistory.filter(item => item !== searchTerm);

    // 맨 앞에 추가
    searchHistory.unshift(searchTerm);

    // 최대 10개만 저장
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// 동적으로 태그를 추가하는 함수 (필요시 사용)
function addSearchTag(tagText) {
    const searchHistory = document.querySelector('.search-history');
    if (!searchHistory) return;

    const newTag = document.createElement('div');
    newTag.className = 'search-history-item';
    newTag.style.cursor = 'pointer';
    newTag.innerHTML = `${tagText} <button class="remove-btn" title="삭제"><span class="material-icons">close</span></button>`;

    // 태그 클릭 이벤트
    newTag.addEventListener('click', function (e) {
        if (!e.target.closest('.remove-btn')) {
            const tagText = this.textContent.trim();
            console.log('새 태그 클릭:', tagText);

            if (searchInput) {
                searchInput.value = tagText;
                performSearch(tagText);
                searchInput.focus();
            }
        }
    });

    // X버튼 클릭 이벤트
    const removeBtn = newTag.querySelector('.remove-btn');
    removeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        newTag.remove();
    });

    // 맨 앞에 추가
    searchHistory.insertBefore(newTag, searchHistory.firstChild);

    // 최대 8개만 유지
    const allTags = searchHistory.querySelectorAll('.search-history-item');
    if (allTags.length > 8) {
        allTags[allTags.length - 1].remove();
    }
}

// 인기 태그를 검색 기록에 추가하는 함수
function loadPopularTags() {
    // 모든 게시물에서 태그 빈도 계산
    const tagFrequency = {};
    allPosts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        }
    });

    // 빈도순으로 정렬하여 상위 태그들 가져오기
    const popularTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => tag);

    console.log('인기 태그:', popularTags);

    // 기존 검색 기록이 비어있다면 인기 태그로 채우기
    const existingTags = document.querySelectorAll('.search-history-item');
    if (existingTags.length === 0) {
        popularTags.forEach(tag => {
            addSearchTag(tag);
        });
    }
}

// 페이지 진입 시 검색 input에 자동 포커스 및 데이터 초기화
window.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('searchInput');
    if (input) {
        input.focus();
        // placeholder에 태그 검색 방법 안내
        input.placeholder = '강진수국길축제 (태그만 검색: #축제)';
    }

    // 검색 데이터 초기화
    initializeSearchData();

    // 초기 태그 표시 (전체 필터 기준)
    setTimeout(() => {
        updateTagsForActiveFilters();
    }, 100);
});

// 활성화된 필터에 따라 태그 업데이트
function updateTagsForActiveFilters() {
    // 현재 활성화된 필터 가져오기
    const activeFilters = [...document.querySelectorAll('.filters button.active')]
        .filter(btn => btn.dataset.type !== '전체')
        .map(btn => btn.dataset.type);

    const allFiltersActive = document.querySelector('.filters button[data-type="전체"]').classList.contains('active');

    console.log('활성화된 필터:', activeFilters);

    // 전체가 비활성화되어 있거나 아무 필터도 선택되지 않은 경우
    if (!allFiltersActive && activeFilters.length === 0) {
        clearSearchHistory();
        return;
    }

    // 필터에 맞는 게시물들의 태그 수집
    let filteredPosts = [];

    if (allFiltersActive) {
        filteredPosts = allPosts;
    } else {
        filteredPosts = allPosts.filter(post => {
            if (activeFilters.includes('게시글') && (!post.type || post.type === 'user_post')) {
                return true;
            }
            if (activeFilters.includes(post.type) || activeFilters.includes(post.category)) {
                return true;
            }
            return false;
        });
    }

    // 필터된 게시물들에서 태그 빈도 계산
    const tagFrequency = {};
    filteredPosts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        }
    });

    // 빈도순으로 정렬하여 상위 태그들 가져오기
    const categoryTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tag, count]) => tag);

    console.log('필터별 인기 태그:', categoryTags);

    // 검색 기록 영역을 필터별 태그로 교체
    updateSearchHistoryWithCategoryTags(categoryTags, activeFilters);
}

// 검색 기록 영역 비우기
function clearSearchHistory() {
    const searchHistory = document.querySelector('.search-history');
    if (!searchHistory) return;

    searchHistory.innerHTML = `
        <div style="color: #999; text-align: center; padding: 20px; font-size: 0.9rem;">
            필터를 선택하면 관련 태그가 표시됩니다.
        </div>
    `;
}

// 검색 기록을 카테고리별 태그로 업데이트
function updateSearchHistoryWithCategoryTags(tags, activeFilters) {
    const searchHistory = document.querySelector('.search-history');
    if (!searchHistory) return;

    // 기존 태그들 제거
    searchHistory.innerHTML = '';

    // 새로운 태그들 추가
    tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'search-history-item';
        tagElement.style.cursor = 'pointer';

        // 필터 정보 표시
        const filterInfo = activeFilters.length > 0 ? ` (${activeFilters.join(', ')})` : '';
        tagElement.innerHTML = `${tag} <button class="remove-btn" title="삭제"><span class="material-icons">close</span></button>`;

        // 태그 클릭 이벤트
        tagElement.addEventListener('click', function (e) {
            if (!e.target.closest('.remove-btn')) {
                const tagText = tag; // 필터 정보 제외한 순수 태그명
                console.log('카테고리 태그 클릭:', tagText);

                if (searchInput) {
                    searchInput.value = tagText;
                    performSearch(tagText);
                    searchInput.focus();
                }
            }
        });

        // X버튼 클릭 이벤트
        const removeBtn = tagElement.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            tagElement.remove();
        });

        searchHistory.appendChild(tagElement);
    });

    // 태그가 없으면 안내 메시지
    if (tags.length === 0) {
        const noTagsMessage = document.createElement('div');
        noTagsMessage.style.cssText = 'color: #999; text-align: center; padding: 20px; font-size: 0.9rem;';
        noTagsMessage.textContent = '선택한 카테고리에 태그가 없습니다.';
        searchHistory.appendChild(noTagsMessage);
    }
}

// 필터 버튼을 더블 클릭하면 해당 카테고리로 즉시 검색
filterButtons.forEach(button => {
    let clickTimeout;

    button.addEventListener('dblclick', () => {
        const type = button.dataset.type;

        if (type !== '전체') {
            console.log('필터 더블클릭 검색:', type);

            // 검색창에 카테고리명 입력
            if (searchInput) {
                searchInput.value = type;
                performSearch(type);
                searchInput.focus();
            }
        }
    });
});