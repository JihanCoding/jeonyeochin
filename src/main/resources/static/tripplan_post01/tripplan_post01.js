// 전역 변수 선언 (최상단에 위치)
let mapSelectionMode = null;
let currentWaypointInput = null;
let currentMap = null;
let tempMarkers = [];
let currentMarkers = [];
let currentPath = null;

// 상수 선언
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };
const ZOOM_LEVEL = 14;

document.addEventListener('DOMContentLoaded', function () {
    const startInput = document.getElementById('start-point');
    const endInput = document.getElementById('end-point');
    const waypointsContainer = document.getElementById('waypoints-container');

    // 경유지 버튼 클릭 핸들러
    waypointsContainer.addEventListener('click', function (e) {
        const btn = e.target;
        if (!btn.classList.contains('waypoint-action-icon')) return;
        const waypointItem = btn.closest('.waypoint-item');
        const textLabel = waypointItem.querySelector('.waypoint-text-label');
        const inputField = waypointItem.querySelector('.waypoint-input-field');
        if (btn.classList.contains('add')) {
            // + 버튼 클릭 - 현재 항목을 입력 모드로 변경
            btn.textContent = '-';
            btn.classList.replace('add', 'remove');
            textLabel.style.display = 'none';
            inputField.style.display = 'block';
            inputField.focus();

            // 새 경유지 추가 항목을 아래에 생성
            const newItem = createWaypointItem();
            waypointItem.parentNode.insertBefore(newItem, waypointItem.nextSibling);

        } else if (btn.classList.contains('remove')) {
            // - 버튼 클릭 - 항목 제거
            const waypointItems = waypointsContainer.querySelectorAll('.waypoint-item');

            // 최소 하나의 "경유지 추가" 버튼은 남겨둬야 함
            const addButtons = waypointsContainer.querySelectorAll('.waypoint-action-icon.add');
            if (waypointItems.length > 1 || addButtons.length > 0) {
                waypointItem.remove();
            } else {
                // 마지막 항목인 경우 다시 "경유지 추가" 상태로 변경
                btn.textContent = '+';
                btn.classList.replace('remove', 'add');
                textLabel.style.display = 'block';
                inputField.style.display = 'none';
                inputField.value = '';
            }
        }
    });

    // 경유지 입력 엔터 처리
    waypointsContainer.addEventListener('keypress', function (e) {
        if (e.target.classList.contains('waypoint-input-field') && e.key === 'Enter') {
            // 필요시 추가 로직
        }
    });

    // 입력 필드 포커스 시 지도 선택 모드
    startInput.addEventListener('focus', () => handleInputFocus('start', startInput));
    endInput.addEventListener('focus', () => handleInputFocus('end', endInput));
    waypointsContainer.addEventListener('focus', function (e) {
        if (e.target.classList.contains('waypoint-input-field')) {
            enableMapSelection('waypoint', e.target);
        }
    }, true);

    // ESC로 지도 선택 모드 취소
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mapSelectionMode) disableMapSelection();
    });

    // 입력값 변경 처리
    startInput.addEventListener('input', (e) => { });
    endInput.addEventListener('input', (e) => { });
    waypointsContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('waypoint-input-field')) { }
    });

    // 입력 필드 readonly 해제
    startInput.removeAttribute('readonly');
    endInput.removeAttribute('readonly');
    waypointsContainer.addEventListener('focusin', (e) => {
        if (e.target.classList.contains('waypoint-input-field')) {
            e.target.removeAttribute('readonly');
        }
    });
});

// Waypoint 아이템 생성 함수
function createWaypointItem() {
    const newItem = document.createElement('div');
    newItem.className = 'waypoint-item';
    newItem.innerHTML = `
        <span class="waypoint-action-icon add">+</span>
        <span class="waypoint-text-label">경유지 추가</span>
        <input type="text" class="waypoint-input-field" placeholder="경유지를 입력하세요" style="display: none;">
    `;
    return newItem;
}

// 입력 필드 포커스 핸들러
function handleInputFocus(mode, inputElement) {
    if (!currentMap) {
        alert('지도가 로드되지 않았습니다. 새로고침 후 다시 시도하세요.');
        return;
    }
    enableMapSelection(mode, inputElement);
}

