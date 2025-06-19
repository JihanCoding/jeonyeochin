// 좌표가 localStorage에 있으면 input 등에 자동 입력(확장용)
let selectedCameraFile = null;
let selectedGalleryFiles = [];

// 페이지 로드 시 초기화 함수
function initializePage() {
  console.log('페이지 초기화 중...');
  
  // 사용자 정보 확인
  const userData = sessionStorage.getItem("user");
  if (!userData) {
    console.warn('사용자 정보가 없습니다. 테스트용 사용자 정보를 생성합니다.');
    // 테스트용 사용자 정보 생성
    const testUser = {
      userId: 1,
      userNick: "테스트사용자",
      userEmail: "test@example.com"
    };
    sessionStorage.setItem("user", JSON.stringify(testUser));
    console.log('테스트 사용자 정보 생성:', testUser);
  } else {
    console.log('기존 사용자 정보:', JSON.parse(userData));
  }
  
  // 위치 정보 확인
  const coords = getSelectedCoords();
  if (coords) {
    console.log('저장된 위치 정보:', coords);
    document.getElementById("selected-coords").textContent = 
      `선택된 위치: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
  } else {
    console.log('위치 정보 없음 - 위치 선택이 필요합니다.');
  }
}

function getSelectedCoords() {
  const coords = localStorage.getItem("selectedCoords");
  if (coords) {
    try {
      return JSON.parse(coords);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// 선택된 태그 관리
let selectedTags = [];

function updateSelectedTagsDisplay() {
  const container = document.getElementById("selectedTags");

  if (selectedTags.length === 0) {
    container.innerHTML =
      '<span style="color: #888; font-size: 0.85rem;">입력된 태그가 여기에 표시됩니다</span>';
  } else {
    const tagHtml = selectedTags
      .map(
        (tag, index) =>
          `<span class="tag-chip" data-index="${index}">${tag}</span>`
      )
      .join("");

    container.innerHTML = tagHtml;

    // 태그 클릭 시 삭제 기능
    container.querySelectorAll(".tag-chip").forEach((chip) => {
      chip.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        selectedTags.splice(index, 1);
        updateSelectedTagsDisplay();
      });
    });
  }
}

function initializeTagInput() {
  const tagInput = document.getElementById("tagInput");

  tagInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTagsFromInput();
    }
  });

  tagInput.addEventListener("blur", function () {
    if (this.value.trim()) {
      addTagsFromInput();
    }
  });
}

function addTagsFromInput() {
  const tagInput = document.getElementById("tagInput");
  const inputValue = tagInput.value.trim();

  if (!inputValue) return;

  // 쉼표로 구분된 여러 태그 처리
  const newTags = inputValue
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  newTags.forEach((tag) => {
    // 중복 태그 방지 및 최대 개수 제한 (예: 10개)
    if (
      !selectedTags.includes(tag) &&
      selectedTags.length < 10 &&
      tag.length <= 20
    ) {
      selectedTags.push(tag);
    }
  });

  tagInput.value = "";
  updateSelectedTagsDisplay();
}

document.querySelector(".submit-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  
  console.log('게시글 등록 시작...');
  console.log('현재 위치:', window.location.href);
  
  // 1) 사용자 정보 확인
  const userData = sessionStorage.getItem("user");
  if (!userData) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login/login.html";
    return;
  }
  
  const user = JSON.parse(userData);
  if (!user.userId || !user.userNick) {
    alert("사용자 정보가 올바르지 않습니다. 다시 로그인해주세요.");
    window.location.href = "/login/login.html";
    return;
  }

  // 2) 수집
  const coordsRaw = localStorage.getItem("selectedCoords");
  if (!coordsRaw) return alert("위치를 선택해 주세요!");
  const coords = JSON.parse(coordsRaw);
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const category = document.getElementById("category").value;
  if (!title || !content) return alert("제목과 내용을 모두 입력해 주세요!");

  const galleryInput = document.getElementById("galleryInput");
  const cameraInput = document.getElementById("cameraInput");
  const files = galleryInput.files; // FileList
  const files2 = cameraInput.files; // FileList
  console.log(selectedGalleryFiles.length, "개 이미지 파일이 선택되었습니다.");

  const formData = new FormData();
  formData.append("userId", user.userId);
  formData.append("postAuthor", user.userNick);
  formData.append("postTitle", title);
  formData.append("postCategory", category);
  formData.append("postTag", JSON.stringify(selectedTags));
  formData.append("postContent", content);
  formData.append("postCreatedAt", new Date().toISOString());
  formData.append("postLatitude", coords.lat);
  formData.append("postLongitude", coords.lng);
  // 다중 이미지는 for문으로 각각 append
  for (let i = 0; i < selectedGalleryFiles.length; i++) {
    formData.append("postImage", selectedGalleryFiles[i]);
  }
  
  // 전체 요청 크기 계산 및 체크
  let totalSize = 0;
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      totalSize += pair[1].size;
    } else {
      totalSize += new Blob([pair[1]]).size;
    }
  }
  
  console.log('전체 요청 크기:', (totalSize / 1024 / 1024).toFixed(2) + 'MB');
  
  if (totalSize > 80 * 1024 * 1024) { // 80MB 초과시 경고
    alert('업로드할 데이터가 너무 큽니다. 이미지 개수를 줄이거나 더 작은 이미지를 사용해주세요.');
    return;
  }
  
  // FormData 내용 확인 (디버깅용)
  console.log('FormData 내용:');
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(pair[0] + ':', pair[1].name, '(' + (pair[1].size / 1024 / 1024).toFixed(2) + 'MB)');
    } else {
      console.log(pair[0] + ':', pair[1]);
    }
  }
  
  // 3) fetch 전송 - 동적 API URL 구성
  const apiUrl = `${window.location.protocol}//${window.location.hostname}:8090/api/post/create`;
  console.log('API URL:', apiUrl);
  
  fetch(apiUrl, {
    method: "POST",
    body: formData,
  })
    .then(async (res) => {
      console.log('응답 상태:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('서버 응답 오류:', errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const body = await res.json();
      console.log('성공 응답:', body);
      alert("글 등록 성공!");
      window.location.replace("/index/index.html");
    })    .catch((err) => {
      console.error('게시글 등록 오류:', err);
      
      // 네트워크 오류인지 확인
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        alert('네트워크 연결을 확인해주세요.\n서버에 연결할 수 없습니다.');
      } else if (err.message.includes('HTTP 413')) {
        alert('업로드할 파일이 너무 큽니다.\n이미지 개수를 줄이거나 더 작은 이미지를 사용해주세요.\n\n현재 최대 업로드 크기: 100MB');
      } else if (err.message.includes('HTTP 404')) {
        alert('서버 API를 찾을 수 없습니다.\n개발자에게 문의해주세요.');
      } else if (err.message.includes('HTTP 500')) {
        alert('서버 내부 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
      } else {
        alert(`글 등록 실패: ${err.message}\n\n문제가 계속되면 개발자에게 문의해주세요.`);
      }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  // 페이지 초기화
  initializePage();
  
  // 태그 입력 기능 초기화
  initializeTagInput();

  const photoGrid = document.querySelector(".photo-grid");
  const cameraInput = document.getElementById("cameraInput");
  const galleryInput = document.getElementById("galleryInput");
  let maxGalleryPhotos = 10;
  let galleryImages = [];

  // photo-grid 초기화: 카메라 박스, + 박스만
  photoGrid.innerHTML = "";
  // 카메라 박스
  const cameraBox = document.createElement("div");
  cameraBox.className = "photo-box";
  const cameraIcon = document.createElement("span");
  cameraIcon.className = "material-icons";
  cameraIcon.textContent = "photo_camera";
  cameraBox.appendChild(cameraIcon);
  cameraBox.addEventListener("click", function () {
    cameraInput.value = "";
    cameraInput.click();
  });
  photoGrid.appendChild(cameraBox);
  // + 박스
  const addBox = document.createElement("div");
  addBox.className = "photo-box";
  const addIcon = document.createElement("span");
  addIcon.className = "material-icons";
  addIcon.textContent = "add";
  addBox.appendChild(addIcon);
  addBox.addEventListener("click", function () {
    if (galleryImages.length >= maxGalleryPhotos) return;
    galleryInput.value = "";
    galleryInput.click();
  });
  photoGrid.appendChild(addBox);
  // 1) 카메라 onchange
  cameraInput.onchange = async function () {
    const file = cameraInput.files[0];
    if (!file) return;

    try {
      // 파일 크기 체크 및 압축
      console.log('원본 카메라 이미지 크기:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      if (file.size > 5 * 1024 * 1024) { // 5MB 이상인 경우 압축
        console.log('이미지 압축 중...');
        const compressedFile = await compressImage(file);
        selectedCameraFile = compressedFile;
        console.log('압축된 카메라 이미지 크기:', (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB');
      } else {
        selectedCameraFile = file;
      }

      // 미리보기
      const reader = new FileReader();
      reader.onload = ev => {
        cameraBox.innerHTML = "";
        const img = document.createElement("img");
        img.src = ev.target.result;
        img.style.cssText = "width:100%;height:100%;object-fit:cover";
        cameraBox.appendChild(img);
      };
      reader.readAsDataURL(selectedCameraFile);
    } catch (error) {
      console.error('카메라 이미지 처리 중 오류:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
    }
  };
  // 2) 갤러리 onchange 한 번만 정의
  galleryInput.onchange = async function () {
    const files = Array.from(galleryInput.files)
      .slice(0, maxGalleryPhotos - selectedGalleryFiles.length);

    for (const file of files) {
      try {
        console.log('원본 갤러리 이미지 크기:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
        
        let processedFile = file;
        if (file.size > 5 * 1024 * 1024) { // 5MB 이상인 경우 압축
          console.log('이미지 압축 중...');
          processedFile = await compressImage(file);
          console.log('압축된 갤러리 이미지 크기:', (processedFile.size / 1024 / 1024).toFixed(2) + 'MB');
        }
        
        // ① 전역 배열에 추가
        selectedGalleryFiles.push(processedFile);

        // ② base64 미리보기 소스 저장 (galleryImages는 base64만 담는 배열)
        const reader = new FileReader();
        reader.onload = ev => {
          galleryImages.push(ev.target.result);
          renderGalleryImages();
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error('갤러리 이미지 처리 중 오류:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 3) renderGalleryImages: galleryImages 기준으로 그리되,
  //    삭제 시 selectedGalleryFiles도 동기화해야 함
  function renderGalleryImages() {
    // 뷰 초기화
    Array.from(photoGrid.querySelectorAll(".gallery-image-box")).forEach(el => el.remove());

    galleryImages.forEach((src, idx) => {
      const box = document.createElement("div");
      box.className = "photo-box gallery-image-box";
      const img = document.createElement("img");
      img.src = src;
      img.style.cssText = "width:100%;height:100%;object-fit:cover";
      box.appendChild(img);

      box.addEventListener("click", () => {
        if (confirm("이 이미지를 삭제할까요?")) {
          // base64 배열과 파일 배열 모두에서 같은 인덱스를 제거
          galleryImages.splice(idx, 1);
          selectedGalleryFiles.splice(idx, 1);
          renderGalleryImages();
        }
      });

      photoGrid.insertBefore(box, addBox);
    });
  }

  // 페이지를 벗어날 때 선택한 위치 정보 삭제
  window.addEventListener('beforeunload', function () {
    localStorage.removeItem('selectedCoords');
  });

});

// 이미지 압축 함수
function compressImage(file, maxSizeMB = 5, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // 최대 해상도 설정 (가로/세로 중 큰 값이 1920px를 넘지 않도록)
      const maxDimension = 1920;
      let { width, height } = img;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);
      
      // Blob으로 변환 (압축 적용)
      canvas.toBlob((blob) => {
        // 압축 후에도 크기가 크면 품질을 더 낮춤
        if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
          compressImage(file, maxSizeMB, quality - 0.2).then(resolve);
        } else {
          // File 객체로 변환
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}
