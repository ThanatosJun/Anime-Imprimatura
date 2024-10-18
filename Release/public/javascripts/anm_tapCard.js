// 當 hover 到 .step 的時候顯示對應的圖片
document.querySelectorAll('.step').forEach((step) => {
  step.addEventListener('mouseenter', function() {
    // 移除所有圖片的 active 狀態，讓它們逐漸消失
    document.querySelectorAll('.tutorial-container img').forEach((img) => {
      img.classList.remove('active');
    });

    // 找到對應的圖片並加上 active，讓它逐漸顯示
    const imgId = this.getAttribute('data-img');
    const img = document.getElementById(imgId);
    img.classList.add('active');
  });
});