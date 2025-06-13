document.addEventListener('DOMContentLoaded', () => {
    const waypointsContainer = document.getElementById('waypoints-container');

    // 새로운 "경유지 추가" 항목을 생성하는 함수
    function createNewWaypointPlaceholder() {
        const newWaypointItem = document.createElement('div');
        newWaypointItem.classList.add('waypoint-item');
        newWaypointItem.innerHTML = `
            <span class="waypoint-action-icon add">+</span>
            <span class="waypoint-text-label">경유지 추가</span>
            <input type="text" class="waypoint-input-field" placeholder="경유지를 입력하세요" style="display: none;">
        `;
        return newWaypointItem;
    }

    waypointsContainer.addEventListener('click', function (event) {
        const target = event.target;

        // '+' 아이콘을 클릭했을 때
        if (target.classList.contains('waypoint-action-icon') && target.classList.contains('add')) {
            const currentWaypointItem = target.closest('.waypoint-item');
            if (!currentWaypointItem) return;

            const icon = currentWaypointItem.querySelector('.waypoint-action-icon');
            const textLabel = currentWaypointItem.querySelector('.waypoint-text-label');
            const inputField = currentWaypointItem.querySelector('.waypoint-input-field');

            // 현재 항목을 실제 경유지 입력 필드로 변경
            if (icon) {
                icon.textContent = '-';
                icon.classList.remove('add');
                icon.classList.add('remove');
                // 참고: '-' 아이콘 클릭 시 제거 기능을 추가하려면 여기에 이벤트 리스너를 추가할 수 있습니다.
                // 예: icon.onclick = () => currentWaypointItem.remove(); (단, 마지막 '+' 항목 유지 로직 필요)
            }
            if (textLabel) {
                textLabel.style.display = 'none';
            }
            if (inputField) {
                inputField.style.display = 'block';
                inputField.placeholder = `경유지 입력`; // 플레이스홀더 변경 (선택 사항)
                inputField.focus(); // 입력 필드에 포커스
            }

            // 새로운 "경유지 추가" 항목을 아래에 추가
            const newPlaceholder = createNewWaypointPlaceholder();
            waypointsContainer.appendChild(newPlaceholder);
        }
        // '-' 아이콘 클릭 시 (현재는 아무 동작 없음, 필요시 기능 추가)
        else if (target.classList.contains('waypoint-action-icon') && target.classList.contains('remove')) {
            // const waypointToRemove = target.closest('.waypoint-item');
            // if (waypointToRemove) {
            //   // 경유지 제거 로직 (예: waypointToRemove.remove();)
            //   // 주의: 모든 경유지가 제거되었을 때 '+' 항목이 하나는 남아있도록 하는 로직이 필요할 수 있습니다.
            //   console.log("'-' 아이콘 클릭됨. 제거 기능은 현재 구현되지 않았습니다.");
            // }
        }
    });
});