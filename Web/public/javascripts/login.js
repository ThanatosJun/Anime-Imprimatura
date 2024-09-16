/* 
1. 用戶填寫表單並提交
2. login 函數發送 POST 請求到 /api/login
3. 在 userController.js 的 login 函數中，伺服器處理來自前端的登錄請求，驗證用戶的電子郵件、密碼是否正確，生成 JWT 並返回給前端
4. 成功登入後，將從伺服器獲得的 JWT 存儲到 localStorage 中
5. 在 userController.js 的 content 函數中，伺服器處理用戶請求並返回受保護的內容
*/

async function login(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = document.getElementById(`loginForm`);
    const userMail = form.gmail.value;
    const userPassword = form.password.value;
    const rememberMe = form.remember.checked; // Get the checked state of the remember-me checkbox

    try {
        const loginResponse = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gmail: userMail, password: userPassword, remember: rememberMe })
        });

        if (loginResponse.ok) {
            // Handle successful login
            const loginData = await loginResponse.json();
            console.log('Login successful');
            localStorage.setItem('token', loginData.token);

            const contentResponse = await fetch('/api/content', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (contentResponse.ok) {
                const contentData = await contentResponse.json();
                console.log('Content fetched:', contentData);
            } else {
                console.error('Failed to fetch content:', contentResponse.status, contentResponse.statusText);
            }

        } else {
            // Handle login failure
            const errorData = await loginResponse.json();
            console.error('Login failed: ', errorData);
        }

        // Redirect to "account management" page
        window.location.href = '/account_management';
        
    } catch (error) {
        console.error('Error during login:', error);
    }
}