window.onbeforeunload = null;

// 전역 변수들
let uploadedImages = []; // 업로드된 이미지 파일들을 저장하는 배열
let tags = []; // 태그들을 저장하는 배열

// 페이지 로드 완료 후 실행되는 초기화 함수
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners(); // 이벤트 리스너들을 초기화
    updateSubmitButton(); // 등록 버튼 상태를 업데이트
});

// 모든 이벤트 리스너를 초기화하는 함수
function initializeEventListeners() {
    // 이미지 업로드 이벤트 리스너 등록
    const cameraInput = document.getElementById('cameraInput');
    const galleryInput = document.getElementById('galleryInput');
    
    if (cameraInput) {
        cameraInput.addEventListener('change', handleImageUpload);
    }
    
    if (galleryInput) {
        galleryInput.addEventListener('change', handleImageUpload);
    }
    
    // 입력 필드 변경 시 등록 버튼 상태 업데이트
    const titleInput = document.getElementById('titleInput');
    const contentTextarea = document.getElementById('contentTextarea');
    
    if (titleInput) {
        titleInput.addEventListener('input', updateSubmitButton);
    }
    
    if (contentTextarea) {
        contentTextarea.addEventListener('input', updateSubmitButton);
    }
    
    // 태그 입력 이벤트 리스너 추가
    const tagInput = document.getElementById('tagInput');
    if (tagInput) {
        tagInput.addEventListener('keydown', handleTagInput);
    }
}

// 이미지 업로드를 처리하는 함수
function handleImageUpload(event) {
    const files = Array.from(event.target.files); // 선택된 파일들을 배열로 변환
    
    files.forEach(file => {
        // 이미지 파일인지 확인
        if (file.type.startsWith('image/')) {
            uploadedImages.push(file); // 업로드된 이미지 배열에 추가
            displayImagePreview(file); // 이미지 미리보기 표시
        } else {
            alert('이미지 파일만 업로드 가능합니다.');
        }
    });
    
    // 파일 입력 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
    event.target.value = '';
    
    console.log('현재 업로드된 이미지 수:', uploadedImages.length);
}

// 이미지 미리보기를 표시하는 함수
function displayImagePreview(file) {
    const previewContainer = document.getElementById('imagePreview');
    
    if (!previewContainer) {
        console.error('이미지 미리보기 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    // 이미지 아이템 컨테이너 생성
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    
    // 이미지 요소 생성
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file); // 파일을 URL로 변환하여 미리보기
    img.alt = '업로드된 이미지';
    
    // 삭제 버튼 생성
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = function() {
        removeImage(file, imageItem); // 이미지 삭제 함수 호출
    };
    
    // 요소들을 컨테이너에 추가
    imageItem.appendChild(img);
    imageItem.appendChild(removeBtn);
    previewContainer.appendChild(imageItem);
}

// 업로드된 이미지를 삭제하는 함수
function removeImage(file, imageElement) {
    // 업로드된 이미지 배열에서 해당 파일 제거
    const index = uploadedImages.indexOf(file);
    if (index > -1) {
        uploadedImages.splice(index, 1);
    }
    
    // DOM에서 이미지 요소 제거
    imageElement.remove();
    
    console.log('이미지 삭제됨. 남은 이미지 수:', uploadedImages.length);
}

// 태그 입력 처리 함수
function handleTagInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // 엔터키 또는 쉼표 입력 시 태그 추가
    if ((event.key === 'Enter' || event.key === ',') && value !== '') {
        event.preventDefault();
        
        // 쉼표로 입력한 경우 쉼표 제거
        const tagText = value.replace(/,/g, '').trim();
        
        if (tagText && !tags.includes(tagText)) {
            // 태그 배열에 추가
            tags.push(tagText);
            
            // 태그 UI에 추가
            addTagToUI(tagText);
            
            // 입력창 초기화
            input.value = '';
        }
    }
}

