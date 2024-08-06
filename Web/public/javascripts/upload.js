/**
  * Function to handle file selection and preview
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

// Function to handle detect page form submission
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

// Function to handle train page form submission
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

function submitFormGenerate(){
  window.location.href = `/generated_visitor`;
}