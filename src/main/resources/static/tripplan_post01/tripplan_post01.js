/*
 * [Spring Boot용 네이버 지도 API 프록시 샘플]
 *
 * @RestController
 * public class NaverMapProxyController {
 *     @GetMapping("/api/naver-reversegeocode")
 *     public ResponseEntity<String> reverseGeocode(@RequestParam double lat, @RequestParam double lng) {
 *         String apiUrl = "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=" + lng + "," + lat + "&orders=roadaddr,addr&output=json";
 *         HttpHeaders headers = new HttpHeaders();
 *         headers.set("X-NCP-APIGW-API-KEY-ID", "e696ij4ub6");
 *         headers.set("X-NCP-APIGW-API-KEY", "VE4dq3vAamH8MibpCpjxskfG1l8MbSrUcJBk9Qzz");
 *         HttpEntity<String> entity = new HttpEntity<>(headers);
 *         RestTemplate restTemplate = new RestTemplate();
 *         ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);
 *         return response;
 *     }
 * }
 *
 * // 프론트엔드에서는 아래처럼 호출
 * // fetch(`/api/naver-reversegeocode?lat=${lat}&lng=${lng}`)
 */

// 전역 변수 및 상수 선언
let mapSelectionMode = null;
let currentWaypointInput = null;
let currentMap = null;
let tempMarkers = [];
let currentMarkers = [];
let currentPath = null;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };
const ZOOM_LEVEL = 14;

window.naverMapInit = function () {
    const startInput = document.getElementById('start-point');
    const endInput = document.getElementById('end-point');
    const waypointsContainer = document.getElementById('waypoints-container');
    const overlay = document.getElementById('route-planner-overlay');

    // 입력란 클릭 시 오버레이 숨김
    function hideOverlay() { overlay.style.display = 'none'; }
    function showOverlay() { overlay.style.display = 'block'; }

    startInput.addEventListener('focus', hideOverlay);
    endInput.addEventListener('focus', hideOverlay);
    waypointsContainer.addEventListener('focusin', function(e) {
        if (e.target.classList.contains('waypoint-input-field')) hideOverlay();
    });
    // blur/focusout에서 showOverlay 제거

    // 경유지 버튼 클릭 핸들러
    waypointsContainer.addEventListener('click', onWaypointButtonClick);
    // 경유지 입력 엔터 처리(추후 확장 가능)
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

    // 경로 모드 아이콘 클릭 시 선택
    document.querySelectorAll('.routeMode').forEach(function(label) {
        label.addEventListener('click', function() {
            document.querySelectorAll('.routeMode').forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');
            // radio value 동기화
            const input = label.querySelector('input[type="radio"]');
            if (input) input.checked = true;
        });
    });
    // 최초 selected 적용
    const checked = document.querySelector('.routeMode input[type="radio"]:checked');
    if (checked) checked.closest('.routeMode').classList.add('selected');
};

function onWaypointButtonClick(e) {
    const btn = e.target;
    // 텍스트 클릭 시 옆의 + 또는 - 버튼을 대신 클릭
    if (btn.classList.contains('waypoint-text-label')) {
        const iconBtn = btn.parentNode.querySelector('.waypoint-action-icon');
        if (iconBtn) iconBtn.click();
        return;
    }
    if (!btn.classList.contains('waypoint-action-icon')) return;
    const waypointItem = btn.closest('.waypoint-item');
    const textLabel = waypointItem.querySelector('.waypoint-text-label');
    const inputField = waypointItem.querySelector('.waypoint-input-field');
    const waypointsContainer = waypointItem.parentNode;
    if (btn.classList.contains('add')) {
        // + 버튼 클릭 - 현재 항목을 입력 모드로 변경
        btn.textContent = '-';
        btn.classList.replace('add', 'remove');
        textLabel.style.display = 'none';
        inputField.style.display = 'block';
        inputField.focus();

        // 새 경유지 추가 항목을 아래에 생성
        waypointsContainer.insertBefore(createWaypointItem(), waypointItem.nextSibling);

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
}

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

function handleInputFocus(mode, inputElement) {
    if (!currentMap) {
        alert('지도가 로드되지 않았습니다. 새로고침 후 다시 시도하세요.');
        return;
    }
    enableMapSelection(mode, inputElement);
}

function enableMapSelection(mode, inputElement = null) {
    mapSelectionMode = mode;
    currentWaypointInput = inputElement;
    document.querySelectorAll('.map-selection-active').forEach(el => el.classList.remove('map-selection-active'));
    if (inputElement) {
        inputElement.classList.add('map-selection-active');
    } else {
        const targetInput = document.getElementById(mode + '-point');
        if (targetInput) targetInput.classList.add('map-selection-active');
    }
    if (currentMap) currentMap.getElement().style.cursor = 'crosshair';
    showMapSelectionGuide(mode);
}
function disableMapSelection() {
    mapSelectionMode = null;
    currentWaypointInput = null;
    document.querySelectorAll('.map-selection-active').forEach(el => el.classList.remove('map-selection-active'));
    if (currentMap) currentMap.getElement().style.cursor = 'default';
    hideMapSelectionGuide();
}
window.enableMapSelection = enableMapSelection;
window.disableMapSelection = disableMapSelection;

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
        } else if (mapSelectionMode === 'waypoint') {
            if (currentWaypointInput) {
                currentWaypointInput.value = address;
            }
        }
        // 지도 클릭 시 오버레이 다시 표시
        const overlay = document.getElementById('route-planner-overlay');
        if (overlay) overlay.style.display = 'block';
        disableMapSelection();
    } catch (e) {
        alert('주소 변환에 실패했습니다.');
    }
}

