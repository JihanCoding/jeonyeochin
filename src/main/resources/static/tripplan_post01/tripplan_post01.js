// 네이버 지도 API가 완전히 로드된 후 실행되도록 콜백 함수로 전체 코드 감싸기
window.naverMapInit = function () {
    const waypointsContainer = document.getElementById('waypoints-container');
    const startInput = document.getElementById('start-point');
    const endInput = document.getElementById('end-point');
    const addWaypointBtnClass = 'waypoint-action-icon add';
    const removeWaypointBtnClass = 'waypoint-action-icon remove';

    // 새로운 "경유지 추가" 항목을 생성하는 함수
    const createNewWaypointPlaceholder = () => {
        const newWaypointItem = document.createElement('div');
        newWaypointItem.classList.add('waypoint-item');
        newWaypointItem.innerHTML = `
            <span class="${addWaypointBtnClass}">+</span>
            <span class="waypoint-text-label">경유지 추가</span>
            <input type="text" class="waypoint-input-field" placeholder="경유지를 입력하세요" style="display: none;">
        `;
        return newWaypointItem;
    };

    // waypoint 삭제 가능 여부 확인 함수
    const canRemoveWaypoint = () => waypointsContainer.querySelectorAll('.waypoint-item').length > 1;

    // 지도 초기화 함수 분리
    let map; // 지도 객체를 전역에서 접근 가능하게 변경
    let polyline; // 기존 경로가 있으면 지우기 위해

    const initMap = (center) => {
        if (!map) {
            map = new naver.maps.Map('map', {
                center: center || new naver.maps.LatLng(37.5665, 126.9780),
                zoom: 12
            });
        } else {
            map.setCenter(center || new naver.maps.LatLng(37.5665, 126.9780));
            map.setZoom(12);
        }
    };

    // Geolocation API를 사용하여 사용자 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => initMap(new naver.maps.LatLng(position.coords.latitude, position.coords.longitude)),
            (error) => {
                console.error('Geolocation error:', error);
                initMap();
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        initMap();
    }

    // 경로 그리기 버튼 추가
    const drawRouteBtn = document.createElement('button');
    drawRouteBtn.textContent = '경로 그리기';
    drawRouteBtn.style.marginTop = '20px';
    document.querySelector('.page-container').appendChild(drawRouteBtn);

    // 주소를 좌표로 변환하는 함수 (Promise)
    const geocodeAddress = (address) => {
        return new Promise((resolve, reject) => {
            naver.maps.Service.geocode(
                { query: address },
                (status, response) => {
                    if (status !== naver.maps.Service.Status.OK || !response.addresses.length) {
                        reject('주소 변환 실패: ' + address);
                    } else {
                        const item = response.addresses[0];
                        resolve(new naver.maps.LatLng(item.y, item.x));
                    }
                }
            );
        });
    };

    // 지도 클릭 시 주소 자동 입력 기능
    let inputMode = 'start'; // 'start', 'waypoint', 'end' 중 선택

    // 지도 위에 입력 모드 선택 버튼 추가
    const inputModeContainer = document.createElement('div');
    inputModeContainer.style.margin = '10px 0';
    inputModeContainer.innerHTML = `
        <button id="mode-start">출발지 선택</button>
        <button id="mode-waypoint">경유지 선택</button>
        <button id="mode-end">도착지 선택</button>
    `;
    document.querySelector('.page-container').insertBefore(inputModeContainer, document.getElementById('route-planner').nextSibling);

    document.getElementById('mode-start').onclick = () => (inputMode = 'start');
    document.getElementById('mode-waypoint').onclick = () => (inputMode = 'waypoint');
    document.getElementById('mode-end').onclick = () => (inputMode = 'end');

    // 지도 클릭 이벤트: 클릭한 위치의 주소를 해당 입력란에 자동 입력
    naver.maps.Event.addListener(map, 'click', (e) => {
        const latlng = e.coord;
        naver.maps.Service.reverseGeocode(
            { location: latlng, coordType: naver.maps.Service.CoordType.LAT_LNG },
            (status, response) => {
                if (status !== naver.maps.Service.Status.OK) {
                    alert('주소를 찾을 수 없습니다.');
                    return;
                }
                const address = response.result.items[0].address;
                if (inputMode === 'start') {
                    startInput.value = address;
                } else if (inputMode === 'end') {
                    endInput.value = address;
                } else if (inputMode === 'waypoint') {
                    let emptyInput = Array.from(document.querySelectorAll('.waypoint-input-field')).find((input) => input.value === '');
                    if (!emptyInput) {
                        const addBtn = document.querySelector(`.${addWaypointBtnClass}`);
                        if (addBtn) addBtn.click();
                        emptyInput = Array.from(document.querySelectorAll('.waypoint-input-field')).find((input) => input.value === '');
                    }
                    if (emptyInput) emptyInput.value = address;
                }
            }
        );
    });

    // 경로 그리기 버튼 클릭 이벤트
    drawRouteBtn.addEventListener('click', async () => {
        const start = startInput.value.trim();
        const end = endInput.value.trim();
        const waypointInputs = waypointsContainer.querySelectorAll('.waypoint-input-field');
        const waypoints = Array.from(waypointInputs)
            .map((input) => input.value.trim())
            .filter((val) => val.length > 0);

        if (!start || !end) {
            alert('출발지와 도착지를 모두 입력하세요.');
            return;
        }

        try {
            const startCoord = await geocodeAddress(start);
            const waypointCoords = [];
            for (const wp of waypoints) {
                waypointCoords.push(await geocodeAddress(wp));
            }
            const endCoord = await geocodeAddress(end);

            const route = [startCoord, ...waypointCoords, endCoord];

            if (polyline) {
                polyline.setMap(null);
            }
            map.setCenter(route[0]);
            polyline = new naver.maps.Polyline({
                map: map,
                path: route,
                strokeColor: '#007aff',
                strokeWeight: 5
            });
            route.forEach((latlng) => {
                new naver.maps.Marker({
                    position: latlng,
                    map: map
                });
            });
        } catch (err) {
            alert('경로를 그릴 수 없습니다: ' + err);
        }
    });
};