// 지도 선택 모드 함수
function enableMapSelection(mode, inputElement = null) {
    mapSelectionMode = mode;
    currentWaypointInput = inputElement;

    // 모든 입력 필드의 선택 상태 초기화
    document.querySelectorAll('.map-selection-active').forEach(el => {
        el.classList.remove('map-selection-active');
    });

    // 현재 선택된 입력 필드 표시
    if (inputElement) {
        inputElement.classList.add('map-selection-active');
    } else {
        const targetInput = document.getElementById(mode + '-point');
        if (targetInput) targetInput.classList.add('map-selection-active');
    }

    // 지도 커서 변경 및 안내 메시지
    if (currentMap) {
        currentMap.getElement().style.cursor = 'crosshair';
    }

    showMapSelectionGuide(mode);
}
function disableMapSelection() {
    mapSelectionMode = null;
    currentWaypointInput = null;

    document.querySelectorAll('.map-selection-active').forEach(el => {
        el.classList.remove('map-selection-active');
    });

    if (currentMap) {
        currentMap.getElement().style.cursor = 'default';
    }

    hideMapSelectionGuide();
}
window.enableMapSelection = enableMapSelection;
window.disableMapSelection = disableMapSelection;

// 지도 초기화
function initMap(center) {
    currentMap = new naver.maps.Map('map', {
        center: center || new naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
        zoom: ZOOM_LEVEL,
        mapTypeControl: true
    });
    naver.maps.Event.addListener(currentMap, 'click', function (e) {
        handleMapClick(e.coord);
    });
}
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const currentLocation = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
            initMap(currentLocation);
        },
        function () { initMap(); }
    );
} else { initMap(); }

// 지도 클릭 처리
async function handleMapClick(coord) {
    if (!mapSelectionMode) return;
    try {
        // 좌표를 주소로 변환
        const address = await reverseGeocode(coord.lat(), coord.lng());

        // 선택 모드에 따라 해당 입력 필드에 주소 설정
        if (mapSelectionMode === 'start') {
            const startInput = document.getElementById('start-point');
            if (startInput) {
                startInput.value = address;
            }
        } else if (mapSelectionMode === 'end') {
            const endInput = document.getElementById('end-point');
            if (endInput) {
                endInput.value = address;
            }
        } else if (mapSelectionMode === 'waypoint' && currentWaypointInput) {
            currentWaypointInput.value = address;
        }

        // 임시 마커 추가
        addTemporaryMarker(coord, mapSelectionMode, address);

        // 지도 선택 모드 해제
        if (window.disableMapSelection) {
            window.disableMapSelection();
        } else {
            mapSelectionMode = null;
            currentWaypointInput = null;
            hideMapSelectionGuide();
        }

    } catch (error) {
        console.error('주소 변환 오류:', error);
        alert('해당 위치의 주소를 가져올 수 없습니다.');
    }
}

// 역지오코딩
function reverseGeocode(lat, lng) {
    return new Promise((resolve, reject) => {
        naver.maps.Service.reverseGeocode({
            coords: new naver.maps.LatLng(lat, lng),
            orders: [naver.maps.Service.OrderType.ADDR, naver.maps.Service.OrderType.ROAD_ADDR].join(',')
        }, function (status, response) {
            if (status !== naver.maps.Service.Status.OK) return reject(new Error('역지오코딩 실패'));
            const items = response.v2.results;
            let address = '';
            if (items[0]) {
                address = items[0].region.area1.name + ' ' + items[0].region.area2.name + ' ' + items[0].region.area3.name;
                if (items[0].land) {
                    address += ' ' + items[0].land.number1;
                    if (items[0].land.number2) address += '-' + items[0].land.number2;
                }
            }
            resolve(address || '알 수 없는 위치');
        });
    });
}

