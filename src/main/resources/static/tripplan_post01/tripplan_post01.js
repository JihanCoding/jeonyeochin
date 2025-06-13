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

    // waypoint 삭제 가능 여부 확인 함수
    function canRemoveWaypoint() {
        return waypointsContainer.querySelectorAll('.waypoint-item').length > 1;
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
        // '-' 아이콘 클릭 시 (제거 기능)
        else if (target.classList.contains('waypoint-action-icon') && target.classList.contains('remove')) {
            const waypointToRemove = target.closest('.waypoint-item');
            if (waypointToRemove && canRemoveWaypoint()) {
                waypointToRemove.remove();
            }
        }
    });

    // Geolocation API를 사용하여 사용자 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            // 사용자 위치를 성공적으로 가져왔을 때
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Naver Maps 초기화 (사용자 위치 중심으로)
            var map = new naver.maps.Map('map', {
                center: new naver.maps.LatLng(latitude, longitude),
                zoom: 12
            });
        }, function (error) {
            // 사용자 위치를 가져오는데 실패했을 때
            console.error('Geolocation error:', error);
            // 기본 위치 (서울)으로 Naver Maps 초기화
            var map = new naver.maps.Map('map', {
                center: new naver.maps.LatLng(37.5665, 126.9780),
                zoom: 12
            });
        });
    } else {
        // Geolocation API를 지원하지 않는 브라우저
        console.error('Geolocation is not supported by this browser.');
        // 기본 위치 (서울)으로 Naver Maps 초기화
        var map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(37.5665, 126.9780),
            zoom: 12
        });
    }
});