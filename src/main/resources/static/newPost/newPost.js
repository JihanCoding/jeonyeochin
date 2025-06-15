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

document.querySelector('.submit-btn').addEventListener('click', function () {
    const coords = getSelectedCoords();
    if (coords) {
        // 폼 데이터에 coords.lat, coords.lng 추가
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const photoGrid = document.querySelector('.photo-grid');
    let maxPhotos = 10;

    function createPhotoBox(previewUrl = null) {
        const box = document.createElement('div');
        box.className = 'photo-box';
        if (previewUrl) {
            const img = document.createElement('img');
            img.src = previewUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            box.appendChild(img);
        } else {
            const icon = document.createElement('span');
            icon.className = 'material-icons';
            icon.textContent = 'photo_camera';
            box.appendChild(icon);
        }
        // 카메라 박스 클릭 시 카메라만 실행
        box.addEventListener('click', function () {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment'; // 모바일 카메라 실행
            input.style.display = 'none';
            document.body.appendChild(input);
            input.click();
            input.onchange = function (e) {
                const file = input.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        box.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = ev.target.result;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        box.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
                document.body.removeChild(input);
            };
        });
        return box;
    }

    function createAddBox() {
        const box = document.createElement('div');
        box.className = 'photo-box';
        const icon = document.createElement('span');
        icon.className = 'material-icons';
        icon.textContent = 'add';
        box.appendChild(icon);
        // + 박스 클릭 시 갤러리에서 여러 장 선택
        box.addEventListener('click', function () {
            // 현재 비어있는(이미지가 없는) 박스들만 찾아서 그곳에만 이미지 할당
            const allBoxes = Array.from(photoGrid.querySelectorAll('.photo-box'));
            const emptyBoxes = allBoxes.filter(b => b.querySelector('img') === null && b !== box);
            if (emptyBoxes.length === 0) return;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.style.display = 'none';
            document.body.appendChild(input);
            input.click();
            input.onchange = function (e) {
                const files = Array.from(input.files);
                files.slice(0, emptyBoxes.length).forEach((file, idx) => {
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        const targetBox = emptyBoxes[idx];
                        if (targetBox) {
                            targetBox.innerHTML = '';
                            const img = document.createElement('img');
                            img.src = ev.target.result;
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.objectFit = 'cover';
                            targetBox.appendChild(img);
                        }
                    };
                    reader.readAsDataURL(file);
                });
                document.body.removeChild(input);
            };
        });
        return box;
    }

    // photo-grid 초기화 및 첫 카메라/플러스 박스 세팅
    photoGrid.innerHTML = '';
    photoGrid.appendChild(createPhotoBox());
    photoGrid.appendChild(createAddBox());
});
