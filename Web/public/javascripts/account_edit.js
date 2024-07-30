function enableEdit(id) {
    const input = document.getElementById(id);
    if (input) {
        input.readOnly = !input.readOnly;
        if (!input.readOnly) {
            input.focus();
        }
    } else {
        console.log("Element with id " + id + " not found.");
    }
}

// 監聽表單提交事件
document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 防止表單提交預設行為

    // 獲取表單數據
    const formData = new FormData(this);

    // 發送 POST 請求到後端
    fetch('/edituser', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // 在收到回應後更新網頁內容
        document.getElementById('gmail').innerText = formData.get('newGmail');
        document.getElementById('password').innerText = formData.get('newPassword');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating user settings');
    });
});