document.addEventListener('getUserCompleted', () => {
    console.log('user id: ', window.user_id);
    if(window.user_id){
        const newButton = document.createElement('button');
        newButton.textContent = 'Skip ->';
        newButton.className = 'generate-btn';
        newButton.addEventListener('click', function() {
            window.location.href = '/generate_detect_visitor';
        });
        document.getElementById('btn-container').appendChild(newButton);
        console.log('added skip-btn');
    } else {
        console.log('user id not found');
    }
})