// 태그를 UI에 추가하는 함수
function addTagToUI(tagText) {
    const tagList = document.getElementById('tagList');
    if (!tagList) return;
    
    const tagItem = document.createElement('span');
    tagItem.className = 'tag-item';
    tagItem.textContent = tagText;
    
    // 태그 클릭 시 삭제 이벤트
    tagItem.addEventListener('click', function() {
        // 배열에서 제거
        const index = tags.indexOf(tagText);
        if (index !== -1) {
            tags.splice(index, 1);
        }
        
        // UI에서 제거
        tagItem.remove();
        
        console.log('태그 삭제됨:', tagText);
    });
    
    tagList.appendChild(tagItem);
    console.log('태그 추가됨:', tagText);
}

// 등록 버튼의 활성화/비활성화 상태를 업데이트하는 함수
function updateSubmitButton() {
    const titleInput = document.getElementById('titleInput');
    const contentTextarea = document.getElementById('contentTextarea');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!titleInput || !contentTextarea || !submitBtn) {
        console.error('필수 입력 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 제목과 내용이 모두 입력되었는지 확인
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();
    const isValid = title !== '' && content !== '';
    
    // 버튼 활성화/비활성화 설정
    submitBtn.disabled = !isValid;
    
    // 버튼 텍스트 색상 조정 (선택사항)
    if (isValid) {
        submitBtn.style.opacity = '1';
    } else {
        submitBtn.style.opacity = '0.6';
    }
}

// 게시글을 등록하는 함수
function submitPost() {
    const categorySelect = document.getElementById('categorySelect');
    const titleInput = document.getElementById('titleInput');
    const contentTextarea = document.getElementById('contentTextarea');
    const submitBtn = document.getElementById('submitBtn');
    
    // 필수 요소들이 존재하는지 확인
    if (!categorySelect || !titleInput || !contentTextarea || !submitBtn) {
        alert('폼 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 입력값 검증
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();
    
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }
    
    // 등록 중 상태로 변경
    submitBtn.disabled = true;
    submitBtn.textContent = '등록 중...';
    submitBtn.classList.add('loading');
    
    // 폼 데이터 수집
    const formData = collectFormData();
    
    // 서버로 데이터 전송 시뮬레이션
    setTimeout(() => {
        try {
            console.log('전송할 게시글 데이터:', formData);
            
            // 성공 메시지 표시
            alert('게시글이 성공적으로 등록되었습니다!');
            
            // 폼 초기화
            resetForm();
            
        } catch (error) {
            console.error('게시글 등록 실패:', error);
            alert('게시글 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            // 버튼 상태 복원
            submitBtn.disabled = false;
            submitBtn.textContent = '게시';
            submitBtn.classList.remove('loading');
            updateSubmitButton();
        }
    }, 1500); // 1.5초 후 완료 시뮬레이션
}

// 폼 데이터 수집 함수
function collectFormData() {
    const locationInput = document.getElementById('locationInput');
    const categorySelect = document.getElementById('categorySelect');
    const titleInput = document.getElementById('titleInput');
    const contentTextarea = document.getElementById('contentTextarea');
    
    return {
        location: locationInput ? locationInput.value.trim() : '',
        category: categorySelect ? categorySelect.value : 'question',
        title: titleInput ? titleInput.value.trim() : '',
        content: contentTextarea ? contentTextarea.value.trim() : '',
        images: uploadedImages,
        tags: tags, // 태그 데이터 추가
        timestamp: new Date().toISOString()
    };
}

// 폼을 초기화하는 함수
function resetForm() {
    const categorySelect = document.getElementById('categorySelect');
    const titleInput = document.getElementById('titleInput');
    const contentTextarea = document.getElementById('contentTextarea');
    const imagePreview = document.getElementById('imagePreview');
    const tagInput = document.getElementById('tagInput');
    const tagList = document.getElementById('tagList');
    
    // 입력 필드들 초기화
    if (categorySelect) categorySelect.value = 'question';
    if (titleInput) titleInput.value = '';
    if (contentTextarea) contentTextarea.value = '';
    if (tagInput) tagInput.value = '';
    
    // 업로드된 이미지들 초기화
    uploadedImages = [];
    if (imagePreview) imagePreview.innerHTML = '';
    
    // 태그 초기화
    tags = [];
    if (tagList) tagList.innerHTML = '';
    
    // 등록 버튼 상태 업데이트
    updateSubmitButton();
    
    console.log('폼이 초기화되었습니다.');
}

// 뒤로가기 함수
function goBack() {
    const titleInput = document.getElementById('titleInput');
    const contentTextarea = document.getElementById('contentTextarea');
    const tagInput = document.getElementById('tagInput');
    
    // 작성 중인 내용이 있는지 확인
    const hasContent = (titleInput && titleInput.value.trim() !== '') || 
                      (contentTextarea && contentTextarea.value.trim() !== '') ||
                      (tagInput && tagInput.value.trim() !== '') ||
                      uploadedImages.length > 0 ||
                      tags.length > 0;
    
    if (hasContent) {
        // 작성 중인 내용이 있으면 확인 메시지 표시
        if (confirm('작성 중인 내용이 사라집니다. 정말 나가시겠습니까?')) {
            window.history.back(); // 브라우저 뒤로가기
        }
    } else {
        // 작성 중인 내용이 없으면 바로 뒤로가기
        window.history.back();
    }
}

// 페이지를 벗어날 때 경고 표시 (작성 중인 내용이 있을 때)
window.addEventListener('beforeunload', function(event) {
    const titleInput = document.getElementById('titleInput');
    const contentTextarea = document.getElementById('contentTextarea');
    const tagInput = document.getElementById('tagInput');
    
    // 작성 중인 내용이 있는지 확인
    const hasContent = (titleInput && titleInput.value.trim() !== '') || 
                      (contentTextarea && contentTextarea.value.trim() !== '') ||
                      (tagInput && tagInput.value.trim() !== '') ||
                      uploadedImages.length > 0 ||
                      tags.length > 0;
    
    if (hasContent) {
        // 브라우저 기본 경고 메시지 표시
        event.preventDefault();
        event.returnValue = ''; // Chrome에서 필요
        return '작성 중인 내용이 사라집니다. 정말 나가시겠습니까?';
    }
});

// 에러 처리를 위한 전역 에러 핸들러
window.addEventListener('error', function(event) {
    console.error('JavaScript 에러 발생:', event.error);
});



function submitPost() {
    const location = "전남";
    const category = document.getElementById("categorySelect").value;
    const title = document.getElementById("titleInput").value;

    const tagElements = document.querySelectorAll(".tag-item");
    const tags = Array.from(tagElements)
        .map(el => el.textContent.trim())
        .join(",");

    const content = document.getElementById("contentTextarea").value;
    const userId = 1;

    const imageElements = document.querySelectorAll(".image-item");
    let selectedFile = null;

    if (imageElements.length > 0) {
        const fileInput = imageElements[0].dataset.file;
        if (fileInput) {
            selectedFile = fileInput; // 실제 File 객체면 이대로 쓰고,
        }
    }

    const cameraFiles = document.getElementById("cameraInput").files;
    const galleryFiles = document.getElementById("galleryInput").files;

    if (!selectedFile) {
        if (cameraFiles.length > 0) {
            selectedFile = cameraFiles[0];
        } else if (galleryFiles.length > 0) {
            selectedFile = galleryFiles[0];
        }
    }

    if (!category || category === "question") {
        alert("카테고리를 선택해주세요.");
        return;
    }
    if (!title.trim()) {
        alert("제목을 입력해주세요.");
        return;
    }
    if (!content.trim()) {
        alert("내용을 입력해주세요.");
        return;
    }

    const formData = new FormData();
    formData.append("location", location);
    formData.append("category", category);
    formData.append("title", title);
    formData.append("tags", tags);
    formData.append("content", content);
    formData.append("userId", userId);
    if (selectedFile instanceof File) {
        formData.append("image", selectedFile);
    }

    fetch("http://localhost:8090/post/with-image", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (response.ok) {
            alert("게시글이 등록되었습니다!");
            window.onbeforeunload = null;
            window.location.href = "/";
        } else {
            return response.text().then(text => {
                throw new Error(text || "등록 실패");
            });
        }
    })
    .catch(error => {
        console.error("에러 발생:", error);
        alert("오류가 발생했습니다: " + error.message);
    });
}

