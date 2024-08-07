document.addEventListener('DOMContentLoaded', () => {
    // This function will be executed when the DOMContentLoaded event is triggered

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
})