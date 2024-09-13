/* 
1. 用戶填寫表單並提交
2. signin 函數發送 POST 請求到 /api/signin
3. 在 userController.js 的 signin 函數中，伺服器處理來自前端的登錄請求，驗證用戶的電子郵件、密碼是否正確，生成 JWT 並返回給前端
4. 成功登入後，將從伺服器獲得的 JWT 存儲到 localStorage 中
5. 在 userController.js 的 content 函數中，伺服器處理用戶請求並返回受保護的內容
*/

async function signin(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = document.getElementById(`signinForm`);
    const userName = form.user_name.value;
    const userMail = form.gmail.value;
    const userPassword = form.password.value;

    try {
        const signinResponse = await fetch('/api/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: userName, gmail: userMail, password: userPassword })
        });

        if (signinResponse.ok) {
            // Handle successful signin
            console.log('signin successful');
        } else {
            // Handle signin failure
            const errorData = await signinResponse.json();
            console.error('signin failed: ', errorData);
        }

        // Redirect to "signin" page
        window.location.href = '/login';
        
    } catch (error) {
        console.error('Error during signin:', error);
    }
}