// 임시 마커 추가
function addTemporaryMarker(coord, type, address) {
    // 같은 타입의 기존 임시 마커 제거
    tempMarkers.forEach(marker => { if (marker.type === type) marker.setMap(null); });
    tempMarkers = tempMarkers.filter(marker => marker.type !== type);

    // 새 임시 마커 생성
    const markerColor = type === 'start' ? '#4CAF50' : type === 'end' ? '#F44336' : '#FF9800';
    const markerText = type === 'start' ? '출발' : type === 'end' ? '도착' : '경유';

    const tempMarker = new naver.maps.Marker({
        position: coord,
        map: currentMap,
        title: address,
        icon: {
            content: `<div style="background: ${markerColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${markerText}</div>`,
            anchor: new naver.maps.Point(20, 15)
        }
    });

    tempMarker.type = type;
    tempMarkers.push(tempMarker);
}

// 지도 선택 안내 메시지 표시
function showMapSelectionGuide(mode) {
    const modeText = mode === 'start' ? '출발지' : mode === 'end' ? '도착지' : '경유지';

    let guideEl = document.querySelector('.map-selection-guide');
    if (!guideEl) {
        guideEl = document.createElement('div');
        guideEl.className = 'map-selection-guide';
        guideEl.style.cssText = `
            position: fixed; 
            top: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            background: #2196F3; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: bold; 
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(guideEl);
    }

    guideEl.innerHTML = `📍 지도에서 ${modeText}를 클릭하세요 (ESC: 취소)`;
    guideEl.style.display = 'block';
}
function hideMapSelectionGuide() {
    const guideEl = document.querySelector('.map-selection-guide');
    if (guideEl) guideEl.style.display = 'none';
}

// 경로 검색 및 최적화 함수
async function searchRoute() {
    const startPoint = document.getElementById('start-point').value;
    const endPoint = document.getElementById('end-point').value;
    const waypoints = Array.from(document.querySelectorAll('.waypoint-input-field'))
        .filter(input => input.style.display !== 'none' && input.value.trim())
        .map(input => input.value.trim());

    if (!startPoint || !endPoint) return alert('출발지와 도착지를 입력해주세요.');

    // 임시 마커들 제거
    tempMarkers.forEach(marker => marker.setMap(null));
    tempMarkers = [];

    // 로딩 표시
    showLoading(true);

    try {
        // 1. 모든 장소의 좌표 구하기
        const coordinates = await getCoordinatesForAllPoints(startPoint, endPoint, waypoints);

        // 2. 최적 경로 계산
        const optimizedRoute = await findOptimizedRoute(coordinates);

        // 3. 지도에 경로 표시
        displayRouteOnMap(optimizedRoute);

        // 4. 경로 정보 표시
        displayRouteInfo(optimizedRoute);

    } catch (error) {
        alert('경로 검색 중 오류가 발생했습니다: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 모든 지점의 좌표를 구하는 함수
async function getCoordinatesForAllPoints(start, end, waypoints) {
    const allPoints = [start, ...waypoints, end];
    const coordinates = [];

    for (let i = 0; i < allPoints.length; i++) {
        const point = allPoints[i];
        try {
            const coord = await geocodeAddress(point);
            coordinates.push({
                name: point,
                lat: coord.lat,
                lng: coord.lng,
                type: i === 0 ? 'start' : i === allPoints.length - 1 ? 'end' : 'waypoint',
                originalIndex: i
            });
        } catch (error) {
            throw new Error(`"${point}" 위치를 찾을 수 없습니다.`);
        }
    }

    return coordinates;
}

// 주소를 좌표로 변환하는 함수 (네이버 지오코딩 API 사용)
function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        naver.maps.Service.geocode({ query: address }, function (status, response) {
            if (status !== naver.maps.Service.Status.OK) return reject(new Error(`주소 변환 실패: ${address}`));
            const result = response.v2.addresses[0];
            if (!result) return reject(new Error(`주소를 찾을 수 없음: ${address}`));
            resolve({ lat: parseFloat(result.y), lng: parseFloat(result.x) });
        });
    });
}

// 최적 경로 찾기 (Greedy)
async function findOptimizedRoute(coordinates) {
    if (coordinates.length <= 2) return coordinates;
    const startPoint = coordinates.find(c => c.type === 'start');
    const endPoint = coordinates.find(c => c.type === 'end');
    const waypoints = coordinates.filter(c => c.type === 'waypoint');
    if (waypoints.length === 0) return [startPoint, endPoint];
    const distanceMatrix = await calculateDistanceMatrix(coordinates);
    return findOptimalOrder(startPoint, endPoint, waypoints, distanceMatrix);
}

// 거리 매트릭스 계산
async function calculateDistanceMatrix(coordinates) {
    const matrix = {};
    for (let i = 0; i < coordinates.length; i++) {
        for (let j = 0; j < coordinates.length; j++) {
            if (i !== j) {
                const key = `${i}-${j}`;
                matrix[key] = calculateDistance(
                    coordinates[i].lat, coordinates[i].lng,
                    coordinates[j].lat, coordinates[j].lng
                );
            }
        }
    }
    return matrix;
}
// 두 지점 간 거리
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// 최적 순서 찾기 (Greedy)
function findOptimalOrder(startPoint, endPoint, waypoints, distanceMatrix) {
    if (waypoints.length === 0) return [startPoint, endPoint];
    const visited = new Set();
    const route = [startPoint];
    let currentPoint = startPoint;
    while (visited.size < waypoints.length) {
        let nearestPoint = null;
        let nearestDistance = Infinity;
        waypoints.forEach((waypoint, index) => {
            if (!visited.has(index)) {
                const distance = calculateDistance(
                    currentPoint.lat, currentPoint.lng,
                    waypoint.lat, waypoint.lng
                );
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestPoint = waypoint;
                }
            }
        });
        if (nearestPoint) {
            route.push(nearestPoint);
            visited.add(waypoints.indexOf(nearestPoint));
            currentPoint = nearestPoint;
        }
    }
    route.push(endPoint);
    return route;
}

// 지도에 경로 표시
function displayRouteOnMap(optimizedRoute) {
    if (!currentMap) return;
    currentMarkers.forEach(marker => marker.setMap(null));
    currentMarkers = [];
    if (currentPath) { currentPath.setMap(null); currentPath = null; }
    const pathCoords = [];
    optimizedRoute.forEach((point, index) => {
        const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(point.lat, point.lng),
            map: currentMap,
            title: point.name,
            icon: {
                content: `<div style="background: ${point.type === 'start' ? '#4CAF50' : point.type === 'end' ? '#F44336' : '#FF9800'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${index + 1}</div>`,
                anchor: new naver.maps.Point(15, 15)
            }
        });
        currentMarkers.push(marker);
        pathCoords.push(new naver.maps.LatLng(point.lat, point.lng));
    });
    currentPath = new naver.maps.Polyline({
        path: pathCoords,
        strokeColor: '#2196F3',
        strokeWeight: 4,
        strokeOpacity: 0.8,
        map: currentMap
    });
    const bounds = new naver.maps.LatLngBounds();
    pathCoords.forEach(coord => bounds.extend(coord));
    currentMap.fitBounds(bounds);
}

