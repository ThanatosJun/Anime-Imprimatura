document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('getUserCompleted', async () => {
    console.log('User ID in getGalleryImages:', window.user_id); // 验证 user_id 是否有值

    try {
      const user_id = window.user_id;
      const response = await fetch('http://localhost:3000/getPersonalGallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }) // 确保 user_id 已经设置好
      });

      if (response.ok) {
        const data = await response.json();

        if (data.images.length === 0) {
          document.querySelector('.gallery-grid').innerHTML = '<p>No images found.</p>';
        } else {
          const galleryContainer = document.querySelector('.gallery-grid');
          data.images.forEach(image => {
            const img = document.createElement('img');
            img.src = `http://localhost:3000/images/${image._id}`; // 使用返回的 _id 生成图片的 URL
            img.alt = image.filename;
            galleryContainer.appendChild(img);
          });
        }
      } else {
        console.error('Failed to fetch gallery:', response.status, response.statusText);
        document.querySelector('.gallery-grid').innerHTML = '<p>Failed to load gallery.</p>';
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      document.querySelector('.gallery-grid').innerHTML = '<p>Error fetching gallery.</p>';
    }
  });
});