// 네이버 클라우드 REST API 방식으로 주소 → 좌표 변환
async function geocodeAddress(address) {
    const apiUrl = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
    const url = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
    const response = await fetch(url, {
        headers: {
            'X-NCP-APIGW-API-KEY-ID': 'e696ij4ub6',
            'X-NCP-APIGW-API-KEY': "VE4dq3vAamH8MibpCpjxskfG1l8MbSrUcJBk9Qzz",
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

// 네이버 클라우드 REST API 방식으로 좌표 → 주소 변환
async function reverseGeocode(lat, lng) {
    // Spring Boot 프록시 엔드포인트로 직접 요청 (CORS 문제 없음)
    const url = `/api/naver-reversegeocode?lat=${lat}&lng=${lng}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('서버 프록시 오류');
    const data = await response.json();
    if (!data.status || data.status.code !== 0 || !data.results || !data.results.length) {
        throw new Error('역지오코딩 실패');
    }
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

// 임시 마커 추가 (중복 제거)
function addTemporaryMarker(coord, type, address) {
    tempMarkers.forEach(marker => { if (marker.type === type) marker.setMap(null); });
    tempMarkers = tempMarkers.filter(marker => marker.type !== type);
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

// 지도 선택 안내 메시지 표시/숨김 (중복 제거)
function showMapSelectionGuide(mode) {
    const modeText = mode === 'start' ? '출발지' : mode === 'end' ? '도착지' : '경유지';
    let guideEl = document.querySelector('.map-selection-guide');
    if (!guideEl) {
        guideEl = document.createElement('div');
        guideEl.className = 'map-selection-guide';
        document.body.appendChild(guideEl);
    }
    guideEl.innerHTML = `지도에서 ${modeText}를 클릭하세요.`;
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
        const mode = document.querySelector('input[name="routeMode"]:checked').value;
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
    const baseUrl5 = 'https://naveropenapi.apigw.ntruss.com/map-direction/v1/';
    const baseUrl15 = 'https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/';
    let start = `${coordinates[0].lng},${coordinates[0].lat}`;
    let goal = `${coordinates[coordinates.length - 1].lng},${coordinates[coordinates.length - 1].lat}`;
    let waypoints = coordinates.slice(1, -1).map(c => `${c.lng},${c.lat}`).join('|');
    let apiPath = mode;
    let apiUrl5 = `${baseUrl5}${apiPath}?start=${start}&goal=${goal}`;
    let apiUrl15 = `${baseUrl15}${apiPath}?start=${start}&goal=${goal}`;
    if (waypoints) {
        apiUrl5 += `&waypoints=${waypoints}`;
        apiUrl15 += `&waypoints=${waypoints}`;
    }
    let data = null;
    let url = `/api/proxy?url=${encodeURIComponent(apiUrl5)}`;
    let response = await fetch(url, {
        headers: {
            'X-NCP-APIGW-API-KEY-ID': 'e696ij4ub6',
            'X-NCP-APIGW-API-KEY': 'VE4dq3vAamH8MibpCpjxskfG1l8MbSrUcJBk9Qzz',
            'Accept': 'application/json'
        }
    });
    if (response.status === 404) {
        url = `/api/proxy?url=${encodeURIComponent(apiUrl15)}`;
        response = await fetch(url, {
            headers: {
                'X-NCP-APIGW-API-KEY-ID': 'e696ij4ub6',
                'X-NCP-APIGW-API-KEY': 'VE4dq3vAamH8MibpCpjxskfG1l8MbSrUcJBk9Qzz',
                'Accept': 'application/json'
            }
        });
    }
    data = await response.json();
    if (!data.route) throw new Error('경로 탐색 실패');
    let path = [];
    if ((mode === 'walking' || mode === 'driving') && data.route.trafast) {
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
    currentPath = new naver.maps.Polyline({
        path: polylineCoords,
        strokeColor: '#2196F3',
        strokeWeight: 4,
        strokeOpacity: 0.8,
        map: currentMap
    });
    const bounds = new naver.maps.LatLngBounds();
    polylineCoords.forEach(coord => bounds.extend(coord));
    currentMap.fitBounds(bounds);
}

// polyline 경로로부터 구간별 거리 및 정보 생성(간단 버전)
function optimizedRouteFromPolyline(points, polylineCoords) {
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

// 경로 정보 표시 함수 (간단 예시)
function displayRouteInfo(routeInfoArr) {
    // routeInfoArr: [{ name, distance }]
    let infoBox = document.getElementById('route-info-box');
    if (!infoBox) {
        infoBox = document.createElement('div');
        infoBox.id = 'route-info-box';
        infoBox.style.cssText = 'margin:16px 0;padding:12px;background:#f5f5f5;border-radius:8px;font-size:15px;';
        document.body.appendChild(infoBox);
    }
    infoBox.innerHTML = routeInfoArr.map(r => `<b>${r.name}</b><br>총 거리: ${(r.distance / 1000).toFixed(2)} km`).join('<hr>');
}

// 기존 경로 검색 버튼 클릭 이벤트에 아래 함수 연결
// document.querySelector('.route-search-btn').onclick = searchRoute;