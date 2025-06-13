// 네이버 지도 API가 완전히 로드된 후 실행되도록 콜백 함수로 전체 코드 감싸기
window.naverMapInit = function () {
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

    let map; // 지도 객체를 전역에서 접근 가능하게 변경 (중복 선언 금지)
    let polyline; // 기존 경로가 있으면 지우기 위해

    // 지도 초기화 함수 분리
    function initMap(center) {
        if (!map) {
            map = new naver.maps.Map('map', {
                center: center || new naver.maps.LatLng(37.5665, 126.9780),
                zoom: 12
            });
        } else {
            map.setCenter(center || new naver.maps.LatLng(37.5665, 126.9780));
            map.setZoom(12);
        }
    }
    let naver = map;
    // Geolocation API를 사용하여 사용자 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            initMap(new naver.maps.LatLng(position.coords.latitude, position.coords.longitude));
        }, function (error) {
            console.error('Geolocation error:', error);
            initMap();
        });
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
    function geocodeAddress(address) {
        return new Promise((resolve, reject) => {
            naver.maps.Service.geocode({
                query: address
            }, function (status, response) {
                if (status !== naver.maps.Service.Status.OK || !response.addresses.length) {
                    reject('주소 변환 실패: ' + address);
                } else {
                    const item = response.addresses[0];
                    resolve(new naver.maps.LatLng(item.y, item.x));
                }
            });
        });
    }

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

    document.getElementById('mode-start').onclick = () => inputMode = 'start';
    document.getElementById('mode-waypoint').onclick = () => inputMode = 'waypoint';
    document.getElementById('mode-end').onclick = () => inputMode = 'end';

    // 지도 클릭 이벤트: 클릭한 위치의 주소를 해당 입력란에 자동 입력
    naver.maps.Event.addListener(map, 'click', function (e) {
        const latlng = e.coord;
        naver.maps.Service.reverseGeocode({
            location: latlng,
            coordType: naver.maps.Service.CoordType.LAT_LNG
        }, function (status, response) {
            if (status !== naver.maps.Service.Status.OK) {
                alert('주소를 찾을 수 없습니다.');
                return;
            }
            const address = response.result.items[0].address;
            if (inputMode === 'start') {
                document.getElementById('start-point').value = address;
            } else if (inputMode === 'end') {
                document.getElementById('end-point').value = address;
            } else if (inputMode === 'waypoint') {
                // 가장 먼저 보이는 빈 경유지 입력란에 입력, 없으면 새로 추가
                let emptyInput = Array.from(document.querySelectorAll('.waypoint-input-field')).find(input => input.value === '');
                if (!emptyInput) {
                    // + 버튼 클릭해서 새 경유지 입력란 생성
                    const addBtn = document.querySelector('.waypoint-action-icon.add');
                    if (addBtn) addBtn.click();
                    emptyInput = Array.from(document.querySelectorAll('.waypoint-input-field')).find(input => input.value === '');
                }
                if (emptyInput) emptyInput.value = address;
            }
        });
    });

    // 네이버 Directions API를 활용한 최적 경로(자동 추천 경로) 예시 함수
    // 실제 사용 시 clientId, clientSecret을 본인 값으로 변경 필요
    async function getOptimizedRouteByNaverAPI(startCoord, waypointCoords, endCoord) {
        const clientId = 'e696ij4ub6'; // 네이버 클라우드 플랫폼에서 발급
        const clientSecret = 'HzNmnYcW3w9qeHlkD3d1mI4sgD412WE5qls733hS'; // 네이버 클라우드 플랫폼에서 발급
        // 출발, 경유, 도착 좌표를 문자열로 변환
        const startStr = `${startCoord.lng},${startCoord.lat}`;
        const goalStr = `${endCoord.lng},${endCoord.lat}`;
        const waypointsStr = waypointCoords.map(c => `${c.lng},${c.lat}`).join('|');

        // 네이버 Directions REST API 엔드포인트
        const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${startStr}&goal=${goalStr}` + (waypointsStr ? `&waypoints=${waypointsStr}` : '') + `&option=trafast`;

        // 실제 요청 예시 (CORS 문제로 서버 프록시 필요할 수 있음)
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-NCP-APIGW-API-KEY-ID': clientId,
                'X-NCP-APIGW-API-KEY': clientSecret
            }
        });
        const data = await response.json();
        // 경로 좌표 추출
        const route = data.route.trafast[0].path.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
        return route;
    }

    // 경로 그리기 버튼 클릭 이벤트 (최적 경로 예시 적용)
    drawRouteBtn.addEventListener('click', async function () {
        const start = document.getElementById('start-point').value.trim();
        const end = document.getElementById('end-point').value.trim();
        const waypointInputs = waypointsContainer.querySelectorAll('.waypoint-input-field');
        const waypoints = Array.from(waypointInputs)
            .map(input => input.value.trim())
            .filter(val => val.length > 0);

        if (!start || !end) {
            alert('출발지와 도착지를 모두 입력하세요.');
            return;
        }

        try {
            // 출발지, 경유지, 도착지 모두 좌표로 변환
            const startCoord = await geocodeAddress(start);
            const waypointCoords = [];
            for (const wp of waypoints) {
                waypointCoords.push(await geocodeAddress(wp));
            }
            const endCoord = await geocodeAddress(end);

            // 네이버 Directions API로 최적 경로 요청 (예시)
            // 실제 사용 시 CORS 우회 필요할 수 있음
            // const route = await getOptimizedRouteByNaverAPI(startCoord, waypointCoords, endCoord);
            // 예시: 그냥 입력 순서대로 Polyline 그리기 (실제 API 사용 시 위 코드 주석 해제)
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
    // tripplan_post01.js

    // 네이버 지도 초기화 함수 (콜백)
    function naverMapInit() {
        // 지도 옵션 설정
        var mapOptions = {
            center: new naver.maps.LatLng(37.5665, 126.9780), // 서울 중심 좌표
            zoom: 10,
            mapTypeControl: true
        };

        // 지도 생성
        var map = new naver.maps.Map('map', mapOptions);

        console.log('네이버 지도가 성공적으로 초기화되었습니다.');
    }

    // 경유지 추가 기능
    document.addEventListener('DOMContentLoaded', function () {
        const waypointsContainer = document.getElementById('waypoints-container');

        // 경유지 추가 버튼 클릭 이벤트
        waypointsContainer.addEventListener('click', function (e) {
            if (e.target.classList.contains('add')) {
                addWaypoint(e.target.parentElement);
            } else if (e.target.classList.contains('remove')) {
                removeWaypoint(e.target.parentElement);
            }
        });

        // 경유지 추가 함수
        function addWaypoint(clickedItem) {
            const waypointInput = clickedItem.querySelector('.waypoint-input-field');
            const waypointLabel = clickedItem.querySelector('.waypoint-text-label');
            const actionIcon = clickedItem.querySelector('.waypoint-action-icon');

            // 입력 필드 표시, 라벨 숨김
            waypointInput.style.display = 'block';
            waypointLabel.style.display = 'none';

            // 아이콘을 제거 버튼으로 변경
            actionIcon.textContent = '-';
            actionIcon.classList.remove('add');
            actionIcon.classList.add('remove');

            // 새로운 "경유지 추가" 항목 생성
            const newWaypointItem = document.createElement('div');
            newWaypointItem.className = 'waypoint-item';
            newWaypointItem.innerHTML = `
            <span class="waypoint-action-icon add">+</span>
            <span class="waypoint-text-label">경유지 추가</span>
            <input type="text" class="waypoint-input-field" placeholder="경유지를 입력하세요" style="display: none;">
        `;

            // 새 항목을 도착지 앞에 삽입
            waypointsContainer.appendChild(newWaypointItem);

            // 새로 추가된 입력 필드에 포커스
            waypointInput.focus();
        }

        // 경유지 제거 함수
        function removeWaypoint(waypointItem) {
            waypointItem.remove();
        }
    });

    // 입력 필드 포커스 아웃 시 유효성 검사
    document.addEventListener('focusout', function (e) {
        if (e.target.classList.contains('waypoint-input-field')) {
            const input = e.target;
            const waypointItem = input.parentElement;

            // 입력값이 비어있으면 해당 경유지 항목 제거
            if (input.value.trim() === '') {
                waypointItem.remove();
            }
        }
    });

    // 전역 스코프에 콜백 함수 등록 (네이버 지도 API에서 호출할 수 있도록)
    window.naverMapInit = naverMapInit;
};