window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn'); // 假設登入狀態以此標誌存儲在 localStorage
  
    if (isLoggedIn) {
      // 用戶已登入，更新按鈕為頭像樣式
      updateLoginButtonToAvatar();
    }
  };
  
  function updateLoginButtonToAvatar() {
    const loginButton = document.querySelector('.login-btn');
    if (loginButton) {
      loginButton.classList.add('avatar');
      loginButton.textContent = ''; // 清除任何文字
    }
  }