document.addEventListener('DOMContentLoaded', () => {
    // This function will be executed when the DOMContentLoaded event is triggered

    // 1. 從 localStorage 獲取 Base64 圖像數據
    const storedImage = JSON.parse(localStorage.getItem('chs'));

    // Check if there is image data stored in localStorage
    if (storedImage) {
        // 2. 確保 imageContainer 存在
        const imageContainer = document.getElementById('chsContainer');

        // 3. 顯示每個 Base64 圖像
        storedImage.forEach((storedImage, index) => {
            const img = document.createElement('img');
            img.src = storedImage;
            img.alt = `CHS`; // 替代文本
            img.style.maxWidth = '100%'; // 可選：限制圖片的最大寬度
            imageContainer.appendChild(img);
        });

        // 4. 可以選擇在顯示後清除 localStorage 中的數據
        localStorage.removeItem('chs');
    } else {
            console.log('No images found in localStorage.');
        }
});
