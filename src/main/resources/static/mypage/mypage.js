// 로그인 유무
window.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(sessionStorage.getItem("user"));
  if (!userData) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login/login.html";
  }

  const profile = document.getElementById("profile-img-preview");
  profile.src = "/image/profile/" + userData.userProfile;

  loadUserPosts()
});

// 마이페이지 뒤로가기 버튼(index로 이동)
document.addEventListener("DOMContentLoaded", function () {
  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "/index/index.html";
    });
  }
});

// 세션에서 정보 불러오기

window.addEventListener("DOMContentLoaded", function () {
  const userEmail = document.getElementById("userEmail");
  const userNick = document.getElementById("userNick");

  const userData = JSON.parse(sessionStorage.getItem("user"));
  console.log(userData);
  userEmail.innerText = userData.userEmail;
  userNick.value = userData.userNick;
});

// 닉네임 입력 했을 때 닉네임 중복체크
let timer;
document.getElementById("userNick").addEventListener("input", function () {
  const userNick = document.getElementById("userNick");
  const checkM = document.getElementById("checkM");

  clearTimeout(timer);

  timer = setTimeout(async () => {
    const res = await fetch(
      `/api/user/check-nick?userNick=${encodeURIComponent(userNick.value)}`
    );
    const data = await res.json();

    if (data.result) {
      checkM.innerText = "사용중인 닉네임 입니다.";
      checkM.style.color = "red";
      userNick.style.borderColor = "red";
    } else {
      checkM.innerText = "사용가능한 닉네임 입니다.";
      checkM.style.color = "green";
      userNick.style.borderColor = "lightgreen";
    }
  }, 400);
});

// 닉네임 변경
const checkBtn = document.getElementById("edit-btn");
const userNick = document.getElementById("userNick");
checkBtn.addEventListener("click", async function () {
  if (userNick.borderColor === "lightgreen") {
    alert("닉네임 사용이 불가능합니다.");
    return;
  }
  const userData = JSON.parse(sessionStorage.getItem("user"));
  const res = await fetch("/api/user/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userData.userId,
      userNick: userNick.value,
    }),
  });
  const result = await res.json();

  if (result) {
    userData.userNick = userNick.value;
    sessionStorage.setItem("user", JSON.stringify(userData));
    alert("변경완료");
    window.location.href = "/myPage/myPage.html";
  } else {
    alert("실패");
  }
});

// 사용자가 작성한 게시물 조회
async function loadUserPosts() {
  const userData = JSON.parse(sessionStorage.getItem("user"));
  if (!userData) {
    window.location.href = "/login/login.html";
  }
  const userId = userData.userId;
  try {
    const res = await fetch(`/api/post/list/${userId}`);
    if (!res.ok) {
      throw new Error("서버 응답 오류");
    } else {
      const data = await res.json();

      console.log(data);
      if (data.result.length === 0) {
        const container = document.getElementsByClassName("posts-section")[0];
        container.innerHTML = `
          <div class="no-posts-center">
            <h3>작성한 게시글이 없습니다</h3>
            <p>첫 번째 게시글을 작성해보세요!</p>
            <button onclick="window.location.href='/newPost/newPost.html'"
                    style="margin-top: 16px; padding: 12px 24px; background: #2196f3; color: white; border: none; border-radius: 8px; cursor: pointer;">
              게시글 작성하기
            </button>
          </div>
        `;
      } else {
        const post = data.result;
        // -------------------------여기가 데이터 불러온 곳입니다  -----------------------------
        // html에 요소 만들고 가져와서 데이터 넣으셔유~
        const container = document.getElementsByClassName("posts-section")[0];
        post.forEach((post) => {
          const div = document.createElement("div");
          div.innerHTML = `<h3>${post.postTitle}</h3><p>${post.postContent}</p><p>${post.postCreatedAt}</p>
          <p>${post.postCategory}</p>`;
          container.appendChild(div);
          // 여기까지 뜨나 안뜨나 표시해둔거기 떄문에 변경하셔도 됩니다.
        });
      }
    }
  } catch (err) {
    console.error("에러:", err);
    alert("게시글을 불러오는 데 실패했습니다.");
  }
}
