/**
 * Converts files to Base64 images and stores them in localStorage.
 * @param {FileList} files - The files to convert.
 * @param {string} uploadBoxId - The ID of the upload box.
 */
function fileToImage(files, uploadBoxId) {
  const base64Images = [];
  
  function processFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          // Convert image to Base64
          const base64Image = getBase64Image(img);
          base64Images.push(base64Image);
          resolve();
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const promises = Array.from(files).map(file => processFile(file));
  
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
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  ctx.drawImage(img, 0, 0);
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
  const formData = new FormData(form);

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

      // Redirect to "final" page after "detect"
      window.location.href = '/generate_visitor';

  } catch (error) {
      console.error(`Error:`, error.message);
      alert(`An error occurred: ${error.message}`);
  }
}

/**
 * Handles the form submission for training page images.
 */
async function submitFormCHD() {
    const form = document.getElementById(`uploadFormCHD`);
    const characterName = document.getElementById(`character_name`).value;
    const formData = new FormData(form);

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

        // Redirect to the "detect" page with the processed data
        window.location.href = `/generate_detect_visitor?data=${encodeURIComponent(JSON.stringify(trainData))}&character_name=${encodeURIComponent(characterName)}`;

    } catch (error) {
        console.error(`Error:`, error.message);
        alert(`An error occurred: ${error.message}`);
    }
}

/**
 * Handles the form submission for detecting page images.
 */
function submitFormCHS() {
  // Get form and input elements
  const form = document.getElementById(`uploadFormCHS`);
  const chsInput = document.getElementById('chs');

  // Create a FormData object from the form element
  const formData = new FormData(form);

  // Check if a file has been selected
  if (chsInput.files.length === 0) {
    alert(`Please select an image to upload.`);
    return;
  }

  fileToImage(chsInput.files, 'chs');

  // Submit the form data using fetch API
  fetch(`/uploadAndDetect`, {
    method: `POST`,
    body: formData
  })
  .then(response => {
    console.log(`Response status:`, response.status);
    // Check if the response is successful
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`Upload failed`);
    }
  })
  .then(data => {
    console.log(`Success:`, data);
    
    // Redirect to the "after detect" page upon successful upload and detection
    window.location.href = `/generate_visitor`;
  })
  .catch((error) => {
    console.error(`Error:`, error); // Log any errors that occur during the initial request
  });
}

/**
 * Handles the form submission for generating page.
 */
function submitFormGenerate() {
  window.location.href = `/generated_visitor`;
}