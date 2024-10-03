const skipBtn = () => {
    console.log('user id: ', window.user_id);
    if(window.user_id){
        const newButton = document.createElement('button');
        newButton.textContent = 'Skip ->';
        newButton.className = 'skip-btn';
        newButton.addEventListener('click', function() {
            window.location.href = '/generate/detect';
        });
        document.getElementById('btn-container').appendChild(newButton);
        console.log('added skip-btn');
    } else {
        console.log('user id not found');
    }

    document.removeEventListener('getUserCompleted', skipBtn);
}

document.addEventListener('getUserCompleted', skipBtn);