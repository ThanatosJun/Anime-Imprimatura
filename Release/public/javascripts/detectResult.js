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
            img.style.width = '150px';
            img.style.height = '200px';
            img.classList.add('responsive-image'); // Add class for styling
            imageContainer.appendChild(img);
        });

        // Clear the data in localStorage after displaying the images
        localStorage.removeItem('chs');
    } else {
            console.log('No images found in localStorage.');
    }

    const resultContainer = document.getElementById('detectResult');
    // Retrieve the path to the directory containing images from localStorage
    const CHS_save_dir = localStorage.getItem('CHS_save_dir');
    
    // Check if CHS_save_dir is available in localStorage
    if (CHS_save_dir) {
        // Fetch images from the server using the directory path
        fetch(`/readimages?path=${encodeURIComponent(CHS_save_dir)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok'); // Handle HTTP errors
                }
                return response.json(); // Convert the response to JSON
            })
            .then(data => {
                // Iterate through the list of image URLs and create image elements
                data.images.forEach(imgSrc => {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = 'Detect result';
                    img.style.width = '150px';
                    img.style.height = '200px';
                    img.classList.add('responsive-image'); // Add class for styling
                    resultContainer.appendChild(img); // Add the image element to the container
                });
            })
            .catch(error => {
                console.error('Error fetching images:', error); // Log any errors during the fetch process
            });
    } else {
        console.error('CHS_save_dir not found in localStorage.'); // Log an error if CHS_save_dir is not found in localStorage
    }
})