document.addEventListener('DOMContentLoaded', () => {
    // Pega as informações do usuário logado, salvas pelo main.js
    const userInfoString = sessionStorage.getItem('userInfo');

    if (!userInfoString) {
        // Se não houver informações do usuário, ele não está "logado"
        // Redireciona de volta para a página de login
        alert('Nenhuma sessão ativa encontrada. Por favor, faça o login.');
        window.location.href = 'index.html';
    } else {
        // Se as informações existirem, podemos usá-las para personalizar a página
        const userInfo = JSON.parse(userInfoString);
        const configTitle = document.getElementById('config-title');
        const welcomeMessage = document.getElementById('welcome-user');
        
        if (welcomeMessage) welcomeMessage.textContent = `Bem-vindo, ${userInfo.username}!`;
    }
});