const getModel = async () => {
    const selectElement = document.getElementById('model-select');
    const characterName = localStorage.getItem('character_name');
    let optionsData = [];

    if(window.user_id){
        try {
            const userId = window.user_id;
            console.log('(getModel.js) user_id: ', userId);
            const response = await fetch('/api/getmodel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId })
            })

            const data = await response.json(); // Wait for JSON parsing
            console.log('Model fetched:', data);

            // test data
            // optionsData = [ 'option1', 'option2' ];

            if (response.status == 404){
                alert("You can't skip this step if you have no existing model");
                window.location.href = '/generate/train';
            } else {
                optionsData = data;
            }

        } catch (error) {
            console.error('(getModel.js) Error fetching content:', error); // Handle other errors
        }
    } else {
        console.log('(getModel.js) user_id not found');

        if(characterName){
            optionsData = [characterName];
            localStorage.removeItem('character_name');
        } else {
            console.error('(getModel.js) no character_name found in localStorage');
        }
    }

    console.log('(getModel.js) optionsData:', optionsData);

    optionsData.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });

    document.removeEventListener('getUserCompleted', getModel);
}

document.addEventListener('getUserCompleted', getModel);