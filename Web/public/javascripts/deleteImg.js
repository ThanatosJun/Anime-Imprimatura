function deleteImage(buttonElement) {
    const galleryItem = buttonElement.closest('.gallery-item');
    const img = galleryItem.querySelector('img');
    const imageId = img.getAttribute('id');

    // Confirm deletion
    if (confirm('Are you sure you want to delete this image?')) {
    fetch(`/delete-image/${imageId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            galleryItem.remove();
            console.log("(deleteImg.js) Image deleted");
        } else {
            alert("Fail to delete");
            console.error("(deleteImg.js) Failed to delete image");
        }
    })
    .catch(err => console.error(err));
    }
  }