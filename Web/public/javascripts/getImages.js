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

    // Fetch the image data from the '/image' route on the server
    fetch('/image') // 改成python回傳的路由
        .then(response => response.blob()) // Convert the response to a Blob object
        .then(blob => {
            // Create a new image element
            const img = document.createElement('img');

            // Create a URL for the Blob object and set it as the src attribute of the image
            img.src = URL.createObjectURL(blob);

            // Append the image element to the element with the ID 'detectResult'
            document.getElementById('detectResult').appendChild(img);
        })
        .catch(error => {
            // Log any errors that occur during the fetch or processing of the image
            console.error('Error fetching the image:', error);
        });
});
