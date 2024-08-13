window.addEventListener('load', function() {
    // 獲取所有具有 'loading-mask' 類名的元素
    var loadingMasks = document.getElementsByClassName('loading-mask');
    var contents = document.getElementsByClassName('content');

    if (loadingMasks.length === 0 || contents.length === 0) {
        console.error('Required elements are missing');
        return;
    }

    // 獲取第一個元素
    var loadingMask = loadingMasks[0];
    var content = contents[0];

    // 過渡效果的實現
    function fadeOut(element, duration) {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = 0;
        setTimeout(function() {
            element.style.display = 'none';
        }, duration);
    }

    function fadeIn(element, duration) {
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = 1;
    }

    // 執行過渡效果
    fadeOut(loadingMask, 600); // 600ms 為 slow
    setTimeout(function() {
        fadeIn(content, 600); // 600ms 為 slow
    }, 600); // 等待遮罩消失後再顯示內容
});

// 監聽 AJAX 請求
(function() {
    var originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.send = function() {
        var xhr = this;
        var loadingMasks = document.getElementsByClassName('loading-mask');

        if (loadingMasks.length === 0) {
            console.error('Loading mask elements are missing');
            return;
        }

        var loadingMask = loadingMasks[0];

        // 當請求開始時顯示遮罩
        loadingMask.style.display = 'block';

        // 當請求結束時隱藏遮罩
        xhr.addEventListener('loadend', function() {
            loadingMask.style.transition = 'opacity 600ms';
            loadingMask.style.opacity = 0;
            setTimeout(function() {
                loadingMask.style.display = 'none';
            }, 600); // 等待動畫結束後再隱藏
        });

        // 使用原始的 send 方法
        originalSend.apply(this, arguments);
    };
})();