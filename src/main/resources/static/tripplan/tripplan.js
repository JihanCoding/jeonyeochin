// --------------------------- tripplan_myplan 이동 ---------------------------
window.addEventListener('DOMContentLoaded', function () {
    // 마이플랜 리스트 클릭 시 내 플랜 페이지로 이동
    document.querySelectorAll('.myplan-list li').forEach(function (li) {
        li.style.cursor = 'pointer';
        li.addEventListener('click', function () {
            window.location.href = '../tripplan_myplan/tripplan_myplan.html';
        });
    });

    // --------------------------- 네이버 지도 ---------------------------
    // tripplan.html에 <div id="map"></div>가 있어야 동작
    const mapDiv = document.getElementById('map');
    let map, marker;
    if (mapDiv) {
        // 지도 생성: 기본값(서울) → 사용자 위치 허용 시 해당 위치로 중심 이동
        map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(37.5665, 126.9780), // 기본값(서울)
            zoom: 12
        });
        // 사용자 위치로 지도 중심 이동 (권한 허용 시)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;
                map.setCenter(new naver.maps.LatLng(userLat, userLng));
            });
        }
    }

    // --------------------------- 게시글(li) 클릭 시 좌표 마커 표시 ---------------------------
    document.querySelectorAll('.myplan-list li').forEach(function (li) {
        li.style.cursor = 'pointer';
        li.addEventListener('click', function () {
            // 좌표 데이터가 있으면 지도에 마커 표시
            const lat = li.getAttribute('data-lat');
            const lng = li.getAttribute('data-lng');
            if (lat && lng && map) {
                // 기존 마커 제거
                if (marker) marker.setMap(null);
                marker = new naver.maps.Marker({
                    position: new naver.maps.LatLng(parseFloat(lat), parseFloat(lng)),
                    map: map
                });
                map.setCenter(new naver.maps.LatLng(parseFloat(lat), parseFloat(lng)));
            } else {
                // 좌표 없으면 기존 동작(내 플랜 페이지 이동)
                window.location.href = '../tripplan_myplan/tripplan_myplan.html';
            }
        });
    });
});