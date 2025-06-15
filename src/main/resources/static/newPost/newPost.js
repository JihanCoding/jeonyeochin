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

    const formData = new FormData();
    formData.append('lat', coords.lat);
    formData.append('lng', coords.lng);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    if (cameraFile) {
        formData.append('cameraImage', cameraFile);
    }
    for (let i = 0; i < galleryFiles.length; i++) {
        formData.append('galleryImages', galleryFiles[i]);
    }

    fetch('/api/posts', {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (res.ok) {
            alert('글이 등록되었습니다!');
            window.location.href = '/index/index.html';
        } else {
            alert('등록 실패!');
        }
    })
    .catch(() => alert('서버 오류!'));
});

document.addEventListener('DOMContentLoaded', function () {
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
