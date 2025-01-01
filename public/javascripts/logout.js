document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-btn');

    // Add an event listener to the logout button
    logoutButton.addEventListener('click', () => {
        // Clear the token
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');

        // Redirect the user to the login page or homepage
        window.location.href = '/login';

        console.log('User logged out successfully');
    });
});