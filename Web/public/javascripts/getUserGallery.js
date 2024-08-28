document.addEventListener('getUserCompleted', () => {
    const userId = window.user_id;
    const userEmail = window.user_email;

    // 确保 userId 和 userEmail 被正确赋值
    if (userId && userEmail) {
        console.log('User ID:', userId);
        console.log('User Email:', userEmail);

        // 在这里执行上传请求
        fetch('/uploadAndTrain', {
            method: 'POST',
            body: new FormData(document.getElementById('uploadForm')),
            headers: {
                'user-id': userId,
                'user-email': userEmail
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Upload and train completed:', data);
        })
        .catch(error => {
            console.error('Error during upload and train:', error);
        });
    } else {
        console.error('User ID or Email is missing.');
    }
});