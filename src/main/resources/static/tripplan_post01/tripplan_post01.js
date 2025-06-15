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

window.naverMapInit = function () {
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
}

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

// 네이버 클라우드 REST API 방식으로 주소 → 좌표 변환 (CORS Anywhere 프록시 사용)
async function geocodeAddress(address) {
    const apiKeyId = 'e696ij4ub6';
    const apiKey = 'VE4dq3vAamH8MibpCpjxskfG1l8MbSrUcJBk9Qzz';
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const url = corsProxy + `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
        headers: {
            'X-NCP-APIGW-API-KEY-ID': apiKeyId,
            'X-NCP-APIGW-API-KEY': apiKey,
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    if (data.status !== 'OK' || !data.addresses || !data.addresses[0]) {
        throw new Error(`주소를 찾을 수 없음: ${address}`);
    }
    return {
        lat: parseFloat(data.addresses[0].y),
        lng: parseFloat(data.addresses[0].x)
    };
}

// 네이버 클라우드 REST API 방식으로 좌표 → 주소 변환 (CORS Anywhere 프록시 사용)
async function reverseGeocode(lat, lng) {
    const apiKeyId = 'e696ij4ub6';
    const apiKey = 'VE4dq3vAamH8MibpCpjxskfG1l8MbSrUcJBk9Qzz';
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const url = corsProxy + `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&orders=roadaddr,addr&output=json`;
    const response = await fetch(url, {
        headers: {
            'X-NCP-APIGW-API-KEY-ID': apiKeyId,
            'X-NCP-APIGW-API-KEY': apiKey,
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    console.log('reverseGeocode 응답:', data);
    // status.code === 0, status.name === 'ok'이면 정상
    if (!data.status || data.status.code !== 0 || !data.results || !data.results.length) {
        throw new Error('역지오코딩 실패');
    }
    // results에서 type이 roadaddr 또는 addr인 결과를 우선적으로 사용
    const result = data.results.find(r => r.name === 'roadaddr') || data.results.find(r => r.name === 'addr') || data.results[0];
    const region = result.region;
    const land = result.land;
    let address = '';
    if (region) {
        address = [region.area1.name, region.area2.name, region.area3.name].filter(Boolean).join(' ');
    }
    if (land && land.number1) {
        address += ' ' + land.number1;
        if (land.number2) address += '-' + land.number2;
    }
    return address || '알 수 없는 위치';
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

// 모든 지점의 좌표를 구하는 함수 (start, end, waypoints)
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

// 경로 검색 및 최적화 함수
async function searchRoute() {
    const startPoint = document.getElementById('start-point').value;
    const endPoint = document.getElementById('end-point').value;
    const waypoints = Array.from(document.querySelectorAll('.waypoint-input-field'))
        .filter(input => input.style.display !== 'none' && input.value.trim())
        .map(input => input.value.trim());
    if (!startPoint || !endPoint) return alert('출발지와 도착지를 입력해주세요.');
    tempMarkers.forEach(marker => marker.setMap(null));
    tempMarkers = [];
    showLoading(true);
    try {
        const coordinates = await getCoordinatesForAllPoints(startPoint, endPoint, waypoints);
        // 경로 모드 선택값 읽기
        const mode = document.querySelector('input[name="routeMode"]:checked').value;
        // Directions API로 실제 경로 polyline 가져오기
        const polylineCoords = await getDirectionsRoute(coordinates, mode);
        displayRouteOnMapWithPolyline(coordinates, polylineCoords);
        displayRouteInfo(optimizedRouteFromPolyline(coordinates, polylineCoords));
    } catch (error) {
        alert('경로 검색 중 오류가 발생했습니다: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 네이버 Directions API로 실제 경로(도보/자차/대중교통) 가져오기
async function getDirectionsRoute(coordinates, mode) {
    const apiKeyId = 'e696ij4ub6';
    const apiKey = 'VE4dq3vAamH8MibpCpjxskfG1l8MbSrUcJBk9Qzz';
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const baseUrl5 = 'https://naveropenapi.apigw.ntruss.com/map-direction/v1/';
    const baseUrl15 = 'https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/';
    let start = `${coordinates[0].lng},${coordinates[0].lat}`;
    let goal = `${coordinates[coordinates.length - 1].lng},${coordinates[coordinates.length - 1].lat}`;
    let waypoints = coordinates.slice(1, -1).map(c => `${c.lng},${c.lat}`).join('|');
    let apiPath = '';
    if (mode === 'walking') apiPath = 'walking';
    else if (mode === 'driving') apiPath = 'driving';
    else if (mode === 'transit') apiPath = 'transit';
    let apiUrl5 = `${baseUrl5}${apiPath}?start=${start}&goal=${goal}`;
    let apiUrl15 = `${baseUrl15}${apiPath}?start=${start}&goal=${goal}`;
    if (waypoints) {
        apiUrl5 += `&waypoints=${waypoints}`;
        apiUrl15 += `&waypoints=${waypoints}`;
    }
    // Directions 5 먼저 시도, 실패(404 등)시 Directions 15로 재시도
    let data = null;
    let url = corsProxy + apiUrl5;
    let response = await fetch(url, {
        headers: {
            'X-NCP-APIGW-API-KEY-ID': apiKeyId,
            'X-NCP-APIGW-API-KEY': apiKey,
            'Accept': 'application/json'
        }
    });
    if (response.status === 404) {
        url = corsProxy + apiUrl15;
        response = await fetch(url, {
            headers: {
                'X-NCP-APIGW-API-KEY-ID': apiKeyId,
                'X-NCP-APIGW-API-KEY': apiKey,
                'Accept': 'application/json'
            }
        });
    }
    data = await response.json();
    console.log('Directions API 응답:', data);
    if (!data.route) throw new Error('경로 탐색 실패');
    let path = [];
    if (mode === 'walking' && data.route.trafast) {
        path = data.route.trafast[0].path;
    } else if (mode === 'driving' && data.route.trafast) {
        path = data.route.trafast[0].path;
    } else if (mode === 'transit' && data.route.subPath) {
        data.route.subPath.forEach(sp => {
            if (sp.path) path = path.concat(sp.path);
        });
    }
    return path.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
}

// polyline 좌표로 지도에 경로 표시 (마커+실제 경로)
function displayRouteOnMapWithPolyline(points, polylineCoords) {
    if (!currentMap) return;
    currentMarkers.forEach(marker => marker.setMap(null));
    currentMarkers = [];
    if (currentPath) { currentPath.setMap(null); currentPath = null; }
    if (window.routeDistanceOverlays) {
        window.routeDistanceOverlays.forEach(o => o.setMap(null));
    }
    window.routeDistanceOverlays = [];
    // 출발/경유/도착 마커
    points.forEach((point, index) => {
        const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(point.lat, point.lng),
            map: currentMap,
            title: point.name,
            icon: {
                content: `<div style="background: ${point.type === 'start' ? '#4CAF50' : point.type === 'end' ? '#F44336' : '#FF9800'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>` +
                    `<div style='margin-top:2px;font-size:11px;background:#fff;color:#333;padding:2px 6px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);white-space:nowrap;'>${point.name}</div>`,
                anchor: new naver.maps.Point(15, 35)
            }
        });
        currentMarkers.push(marker);
    });
    // 실제 경로 polyline
    currentPath = new naver.maps.Polyline({
        path: polylineCoords,
        strokeColor: '#2196F3',
        strokeWeight: 4,
        strokeOpacity: 0.8,
        map: currentMap
    });
    // 경로 구간별 거리 오버레이는 생략(실제 경로이므로)
    const bounds = new naver.maps.LatLngBounds();
    polylineCoords.forEach(coord => bounds.extend(coord));
    currentMap.fitBounds(bounds);
}

