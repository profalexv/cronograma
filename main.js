document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const createSessionForm = document.getElementById('create-session-form');

    // Detecta o ambiente para construir a URL da API corretamente
    const getApiBaseUrl = () => {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        // Em dev, aponta para o servidor unificado. Em prod, usa um caminho relativo para o mesmo host.
        return isDevelopment ? 'http://localhost:3000/cronograma' : '/cronograma';
    };

    // --- Lógica para fazer login via API ---
    loginButton.addEventListener('click', () => {
        // Esta lógica mudou completamente. Agora pegamos os dados de campos de texto.
        // Supondo que você tenha campos com id 'username' e 'password' no seu HTML de login.
        const usernameInput = document.getElementById('superadmin-username-login'); // Você precisará adicionar este campo no HTML
        const passwordInput = document.getElementById('superadmin-password-login');

        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            alert('Por favor, insira o usuário e a senha.');
            return;
        }

        // Faz uma requisição POST para o nosso backend
        fetch(`${getApiBaseUrl()}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => {
            if (!response.ok) {
                // Se a resposta não for 2xx, lança um erro para ser pego pelo .catch()
                return response.json().then(err => { throw new Error(err.message || 'Erro de autenticação') });
            }
            return response.json();
        })
        .then(data => {
            // Se o login for bem-sucedido
            console.log(data.message, data.user);
            
            // Podemos armazenar um token ou informações do usuário na sessão
            sessionStorage.setItem('userInfo', JSON.stringify(data.user));
            
            // Redireciona para a página de configuração
            window.location.href = 'config.html';
        })
        .catch(error => {
            // Se houver um erro de rede ou de autenticação
            alert(`Falha no login: ${error.message}`);
            console.error('Erro no login:', error);
        });
    });
    
    // A lógica de "Criar Nova Sessão" também precisará ser adaptada.
    // Em vez de criar um arquivo JSON, ela fará uma requisição para um endpoint
    // como POST /api/setup ou POST /api/schools para registrar uma nova escola no banco de dados.
    // Vamos deixar isso para o próximo passo.

});