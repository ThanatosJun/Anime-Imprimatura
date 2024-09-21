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

        const galleryContainer = document.querySelector('.gallery-grid'); // 修改为 .gallery-grid
        galleryContainer.innerHTML = ''; // 清空容器

        if (data.images.length === 0) {
          galleryContainer.innerHTML = '<p>No images found.</p>';
        } else {
          data.images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item'; // 添加 gallery-item 类

            const imgBtnHolder = document.createElement('div');
            imgBtnHolder.className = 'img-btn-holder';

            const img = document.createElement('img');
            img.className = 'image'; // 添加 image 类
            img.src = `http://localhost:3000/images/${image._id}`; // 使用返回的 _id 生成图片的 URL
            img.alt = image.filename;
            img.setAttribute('id', image._id);

            // display file name
            const filename = document.createElement('p');
            filename.className = 'fileName';
            filename.textContent = `${image.filename}`;

            // Create a hidden <a> tag for downloading the file
            const link = document.createElement('a');
            link.className = 'download-link';
            link.textContent = 'Download';
            link.href = img.src;

            // Set the download attribute to name the downloaded file
            link.setAttribute('download', image.filename);

            const dele_btn = createDeleteBtn();

            galleryItem.appendChild(img);
            galleryItem.appendChild(filename);
            galleryItem.appendChild(imgBtnHolder);
            imgBtnHolder.appendChild(link);
            imgBtnHolder.appendChild(dele_btn);
            galleryContainer.appendChild(galleryItem);
          });
        }
      } else {
        console.error('Failed to fetch gallery:', response.status, response.statusText);
        document.querySelector('.gallery-grid').innerHTML = '<p>Failed to load gallery.</p>'; // 修改为 .gallery-grid
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      document.querySelector('.gallery-grid').innerHTML = '<p>Error fetching gallery.</p>'; // 修改为 .gallery-grid
    }
  });
});

function createDownloadBtn(image) {
  const downloadButton = document.createElement('a');
  downloadButton.classList.add('download-btn');
  downloadButton.textContent = 'Download';
  downloadButton.href = `http://localhost:3000/images/${image._id}`;
  downloadButton.setAttribute('download', image.filename);

  return downloadButton;
}

function createDeleteBtn() {
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-btn');
  deleteButton.onclick = function() { deleteImage(this); };

  const icon = document.createElement('i');
  icon.classList.add('fas', 'fa-trash-alt');

  const buttonText = document.createTextNode('Delete');
  deleteButton.appendChild(icon);
  deleteButton.appendChild(buttonText);

  return deleteButton;
}