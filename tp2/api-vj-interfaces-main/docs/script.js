// Make GET request to Games API
fetch('https://vj.interfaces.jima.com.ar/api')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Games API Response:', data);
  })
  .catch(error => {
    console.error('Error fetching games:', error);
  });

// Make GET request to Games API v2
fetch('https://vj.interfaces.jima.com.ar/api/v2')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Games API v2 Response:', data);
  })
  .catch(error => {
    console.error('Error fetching games v2:', error);
  });
