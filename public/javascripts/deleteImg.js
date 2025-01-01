function deleteImage(buttonElement) {
    const galleryItem = buttonElement.closest('.gallery-item');
    const img = galleryItem.querySelector('img');
    const imageId = img.getAttribute('id');

    // Confirm deletion
    if (confirm('Are you sure you want to delete this image?')) {
    fetch('/api/delete_image', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            'image_id': imageId
        })
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