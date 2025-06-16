// ...existing code...

// 이 코드를:
fetch('https://proxy.cors.sh/https://maps.apigw.ntruss.com/map-geocode/v2/geocode?...')

// 이렇게 수정:
fetch(`http://localhost:8080/api/proxy?url=${encodeURIComponent('https://maps.apigw.ntruss.com/map-geocode/v2/geocode?...')}`)
  .then(res => res.json())
  .then(data => {
    // ...existing code...
  })
  .catch(error => console.error('Error:', error));

// ...existing code...