// 경로 정보 표시
function displayRouteInfo(optimizedRoute) {
    let totalDistance = 0;
    let routeInfo = '<div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">';
    routeInfo += '<h3>최적화된 경로</h3>';
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
        const distance = calculateDistance(
            optimizedRoute[i].lat, optimizedRoute[i].lng,
            optimizedRoute[i + 1].lat, optimizedRoute[i + 1].lng
        );
        totalDistance += distance;
        routeInfo += `<p>${i + 1}. ${optimizedRoute[i].name} → ${optimizedRoute[i + 1].name} (${distance.toFixed(1)}km)</p>`;
    }
    routeInfo += `<p><strong>총 거리: ${totalDistance.toFixed(1)}km</strong></p>`;
    routeInfo += '</div>';

    // 기존 경로 정보 제거 후 추가
    const existingInfo = document.querySelector('.route-info');
    if (existingInfo) existingInfo.remove();
    const routePlannerEl = document.getElementById('route-planner');
    if (routePlannerEl) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'route-info';
        infoDiv.innerHTML = routeInfo;
        routePlannerEl.appendChild(infoDiv);
    }
}

// 로딩 표시
function showLoading(show) {
    let loadingEl = document.querySelector('.loading');

    if (show) {
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.className = 'loading';
            loadingEl.innerHTML = '<p>최적 경로를 찾는 중...</p>';
            loadingEl.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 1000;';
            document.body.appendChild(loadingEl);
        }
    } else {
        if (loadingEl) loadingEl.remove();
    }
}