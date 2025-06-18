// 로그인 유무
window.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(sessionStorage.getItem("user"));
  if (!userData) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login/login.html";
  }

  const profile = document.getElementById("profile-img-preview");
  profile.src = "/image/profile/" + userData.userProfile;

  // 사용자 게시글 로드
  loadUserPosts();
});

// 사용자 작성 게시글 로드
function loadUserPosts() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user || !user.userId) {
    alert("로그인이 필요합니다.");
    return;
  }

  const userId = user.userId;

  fetch(`/api/post/list/${userId}`)
    .then(res => {
      if (!res.ok) throw new Error("서버 응답 오류");
      return res.json();
    })
    .then(data => {
      const posts = data.result;
      const container = document.getElementsByClassName("posts-section")[0];

      if (posts.length === 0) {
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
        posts.forEach(post => {
          const div = document.createElement("div");
          div.innerHTML = `<h3>${post.postTitle}</h3><p>${post.postContent}</p><p>${post.postCreatedAt}</p>`;
          container.appendChild(div);
        });
      }
    })
    .catch(err => {
      console.error("에러:", err);
      alert("게시글을 불러오는 데 실패했습니다.");
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


// 세션에서 정보 불러오기

window.addEventListener("DOMContentLoaded", function () {
  const userEmail = document.getElementById("userEmail");
  const userNick = document.getElementById("userNick");

  const userData = JSON.parse(sessionStorage.getItem("user"));
  console.log(userData);
  userEmail.innerText = userData.userEmail;
  userNick.value = userData.userNick

});

// 닉네임 입력 했을 때 닉네임 중복체크
let timer;
document.getElementById("userNick").addEventListener("input", function () {
  const userNick = document.getElementById("userNick");
  const checkM = document.getElementById('checkM');

  clearTimeout(timer);

  timer = setTimeout(async () => {
    const res = await fetch(`/api/user/check-nick?userNick=${encodeURIComponent(userNick.value)}`);
    const data = await res.json();

    if (data.result) {
      checkM.innerText = "사용중인 닉네임 입니다."
      checkM.style.color = "red";
      userNick.style.borderColor = "red";
    } else {
      checkM.innerText = "사용가능한 닉네임 입니다."
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
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: userData.userId,
      userNick: userNick.value
    })
  })
  const result = await res.json();

  if (result) {
    userData.userNick = userNick.value
    sessionStorage.setItem("user", JSON.stringify(userData));
    alert("변경완료");
    window.location.href = "/myPage/myPage.html";
  } else {
    alert("실패");
  }

});



// 프로필 변경

// const profileImg = document.getElementById("profile-img-input");
// const userData = JSON.parse(sessionStorage.getItem("user"));
// const userId = userData.userId;


// profileImg.addEventListener("change", async () => {
//   const file = profileImg.files[0];
//   if (!file) return;

//   const reder = new FileReader();
//   reder.onload = (e) => {
//     profileImg.src = e.target.result;
//   };
//   reder.readAsDataURL(file);

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("userId", userId);
//   try {
//     const res = await fetch("/api/user/updateProfile", {
//       method: "POST",
//       body: formData
//     });
//     const result = await res.json();

//     if (result.result) {
//       userData.userProfile = result.fileName;
//       sessionStorage.setItem("user", JSON.stringify(userData));
//     } else {
//       alert("업로드실패" + result.message);
//     }
//   } catch (err) {
//     console.error("업로드 중 에러 발생:", err);
//     alert("에러 발생!");
//   }
// });

