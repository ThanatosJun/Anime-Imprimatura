document.addEventListener('DOMContentLoaded', () => {
    // This function will be executed when the DOMContentLoaded event is triggered
    let resultPath = "";

    // Fetch the data from the '/detect' route on the server
    fetch('/detect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData) // Send the request data as a JSON string
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok'); // Handle HTTP errors
        }
        return response.json(); // Convert the response to JSON
    })
    .then(data => {
        // Handle the JSON response
        if (data.status === 'success') {
            resultPath = data.CHS_save_dir; // Assign the result path from the response
            console.log(`Result path: ${resultPath}`); // Log the result path
        } else {
            console.error('Detection failed:', data.message || 'Unknown error');
        }
    })
    .catch(error => {
        // Handle any errors during fetch
        console.error('Error:', error);
    });
})