// 뒤로가기 버튼 동작
const backBtn = document.getElementById("backButton");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    history.back();
  });
}
// 모바일 환경에서 입력창 포커스 시 스크롤 보정 (키보드에 가리지 않게)
function scrollToInput(e) {
  setTimeout(() => {
    e.target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 200);
}
document.querySelectorAll(".login-form input").forEach((input) => {
  input.addEventListener("focus", scrollToInput);
});

// ---------------------------------------

async function login() {
  const email = document.getElementById("userId").value;
  const pw = document.getElementById("userPw").value;
  if (!email || !pw) {
    alert("이메일 or 비밀번호 안적혀있음"); // 수정하셔용
    return;
  }

  const loginData = {
    userEmail: email,
    userPassword: pw,
  };

  const res = await fetch("/api/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
    credentials: "include",
  });

  const result = await res.json();

  if (res.ok) {
    alert("로그인 성공");
    const userSession = {
        userId : result.result.userId,
        userName : result.result.userName,
        userNick : result.result.userNick,
        userProfile : result.result.userProfile,
        userEmail : result.result.userEmail
    }
    sessionStorage.setItem('user', JSON.stringify(userSession));
    window.location.replace("/index/index.html");
  } else {
    alert("로그인 실패: " + result.error || "오류");
  }
}
document.getElementById("login-btn").addEventListener("click", login);
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    login();
  }
});