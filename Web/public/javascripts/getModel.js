const getModel = async () => {
    if(window.user_id){
        try {
            const response = await fetch('/api/getmodel', {
                method: 'POST',
                headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: {
                    user_id: window.user_id
                }
            })

            const data = await response.json(); // Wait for JSON parsing
            console.log('Model fetched:', data);

            window.options = data;

            // if(response.status == 404){
            //     alert("You can't skip this step if you have no existing model");
            //     window.location.href = '/generate_train_visitor';
            // }

        } catch (error) {
            console.error('(getModel.js) Error fetching content:', error); // Handle other errors
        }
    } else {
        console.log('(getModel.js) user_id not found');
    }

    document.removeEventListener('getUserCompleted', getModel);
}

document.addEventListener('getUserCompleted', getModel);