// polyline 경로로부터 구간별 거리 및 정보 생성(간단 버전)
function optimizedRouteFromPolyline(points, polylineCoords) {
    // 출발~도착 구간만 표시
    let totalDistance = 0;
    for (let i = 0; i < polylineCoords.length - 1; i++) {
        totalDistance += calculateDistance(
            polylineCoords[i].lat(), polylineCoords[i].lng(),
            polylineCoords[i + 1].lat(), polylineCoords[i + 1].lng()
        );
    }
    return [
        { name: `${points[0].name} → ${points[points.length - 1].name}`, distance: totalDistance }
    ];
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

async function saveTripInfoForNextPage() {
    const start = document.getElementById('start-point').value;
    const end = document.getElementById('end-point').value;
    const waypoints = Array.from(document.querySelectorAll('.waypoint-input-field'))
        .filter(input => input.style.display !== 'none' && input.value.trim() !== '')
        .map(input => input.value.trim());
    localStorage.setItem('trip_start', start);
    localStorage.setItem('trip_end', end);
    localStorage.setItem('trip_waypoints', JSON.stringify(waypoints));
    // 페이지 이동은 a 태그의 기본 동작 사용
}

// 기존 경로 검색 버튼 클릭 이벤트에 아래 함수 연결
// document.querySelector('.route-search-btn').onclick = searchRoute;