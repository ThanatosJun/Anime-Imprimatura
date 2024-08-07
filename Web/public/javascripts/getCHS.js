document.addEventListener('DOMContentLoaded', () => {
    // This function will be executed when the DOMContentLoaded event is triggered

    // Retrieve Base64 image data from localStorage
    const storedImage = JSON.parse(localStorage.getItem('chs'));

    // Check if there is image data stored in localStorage
    if (storedImage) {
        // Ensure the imageContainer exists
        const imageContainer = document.getElementById('chsContainer');

        // Display each Base64 image
        storedImage.forEach((storedImage, index) => {
            const img = document.createElement('img');
            img.src = storedImage;
            img.alt = `CHS`; // Alt text
            img.style.maxWidth = '100%'; // Optional: Limit the maximum width of the image
            imageContainer.appendChild(img);
        });

        // Clear the data in localStorage after displaying the images
        localStorage.removeItem('chs');
    } else {
            console.log('No images found in localStorage.');
        }
});
