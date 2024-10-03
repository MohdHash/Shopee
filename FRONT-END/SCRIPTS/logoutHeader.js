export function handleLogout(){
    localStorage.removeItem('userID');
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'index.html';
}