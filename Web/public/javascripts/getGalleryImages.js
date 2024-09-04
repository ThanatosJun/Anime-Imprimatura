document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/api/getPersonalGallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: window.user_id }) // Ensure user_id is set correctly
      });
  
      if (response.ok) {
        const data = await response.json();
  
        if (data.message) {
          // Display a message if no images are found
          document.getElementById('gallery').innerHTML = `<p>${data.message}</p>`;
        } else {
          // Display CHD images
          const chdContainer = document.getElementById('chd-images');
          data.chdImages.forEach(image => {
            const img = document.createElement('img');
            img.src = image.path;
            img.alt = image.character;
            chdContainer.appendChild(img);
          });
  
          // Display CHS images
          const chsContainer = document.getElementById('chs-images');
          data.chsImages.forEach(image => {
            const img = document.createElement('img');
            img.src = image.path;
            img.alt = image.character;
            chsContainer.appendChild(img);
          });
        }
      } else {
        console.error('Failed to fetch gallery:', response.status, response.statusText);
        document.getElementById('gallery').innerHTML = '<p>Failed to load gallery.</p>';
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      document.getElementById('gallery').innerHTML = '<p>Error fetching gallery.</p>';
    }
  });