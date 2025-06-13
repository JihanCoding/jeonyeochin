// 뒤로가기 버튼 동작
const backBtn = document.getElementById('backButton');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        history.back();
    });
}
// 모바일 환경에서 입력창 포커스 시 스크롤 보정 (키보드에 가리지 않게)
function scrollToInput(e) {
    setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
}
document.querySelectorAll('.login-form input').forEach(input => {
    input.addEventListener('focus', scrollToInput);
});