// 로그인 유무
window.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(sessionStorage.getItem("user"));
  if (!userData) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login/login.html";
  }

  // 사용자 게시글 로드
  loadUserPosts();
});

// 사용자 작성 게시글 로드
function loadUserPosts() {
  const posts = JSON.parse(localStorage.getItem('testPosts') || '[]');
  const postsSection = document.querySelector('.posts-section');

  if (posts.length === 0) {
    postsSection.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #888;">
        <div style="font-size: 3rem; margin-bottom: 16px;">📝</div>
        <h3>작성한 게시글이 없습니다</h3>
        <p>첫 번째 게시글을 작성해보세요!</p>
        <button onclick="window.location.href='/newPost/newPost.html'" 
                style="margin-top: 16px; padding: 12px 24px; background: #6dd5ed; color: white; border: none; border-radius: 8px; cursor: pointer;">
          게시글 작성하기
        </button>
      </div>
    `;
    return;
  }

  // 월별로 그룹화
  const postsByMonth = groupPostsByMonth(posts);
  displayPostsByMonth(postsByMonth);
}

// 게시글을 월별로 그룹화
function groupPostsByMonth(posts) {
  const groups = {};

  posts.forEach(post => {
    const date = new Date(post.createdAt || Date.now());
    const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(post);
  });

  return groups;
}

// 월별 게시글 표시
function displayPostsByMonth(postsByMonth) {
  const postsSection = document.querySelector('.posts-section');

  const monthKeys = Object.keys(postsByMonth).sort((a, b) => {
    // 최신 월부터 표시
    const dateA = new Date(a.replace('년', '').replace('월', ''));
    const dateB = new Date(b.replace('년', '').replace('월', ''));
    return dateB - dateA;
  });

  const groupsHtml = monthKeys.map(month => {
    const monthPosts = postsByMonth[month];
    const postsHtml = monthPosts.reverse().map(post => createPostCard(post)).join('');

    return `
      <div class="posts-group">
        <div class="posts-group-header">
          ${month} 
          <span class="arrow material-icons" onclick="showAllPostsForMonth('${month}')">chevron_right</span>
        </div>
        <div class="posts-list horizontal-scroll">
          ${postsHtml}
        </div>
      </div>
    `;
  }).join('');

  postsSection.innerHTML = groupsHtml;
}

// 개별 게시글 카드 생성
function createPostCard(post) {
  // 이미지가 있는지 확인
  const hasImage = post.cameraImage || (post.galleryImages && post.galleryImages.length > 0);

  // 썸네일 영역 HTML (이미지가 있을 때만)
  let thumbnailHtml = '';
  if (hasImage) {
    let thumbnailStyle = 'background: #e0e0e0;';
    if (post.cameraImage) {
      thumbnailStyle = `background: url('${post.cameraImage}') center/cover;`;
    } else if (post.galleryImages && post.galleryImages.length > 0) {
      thumbnailStyle = `background: url('${post.galleryImages[0]}') center/cover;`;
    }
    thumbnailHtml = `<div class="post-thumb" style="${thumbnailStyle}"></div>`;
  }

  // 카테고리 표시
  const categoryPrefix = post.category ? `[${post.category}] ` : '';

  // 내용 요약 (30자 제한)
  const shortContent = post.content.length > 30
    ? post.content.substring(0, 30) + '...'
    : post.content;

  // 이미지가 없는 경우 no-image 클래스 추가
  const cardClass = hasImage ? 'post-card' : 'post-card no-image';

  return `
    <div class="${cardClass}" onclick="viewPostDetail('${encodeURIComponent(JSON.stringify(post))}')">
      ${thumbnailHtml}
      <div class="post-title">${categoryPrefix}${post.title}</div>
      <div class="post-desc">${shortContent}</div>
    </div>
  `;
}

// 게시글 상세보기
function viewPostDetail(encodedPost) {
  try {
    const post = JSON.parse(decodeURIComponent(encodedPost));
    localStorage.setItem('selectedPost', JSON.stringify(post));
    window.location.href = '/community/post_detail.html';
  } catch (error) {
    console.error('게시글 정보 오류:', error);
    alert('게시글을 불러올 수 없습니다.');
  }
}

// 특정 월의 모든 게시글 보기 (확장 기능)
function showAllPostsForMonth(month) {
  // 나중에 mypage_postgroup.html에서 구현 가능
  window.location.href = '/mypage_postgroup/mypage_postgroup.html';
}

// 프로필 사진 업로드 및 미리보기
const profileImgInput = document.getElementById("profile-img-input");
const profileImgPreview = document.getElementById("profile-img-preview");

function updateProfileImgUI() {
  const img = document.getElementById("profile-img-preview");
  const label = document.querySelector(".profile-img-label");
  if (!img.src || img.src.endsWith("/") || img.src === window.location.href) {
    label.classList.add("no-img");
    img.style.display = "none";
  } else {
    label.classList.remove("no-img");
    img.style.display = "block";
  }
}

if (profileImgInput && profileImgPreview) {
  profileImgInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        profileImgPreview.src = ev.target.result;
        updateProfileImgUI();
      };
      reader.readAsDataURL(file);
    }
  });
  // 페이지 로드시에도 체크
  updateProfileImgUI();
}

// 년월 옆 꺽쇠 클릭 시 mypage_postgroup.html로 이동
window.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll(".posts-group-header .arrow")
    .forEach(function (arrow) {
      arrow.style.cursor = "pointer";
      arrow.addEventListener("click", function (e) {
        window.location.href = "mypage_postgroup.html";
      });
    });
  // 데스크톱 가로 스크롤 드래그 지원
  enableHorizontalDragScroll(".posts-list.horizontal-scroll");
});

// 년월 그룹 헤더 클릭 시 해당 년월 정보와 함께 이동
window.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".posts-group-header").forEach(function (header) {
    header.style.cursor = "pointer";
    header.addEventListener("click", function (e) {
      // 텍스트에서 년, 월 추출 (예: '25년 6월')
      var text = header.textContent.trim();
      var match = text.match(/(\d+)년\s*(\d+)월/);
      if (match) {
        var year = match[1];
        var month = match[2];
        window.location.href =
          "/mypage_postgroup/mypage_postgroup.html?year=" +
          year +
          "&month=" +
          month;
      } else {
        window.location.href = "/mypage_postgroup/mypage_postgroup.html";
      }
    });
  });
  // 데스크톱 가로 스크롤 드래그 지원
  enableHorizontalDragScroll(".posts-list.horizontal-scroll");
});

// 데스크톱에서 게시글 가로 스크롤 마우스 드래그 지원
function enableHorizontalDragScroll(selector) {
  document.querySelectorAll(selector).forEach(function (list) {
    let isDown = false;
    let startX, scrollLeft;
    list.style.cursor = "grab";
    list.addEventListener("mousedown", function (e) {
      isDown = true;
      list.classList.add("dragging");
      startX = e.pageX - list.offsetLeft;
      scrollLeft = list.scrollLeft;
    });
    list.addEventListener("mouseleave", function () {
      isDown = false;
      list.classList.remove("dragging");
    });
    list.addEventListener("mouseup", function () {
      isDown = false;
      list.classList.remove("dragging");
    });
    list.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - list.offsetLeft;
      const walk = x - startX;
      list.scrollLeft = scrollLeft - walk;
    });
  });
}

// 마이페이지 뒤로가기 버튼(index로 이동)
document.addEventListener("DOMContentLoaded", function () {
  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "/index/index.html";
    });
  }
});

// 닉네임 중복 체크 함수 (서버 API 우선, 실패 시 로컬 체크)
async function checkNicknameDuplicate(nickname) {
  // 서버 API 사용 여부 설정 (개발 단계에서는 false로 설정)
  const useServerAPI = false; // 서버가 준비되지 않았으므로 false로 변경

  if (useServerAPI) {
    try {
      const response = await fetch("/api/user/check-nickname", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userNick: nickname
        })
      });

      console.log('중복 체크 응답 상태:', response.status);
      console.log('응답 URL:', response.url);

      if (response.ok) {
        const result = await response.json();
        console.log('서버 중복 체크 결과:', result);
        return result.isDuplicate;
      } else {
        console.warn('서버 API 응답 실패, 로컬 체크로 전환');
        return checkNicknameLocally(nickname);
      }
    } catch (error) {
      console.warn('서버 API 호출 실패, 로컬 체크로 전환:', error.message);
      return checkNicknameLocally(nickname);
    }
  } else {
    console.log('로컬 중복 체크 모드 사용');
    return checkNicknameLocally(nickname);
  }
}

// 로컬 중복 체크 (개발/테스트용)
function checkNicknameLocally(nickname) {
  // localStorage에서 기존 사용자들의 닉네임 목록 가져오기
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const existingNicknames = existingUsers.map(user => user.userNick?.toLowerCase());

  // 예약된 닉네임 목록
  const reservedNicknames = ['admin', 'test', 'user', '관리자', '테스트', '사용자', 'system', 'root'];

  // 현재 사용자의 기존 닉네임은 제외
  const currentUserNick = userData?.userNick?.toLowerCase();

  const isDuplicate = (
    reservedNicknames.includes(nickname.toLowerCase()) ||
    (existingNicknames.includes(nickname.toLowerCase()) && nickname.toLowerCase() !== currentUserNick)
  );

  console.log(`로컬 중복 체크 - 닉네임: ${nickname}, 중복 여부: ${isDuplicate}`);
  console.log('기존 닉네임들:', existingNicknames);
  console.log('현재 사용자 닉네임:', currentUserNick);

  return isDuplicate;
}

// 닉네임 변경
const editBtn = document.getElementById("edit-btn");
const userData = JSON.parse(sessionStorage.getItem("user"));
editBtn.addEventListener("click", async function () {
  const editNick = document.getElementById("userNick").value.trim();

  // 입력값 검증
  if (!editNick) {
    alert("닉네임을 입력해주세요.");
    return;
  }

  if (editNick === userData.userNick) {
    alert("기존 닉네임과 일치합니다.");
    return;
  }

  // 닉네임 길이 체크
  if (editNick.length < 2 || editNick.length > 10) {
    alert("닉네임은 2자 이상 10자 이하로 입력해주세요.");
    return;
  }

  // 특수문자 체크 (한글, 영문, 숫자만 허용)
  const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
  if (!nicknameRegex.test(editNick)) {
    alert("닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.");
    return;
  }

  // 중복 체크
  const isDuplicate = await checkNicknameDuplicate(editNick);
  if (isDuplicate) {
    alert("이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.");
    document.getElementById("userNick").focus();
    return;
  }
  // 닉네임 변경 요청
  try {
    // 서버 API 사용 여부 (개발 단계에서는 false로 설정)
    const useServerForUpdate = false;

    if (useServerForUpdate) {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.userId,
          userNick: editNick,
        })
      });

      console.log(userData.userId);
      console.log(editNick);

      if (response.ok) {
        userData.userNick = editNick;
        sessionStorage.setItem("user", JSON.stringify(userData));
        alert("닉네임이 변경되었습니다.");
      } else {
        alert("닉네임 변경에 실패했습니다. 다시 시도해주세요.");
      }
    } else {
      // 로컬 업데이트 (개발용)
      console.log('로컬 모드: 닉네임 변경');
      console.log('이전 닉네임:', userData.userNick);
      console.log('새 닉네임:', editNick);

      userData.userNick = editNick;
      sessionStorage.setItem("user", JSON.stringify(userData));

      // localStorage에 사용자 목록이 있다면 업데이트
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = registeredUsers.findIndex(user => user.userId === userData.userId);
      if (userIndex !== -1) {
        registeredUsers[userIndex].userNick = editNick;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }

      alert("닉네임이 변경되었습니다. (로컬 모드)");
    }
  } catch (error) {
    console.error('닉네임 변경 오류:', error);
    alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
  }
});

const userEmail = document.getElementById("userEmail");
const userNick = document.getElementById("userNick");
userEmail.innerText = userData.userEmail;
userNick.value = userData.userNick;

// 실시간 닉네임 중복 체크
const userNickInput = document.getElementById("userNick");
let checkTimeout;

userNickInput.addEventListener("input", function () {
  const nickname = this.value.trim();
  const checkMessage = document.getElementById("nickname-check-message");

  // 기존 메시지 제거
  if (checkMessage) {
    checkMessage.remove();
  }

  // 입력값이 없거나 기존 닉네임과 같으면 체크하지 않음
  if (!nickname || nickname === userData.userNick) {
    return;
  }

  // 이전 타이머 제거
  clearTimeout(checkTimeout);

  // 500ms 후에 중복 체크 실행 (타이핑 완료 후)
  checkTimeout = setTimeout(async () => {
    // 닉네임 형식 체크
    if (nickname.length < 2 || nickname.length > 10) {
      showNicknameMessage("닉네임은 2자 이상 10자 이하로 입력해주세요.", "error");
      return;
    }

    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (!nicknameRegex.test(nickname)) {
      showNicknameMessage("한글, 영문, 숫자만 사용할 수 있습니다.", "error");
      return;
    }

    // 중복 체크
    showNicknameMessage("중복 확인 중...", "checking");
    const isDuplicate = await checkNicknameDuplicate(nickname);

    if (isDuplicate) {
      showNicknameMessage("이미 사용 중인 닉네임입니다.", "error");
    } else {
      showNicknameMessage("사용 가능한 닉네임입니다.", "success");
    }
  }, 500);
});

// 닉네임 체크 메시지 표시 함수
function showNicknameMessage(message, type) {
  // 기존 메시지 제거
  const existingMessage = document.getElementById("nickname-check-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // 새 메시지 생성
  const messageDiv = document.createElement("div");
  messageDiv.id = "nickname-check-message";
  messageDiv.textContent = message;
  messageDiv.style.fontSize = "0.8rem";
  messageDiv.style.marginTop = "4px";

  // 타입별 색상 설정
  switch (type) {
    case "success":
      messageDiv.style.color = "#28a745";
      break;
    case "error":
      messageDiv.style.color = "#dc3545";
      break;
    case "checking":
      messageDiv.style.color = "#6c757d";
      break;
  }

  // 닉네임 입력창 아래에 메시지 추가
  const profileUsernameRow = document.querySelector(".profile-username-row");
  profileUsernameRow.parentNode.insertBefore(messageDiv, profileUsernameRow.nextSibling);
}
