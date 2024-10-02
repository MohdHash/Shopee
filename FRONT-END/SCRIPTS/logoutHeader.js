export function handleLogout(){
    localStorage.removeItem('userID');
    window.location.href = 'index.html';
}