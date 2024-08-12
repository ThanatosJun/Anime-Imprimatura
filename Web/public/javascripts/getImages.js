document.addEventListener('DOMContentLoaded', () => {
    // This function will be executed when the DOMContentLoaded event is triggered

    const resultContainer = document.getElementById('detectResult');
    // Retrieve the path to the directory containing images from localStorage
    const CHS_save_dir = localStorage.getItem('CHS_save_dir');
    
    // Check if CHS_save_dir is available in localStorage
    if (CHS_save_dir) {
        // Fetch images from the server using the directory path
        fetch(`/images?path=${encodeURIComponent(CHS_save_dir)}`)
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
                    resultContainer.appendChild(img); // Add the image element to the container
                });

                // Clear the directory path from localStorage after displaying images
                localStorage.removeItem('CHS_save_dir');
            })
            .catch(error => {
                console.error('Error fetching images:', error); // Log any errors during the fetch process
            });
    } else {
        console.error('CHS_save_dir not found in localStorage.'); // Log an error if CHS_save_dir is not found in localStorage
    }
});
