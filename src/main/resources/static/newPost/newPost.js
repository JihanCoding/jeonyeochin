// 좌표가 localStorage에 있으면 input 등에 자동 입력(확장용)
function getSelectedCoords() {
    const coords = localStorage.getItem('selectedCoords');
    if (coords) {
        try {
            return JSON.parse(coords);
        } catch (e) { return null; }
    }
    return null;
}

// 선택된 태그 관리
let selectedTags = [];

function updateSelectedTagsDisplay() {
    const container = document.getElementById('selectedTags');
    
    if (selectedTags.length === 0) {
        container.innerHTML = '<span style="color: #888; font-size: 0.85rem;">입력된 태그가 여기에 표시됩니다</span>';
    } else {
        const tagHtml = selectedTags.map((tag, index) =>
            `<span class="tag-chip" data-index="${index}">${tag}</span>`
        ).join('');
        
        container.innerHTML = tagHtml;

        // 태그 클릭 시 삭제 기능
        container.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                const index = parseInt(this.dataset.index);
                selectedTags.splice(index, 1);
                updateSelectedTagsDisplay();
            });
        });
    }
}

function initializeTagInput() {
    const tagInput = document.getElementById('tagInput');

    tagInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTagsFromInput();
        }
    });

    tagInput.addEventListener('blur', function () {
        if (this.value.trim()) {
            addTagsFromInput();
        }
    });
}

function addTagsFromInput() {
    const tagInput = document.getElementById('tagInput');
    const inputValue = tagInput.value.trim();
    
    if (!inputValue) return;

    // 쉼표로 구분된 여러 태그 처리
    const newTags = inputValue.split(',').map(tag => tag.trim()).filter(tag => tag);

    newTags.forEach(tag => {
        // 중복 태그 방지 및 최대 개수 제한 (예: 10개)
        if (!selectedTags.includes(tag) && selectedTags.length < 10 && tag.length <= 20) {
            selectedTags.push(tag);
        }
    });
    
    tagInput.value = '';
    updateSelectedTagsDisplay();
}

document.querySelector('.submit-btn').addEventListener('click', function (e) {
    e.preventDefault();
    // 값 수집
    const coords = getSelectedCoords();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    // 카메라 이미지
    const cameraInput = document.getElementById('cameraInput');
    const cameraFile = cameraInput.files[0] || null;
    // 갤러리 이미지
    const galleryInput = document.getElementById('galleryInput');
    const galleryFiles = galleryInput.files;

    if (!coords || !title || !content) {
        alert('위치, 제목, 내용을 모두 입력해 주세요!');
        return;
    }

    // 임시: 이미지 파일을 base64로 변환해서 저장
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) return resolve(null);
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    Promise.all([
        fileToBase64(cameraFile),
        ...Array.from(galleryFiles).map(fileToBase64)
    ]).then(results => {
        const cameraImageBase64 = results[0];
        const galleryImagesBase64 = results.slice(1);
        // 기존 localStorage 글 목록 불러오기
        const posts = JSON.parse(localStorage.getItem('testPosts') || '[]'); posts.push({
            type: 'user_post', // 사용자 게시글 타입 추가
            lat: coords.lat,
            lng: coords.lng,
            title,
            content,
            category,
            cameraImage: cameraImageBase64,
            galleryImages: galleryImagesBase64,
            tags: selectedTags, // 선택된 태그 추가
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('testPosts', JSON.stringify(posts));
        alert(`글이 등록되었습니다! 선택된 태그: ${selectedTags.length > 0 ? selectedTags.join(', ') : '없음'}`);
        window.location.replace('/index/index.html');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // 태그 입력 기능 초기화
    initializeTagInput();

    const photoGrid = document.querySelector('.photo-grid');
    const cameraInput = document.getElementById('cameraInput');
    const galleryInput = document.getElementById('galleryInput');
    let maxGalleryPhotos = 10;
    let galleryImages = [];

    // photo-grid 초기화: 카메라 박스, + 박스만
    photoGrid.innerHTML = '';
    // 카메라 박스
    const cameraBox = document.createElement('div');
    cameraBox.className = 'photo-box';
    const cameraIcon = document.createElement('span');
    cameraIcon.className = 'material-icons';
    cameraIcon.textContent = 'photo_camera';
    cameraBox.appendChild(cameraIcon);
    cameraBox.addEventListener('click', function () {
        cameraInput.value = '';
        cameraInput.click();
    });
    photoGrid.appendChild(cameraBox);
    // + 박스
    const addBox = document.createElement('div');
    addBox.className = 'photo-box';
    const addIcon = document.createElement('span');
    addIcon.className = 'material-icons';
    addIcon.textContent = 'add';
    addBox.appendChild(addIcon);
    addBox.addEventListener('click', function () {
        if (galleryImages.length >= maxGalleryPhotos) return;
        galleryInput.value = '';
        galleryInput.click();
    });
    photoGrid.appendChild(addBox);

    // 카메라 input change
    cameraInput.onchange = function (e) {
        const file = cameraInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                cameraBox.innerHTML = '';
                const img = document.createElement('img');
                img.src = ev.target.result;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                cameraBox.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    };

    // 갤러리 input change
    galleryInput.onchange = function (e) {
        const files = Array.from(galleryInput.files).slice(0, maxGalleryPhotos - galleryImages.length);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function (ev) {
                if (galleryImages.length < maxGalleryPhotos) {
                    galleryImages.push(ev.target.result);
                    renderGalleryImages();
                }
            };
            reader.readAsDataURL(file);
        });
    };

    function renderGalleryImages() {
        // 기존 갤러리 이미지 박스 제거
        Array.from(photoGrid.querySelectorAll('.gallery-image-box')).forEach(el => el.remove());
        // + 박스 앞에 갤러리 이미지 박스 추가
        galleryImages.forEach((src, idx) => {
            const box = document.createElement('div');
            box.className = 'photo-box gallery-image-box';
            const img = document.createElement('img');
            img.src = src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            box.appendChild(img);
            // 삭제 기능(길게 누르기 등으로 확장 가능)
            box.addEventListener('click', function () {
                if (confirm('이 이미지를 삭제할까요?')) {
                    galleryImages.splice(idx, 1);
                    renderGalleryImages();
                }
            });
            photoGrid.insertBefore(box, addBox);
        });
    }
});
