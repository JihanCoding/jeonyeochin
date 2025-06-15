// li 클릭 시 tripplan_myplan 페이지로 이동
window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.myplan-list li').forEach(function(li) {
        li.style.cursor = 'pointer';
        li.addEventListener('click', function() {
            window.location.href = '../tripplan_myplan/tripplan_myplan.html';
        });
    });
});