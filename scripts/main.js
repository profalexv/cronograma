document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');

    // --- Elementos para o formulário de cadastro ---
    const showRegisterButton = document.getElementById('show-register-form-button');
    const registerSection = document.getElementById('register-section');
    const registerForm = document.getElementById('register-form');
    const cancelRegisterButton = document.getElementById('cancel-register-button');
    const loginSection = document.getElementById('login-section'); // A seção de login que será ocultada

    // Detecta o ambiente para construir a URL da API corretamente
    const getApiBaseUrl = () => {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
        // Aponta para o servidor unificado em dev, e para a URL de produção do Render.com em prod.
        return isLocal ? 'http://localhost:3000/cronograma' : 'https://profalexv-alexluza.onrender.com/cronograma';
    };

    // --- Lógica para fazer login via API ---
    loginButton.addEventListener('click', () => {
        // Pega os dados dos campos de texto.
        const usernameInput = document.getElementById('superadmin-username-login'); // Você precisará adicionar este campo no HTML
        const passwordInput = document.getElementById('superadmin-password-login');

        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            alert('Por favor, insira o usuário e a senha.');
            return;
        }

        // Desabilita o botão para feedback visual e para evitar cliques duplos
        loginButton.disabled = true;
        loginButton.textContent = 'Entrando...';

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
        })
        .finally(() => {
            // Reabilita o botão independentemente do resultado
            loginButton.disabled = false;
            loginButton.textContent = 'Entrar';
        });
    });
    
    // Adiciona a funcionalidade de login com a tecla "Enter"
    document.getElementById('superadmin-password-login').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            loginButton.click();
        }
    });

    // --- Lógica para o cadastro de Super Admin ---

    if (showRegisterButton && registerSection && registerForm && cancelRegisterButton) {
        // Mostrar o formulário de cadastro e esconder o de login
        showRegisterButton.addEventListener('click', () => {
            registerSection.style.display = 'block';
            showRegisterButton.style.display = 'none';
            if (loginSection) {
                loginSection.style.display = 'none';
            }
        });

        // Cancelar e voltar para o login
        cancelRegisterButton.addEventListener('click', () => {
            registerSection.style.display = 'none';
            showRegisterButton.style.display = 'block';
            if (loginSection) {
                loginSection.style.display = 'block';
            }
        });

        // Enviar o formulário de cadastro
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const name = document.getElementById('register-name').value;
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            if (!name || !username || !password) {
                alert('Todos os campos (nome, usuário e senha) são obrigatórios.');
                return;
            }

            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Cadastrando...';

            fetch(`${getApiBaseUrl()}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, password, role: 'superadmin' }),
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message || 'Erro ao cadastrar') });
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || 'Usuário cadastrado com sucesso! Agora você pode fazer o login.');
                cancelRegisterButton.click(); // Volta para a tela de login
                registerForm.reset(); // Limpa o formulário
            })
            .catch(error => {
                alert(`Falha no cadastro: ${error.message}`);
                console.error('Erro no cadastro:', error);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Cadastrar';
            });
        });
    }

    // A lógica de "Criar Nova Sessão" também precisará ser adaptada.
    // Em vez de criar um arquivo JSON, ela fará uma requisição para um endpoint
    // como POST /api/setup ou POST /api/schools para registrar uma nova escola no banco de dados.
    // Vamos deixar isso para o próximo passo.

});