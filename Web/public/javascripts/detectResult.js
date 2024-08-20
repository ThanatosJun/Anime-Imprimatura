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

/**
 * Handles the form submission for training page images.
 */
async function submitFormSegment() {
    const characterName = localStorage.getItem('character_name');
    const loadingMasks = document.getElementsByClassName('loading-mask');

    if (!characterName) {
        console.error('characterName not found in localStorage');
        return;
    } else {
        console.log(`characterName: ${characterName}`);
    }

    if (loadingMasks.length === 0) {
        console.error('Loading mask elements are missing');
        return;
      }

    var loadingMask = loadingMasks[0];

    // Display the loading mask
    loadingMask.style.display = 'block';
    loadingMask.style.opacity = 1;

    try {
        const segmentResponse = await fetch(`/uploadAndSegment`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ options: characterName })
        });

        if (!segmentResponse.ok) {
            const errorText = await segmentResponse.text();
            throw new Error(`Segment failed: ${errorText}`);
        }

        // Parse the response JSON data
        const segmentData = await segmentResponse.json();
        console.log(`Segment response:`, segmentData);

        // Clear the data in localStorage
        localStorage.removeItem('character_name');

        // Save color_dictionary in localStorage
        localStorage.setItem('color_dictionary', JSON.stringify(segmentData.color_dictionary));
        localStorage.setItem('CHS_Finished_dir', segmentData.CHS_Finished_dir);

        // Redirect to "final" page after "generate"
        window.location.href = '/generated_visitor';

    } catch (error) {
        console.error(`Error:`, error.message);
        alert(`An error occurred: ${error.message}`);
    } finally {
        // Hide the loading mask regardless of success or failure
        loadingMask.style.transition = 'opacity 600ms';
        loadingMask.style.opacity = 0;
        setTimeout(function() {
            loadingMask.style.display = 'none';
        }, 600); // Wait for the fade-out animation to complete before hiding
    }
}