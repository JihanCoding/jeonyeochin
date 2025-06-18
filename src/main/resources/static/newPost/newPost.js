// 좌표가 localStorage에 있으면 input 등에 자동 입력(확장용)
let selectedCameraFile = null;
let selectedGalleryFiles = [];

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

  // 1) 수집
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
  formData.append("userId", JSON.parse(sessionStorage.getItem("user")).userId);
  formData.append(
    "postAuthor",
    JSON.parse(sessionStorage.getItem("user")).userNick
  );
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

  // 3) fetch 전송
  fetch("/api/post/create", {
    method: "POST",
    body: formData,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(res.statusText);
      const body = await res.json();
      alert("글 등록 성공! ID: " + body.id);
      window.location.replace("/index/index.html");
    })
    .catch((err) => {
      console.error(err);
      alert("글 등록 실패");
    });
});

document.addEventListener("DOMContentLoaded", function () {
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
cameraInput.onchange = function () {
  const file = cameraInput.files[0];
  if (!file) return;

  // 전역 변수에 저장
  selectedCameraFile = file;

  // 미리보기
  const reader = new FileReader();
  reader.onload = ev => {
    cameraBox.innerHTML = "";
    const img = document.createElement("img");
    img.src = ev.target.result;
    img.style.cssText = "width:100%;height:100%;object-fit:cover";
    cameraBox.appendChild(img);
  };
  reader.readAsDataURL(file);
};

// 2) 갤러리 onchange 한 번만 정의
galleryInput.onchange = function () {
  const files = Array.from(galleryInput.files)
    .slice(0, maxGalleryPhotos - selectedGalleryFiles.length);

  files.forEach(file => {
    // ① 전역 배열에 추가
    selectedGalleryFiles.push(file);

    // ② base64 미리보기 소스 저장 (galleryImages는 base64만 담는 배열)
    const reader = new FileReader();
    reader.onload = ev => {
      galleryImages.push(ev.target.result);
      renderGalleryImages();
    };
    reader.readAsDataURL(file);
  });
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

});
