document.addEventListener('DOMContentLoaded', () => {
    // This function will be executed when the DOMContentLoaded event is triggered

    const resultContainer = document.getElementById('detectResult');
    const colorContainer = document.getElementById('colorContainer');
    const coloredImageContainer = document.getElementById('finalImage');
    // Retrieve the path to the directory containing images from localStorage
    const CHS_save_dir = localStorage.getItem('CHS_save_dir');
    const color_dictionary = localStorage.getItem('color_dictionary');
    const CHS_Finished_dir = localStorage.getItem('CHS_Finished_dir');
    
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
                    img.classList.add('responsive-image'); // Add class for styling
                    img.style.maxWidth = '100%';
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

    if (color_dictionary){
        for (let segment_part in color_dictionary){
            console.log(`segement part: ${segment_part}`);
            let colorBox = document.getElementById(`color-box-${segment_part}`);

            if (colorBox){
                colorBox.textContent = `${segment_part}`;

                // 獲取顏色值並轉換為 RGB 格式
                let colorTuple = color_dictionary[segment_part];
                let rgbColor = `rgb(${colorTuple[0]}, ${colorTuple[1]}, ${colorTuple[2]})`;

                colorBox.style.color = rgbColor;
            } else {
                // 如果找不到對應的元素，可以選擇創建新的元素
                let newColorBox = document.createElement('div');
                newColorBox.classList.add('color-box');
                newColorBox.id = `color-box-${segment_part}`;
                newColorBox.textContent = `${segment_part}`;

                let colorTuple = color_dictionary[segment_part];
                let rgbColor = `rgb(${colorTuple[0]}, ${colorTuple[1]}, ${colorTuple[2]})`;

                newColorBox.style.color = rgbColor;

                colorContainer.appendChild(newColorBox);
            }
        }
    } else {
        console.error('color_dictionary not found in localStorage.'); // Log an error if color_dictionary is not found in localStorage
    }

    if (CHS_Finished_dir){
        // Fetch images from the server using the directory path
        fetch(`/images?path=${encodeURIComponent(CHS_Finished_dir)}`)
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
                    img.alt = 'colored image';
                    img.classList.add('responsive-image'); // Add class for styling
                    img.style.maxWidth = '100%';
                    coloredImageContainer.appendChild(img); // Add the image element to the container
                });

                // Clear the directory path from localStorage after displaying images
                localStorage.removeItem('CHS_Finished_dir');
            })
            .catch(error => {
                console.error('Error fetching images:', error); // Log any errors during the fetch process
            });
    } else{
        console.error('CHS_Finished_dir not found in localStorage.'); // Log an error if CHS_Finished_dir is not found in localStorage
    }
});
