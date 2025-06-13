// 입력 지우기 버튼 동작
window.addEventListener('DOMContentLoaded', function() {
    const input = document.querySelector('.editname-input');
    const clearBtn = document.querySelector('.editname-clear-btn');
    if (input && clearBtn) {
        clearBtn.addEventListener('click', function() {
            input.value = '';
            input.focus();
        });
        // 입력 클릭/포커스 시 value값 삭제
        input.addEventListener('focus', function() {
            input.value = '';
        });
    }
});
