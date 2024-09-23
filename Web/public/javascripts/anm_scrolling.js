const animeTitle = document.getElementById('anime-title');
const sectionHeight = window.innerHeight; // 取得視窗高度

document.addEventListener('scroll', function() {
  const scrollPosition = window.scrollY;

  // 計算滾動比例
  const maxScroll = sectionHeight; // 滾動的最大值
  const percentage = Math.min(scrollPosition / maxScroll, 1); // 最大為 1

  // 設置字體顏色
  animeTitle.style.color = `rgba(255, 255, 255, ${percentage})`;

  // 計算字的位置，讓字從右邊進入視窗
  animeTitle.style.transform = `translateX(-${percentage * 100}vw)`;
});