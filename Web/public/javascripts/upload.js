/**
 * Converts files to Base64 images and stores them in localStorage.
 * @param {FileList} files - The files to convert.
 * @param {string} uploadBoxId - The ID of the upload box.
 */
function fileToImage(files, uploadBoxId) {
  // Array to store Base64 images
  const base64Images = [];

  /**
   * Processes a single file and converts it to a Base64 image.
   * @param {File} file - The file to process.
   * @returns {Promise} - A promise that resolves when the file is processed.
   */
  function processFile(file) {
    return new Promise((resolve, reject) => {
      // FileReader to read the file
      const reader = new FileReader(); 

      reader.onload = function(event) {
        // Create a new image element
        const img = new Image(); 

        img.onload = function() {
          // Convert image to Base64
          const base64Image = getBase64Image(img);
          base64Images.push(base64Image); // Add the Base64 image to the array
          resolve(); // Resolve the promise
        };

        img.onerror = reject; // Reject the promise if there is an error loading the image
        img.src = event.target.result; // Set the image source to the file data
      };

      reader.onerror = reject; // Reject the promise if there is an error reading the file
      reader.readAsDataURL(file); // Read the file as a Data URL
    });
  }

  // Convert each file in the FileList to a Base64 image
  const promises = Array.from(files).map(file => processFile(file));

  // Wait for all files to be processed
  Promise.all(promises)
    .then(() => {
      // Store Base64 images in localStorage
      localStorage.setItem('chs', JSON.stringify(base64Images));
    })
    .catch(error => {
      console.error('Error processing files:', error);
    });
}

/**
 * Converts an image element to a Base64 string.
 * @param {HTMLImageElement} img - The image element to convert.
 * @returns {string} - The Base64 string of the image.
 */
function getBase64Image(img) {
  const canvas = document.createElement('canvas'); // Create a canvas element
  const ctx = canvas.getContext('2d'); // Get the canvas context
  canvas.height = img.naturalHeight; // Set the canvas height to the image height
  canvas.width = img.naturalWidth; // Set the canvas width to the image width
  ctx.drawImage(img, 0, 0); // Draw the image on the canvas

  // Return the Base64 string of the image
  return canvas.toDataURL('image/png');
}

/**
 * Handles file selection and preview.
 * @param {FileList} files - The selected files.
 * @param {string} containerId - The ID of the container for previews.
 * @returns {Object} - The paths of the selected images.
 */
function handleFiles(files, containerId) {
  let imagePaths = { uploadBoxCHS: [], uploadBoxCHD: [] };
  
  console.log(`Handling files for:`, containerId);
  console.log(`Files:`, files);

  // Get the upload box DOM element, log error and return if not found
  const container = document.getElementById(containerId);
  if (!container) {
      console.error(`Container not found:`, containerId);
      return;
  }

    // Set max file count based on the upload box
    const maxFiles = containerId === `uploadBoxCHS` ? 10 : 3;

  // Clear previous previews
  const existingPreviews = container.querySelectorAll(`img`);
  existingPreviews.forEach(img => container.removeChild(img));

  // Clear previous file paths
  imagePaths[containerId] = [];

  // Convert file list to array and handle up to the allowed max file count
  Array.from(files).slice(0, maxFiles).forEach(file => {
      const img = document.createElement(`img`);
      // Create a new image element for each file and add preview class
      img.classList.add(`preview`);
      img.file = file;

      // Use FileReader to read the file and display it as a preview image
      const reader = new FileReader();
      reader.onload = (function(aImg) {
          return function(e) {
              aImg.src = e.target.result;
              console.log(`Preview added for:`, aImg.src);
          };
      })(img);
      reader.readAsDataURL(file);

      container.appendChild(img);
      // Add the file URL path to the corresponding upload box in imagePaths
      imagePaths[containerId].push(URL.createObjectURL(file));
  });

  console.log(`Image paths:`, imagePaths);
  return imagePaths;
}

/**
 * Handles the form submission for detecting page images.
 */
async function submitFormCHS() {
  const form = document.getElementById(`uploadFormCHS`);
  const chsInput = document.getElementById('chs');
  const formData = new FormData(form);
  const loadingMasks = document.getElementsByClassName('loading-mask');

  // Check if a file has been selected
  if (chsInput.files.length === 0) {
    alert(`Please select an image to upload.`);
    return;
  }

  var loadingMask = loadingMasks[0];

  // Display the loading mask
  loadingMask.style.display = 'block';
  loadingMask.style.opacity = 1;

  fileToImage(chsInput.files, 'chs');

  try {
    // Upload the file and process it
    const uploadResponse = await fetch(`/uploadAndDetect`, {
        method: 'POST',
        body: formData
    });

    if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorText}`);
    }

    // Parse the response JSON data
    const uploadData = await uploadResponse.json();
    console.log(`Upload response:`, uploadData);

    // Save CHS_save_dir in localStorage
    localStorage.setItem('CHS_save_dir', uploadData.CHS_save_dir);

    // Redirect to "final" page after "detect"
    window.location.href = '/generate_visitor';
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

/**
 * Handles the form submission for training page images.
 */
async function submitFormCHD() {
  const form = document.getElementById(`uploadFormCHD`);
  const characterName = document.getElementById(`character_name`).value;
  const formData = new FormData(form);
  const loadingMasks = document.getElementsByClassName('loading-mask');

  // Save character_name in localStorage
  localStorage.setItem('character_name', uploadData.characterName);

  var loadingMask = loadingMasks[0];

  // Display the loading mask
  loadingMask.style.display = 'block';
  loadingMask.style.opacity = 1;

  try {
      // Upload the file and process it
      const uploadResponse = await fetch(`/uploadAndTrain`, {
          method: 'POST',
          body: formData
      });

      if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed: ${errorText}`);
      }

      // Parse the response JSON data
      const uploadData = await uploadResponse.json();
      console.log(`Upload response:`, uploadData);

      // Send a POST request to the '/train' endpoint with the processed data
      const trainResponse = await fetch(`/train`, {
          method: 'POST',
          body: JSON.stringify(uploadData),
          headers: {
              'Content-Type': 'application/json' // Specify the content type as JSON
          }
      });

      // Parse the train response JSON data
      const trainData = await trainResponse.json();
      console.log('Train response:', trainData);

      // Redirect to the "detect" page with the processed data
      window.location.href = `/generate_detect_visitor?character_name=${encodeURIComponent(characterName)}`;

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