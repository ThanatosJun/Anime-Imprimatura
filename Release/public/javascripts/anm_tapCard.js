document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', function() {
    // 如果當前卡片已經是 active，則取消 active
    if (this.classList.contains('active')) {
      this.classList.remove('active');
    } else {
      // 移除其他卡片的 active 狀態
      document.querySelectorAll('.card').forEach((c) => c.classList.remove('active'));
      // 為當前點擊的卡片添加 active 狀態
      this.classList.add('active');
    }
  });
});