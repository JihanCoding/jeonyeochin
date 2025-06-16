const emailInput = document.getElementById("useremail");
const nickInput = document.getElementById("usernick");
const passwordInput = document.getElementById("userpassword");
const confirmPasswordInput = document.getElementById("confirmpassword");
const nameInput = document.getElementById("username");
const birthInput = document.getElementById("userbirth");
const now = new Date().toISOString();
const agreeAll = document.getElementById("agreeAll");

let emailValid = false;
let nickValid = false;
let passwordMatch = false;

let timer;

emailInput.addEventListener("input", async () => {
  clearTimeout(timer);
timer = setTimeout(async () => {
  const email = emailInput.value;

  if (!email) return;

  const res = await fetch(
    `/api/user/check-email?userEmail=${encodeURIComponent(email)}`
  );
  const data = await res.json();

  emailValid = !data.result;

  emailInput.style.borderColor = emailValid ? "lightgreen" : "red";
},300);
});

nickInput.addEventListener("input", async () => {
    clearTimeout(timer);

    timer = setTimeout(async () => {
  const nick = nickInput.value;

  if (!nick) return;

  const res = await fetch(
    `/api/user/check-nick?userNick=${encodeURIComponent(nick)}`
  );
  const data = await res.json();

  nickValid = !data.result;

  nickInput.style.borderColor = nickValid ? "lightgreen" : "red";
  }, 300);
});

confirmPasswordInput.addEventListener("input", () => {
  passwordMatch = passwordInput.value === confirmPasswordInput.value;

  confirmPasswordInput.style.borderColor = passwordMatch ? "lightgreen" : "red";
  passwordInput.style.borderColor = passwordMatch ? "lightgreen" : "red";
});

async function registerUser() {
  if (!emailValid || !nickValid || !passwordMatch) {
    alert("다시 확인해주세요."); // 입력값 확인 메시지 바꾸세요
    return;
  }
  if (!agreeAll.checked) {
    alert("약관체크(문구 바꾸세요)"); // 약관 체크 메시지 바꾸세요
    return;
  }

  const userData = {
    userEmail: emailInput.value,
    userNick: nickInput.value,
    userPassword: passwordInput.value,
    userName: nameInput.value,
    userBirth: birthInput.value,
    userProfile: "default.png", // 기본 프로필 이미지 파일 만들어서 그 파일 이름으로 바꾸세요
    createdAt: new Date().toISOString(),
  };

  const res = await fetch("/api/user/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const result = await res.json();

  if (res.ok) {
    alert("회원가입 성공!");
    location.href = "/login/login.html";
  } else {
    alert(`회원가입 실패: ${result.error || "서버 오류"}`);
  }
}

document.getElementById("signup-btn").addEventListener("click", registerUser);

// ------------------혹시 다른 기능 넣으실거면 아래에------------------
