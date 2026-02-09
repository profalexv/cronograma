// 1. Importar as bibliotecas necessárias
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// 2. Configuração do Servidor Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite requisições de outras origens (nosso frontend)
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições

// 3. Configuração da Conexão com o Banco de Dados (TiDB Cloud)
const dbConfig = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
        // TiDB Cloud requer conexão SSL.
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true 
    }
};

// Criamos um "pool" de conexões para reutilizar conexões e melhorar a performance
const pool = mysql.createPool(dbConfig);

// 4. Definição das Rotas da API (Endpoints)

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('<h1>API do Sistema de Agendamento</h1><p>Servidor está no ar!</p>');
});

// Rota de Login (substitui a lógica do arquivo JSON)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    try {
        // 1. Encontrar o usuário pelo username
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            const user = rows[0];

            // 2. Comparar a senha enviada com o hash salvo no banco
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Senha correta! Login bem-sucedido.
                // Não envie a senha (nem o hash) de volta para o cliente!
                res.json({ message: 'Login bem-sucedido!', user: { id: user.id, username: user.username, role: user.role } });
            } else {
                // Senha incorreta
                res.status(401).json({ message: 'Credenciais inválidas.' });
            }
        } else {
            // Usuário não encontrado
            res.status(401).json({ message: 'Credenciais inválidas.' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rota para registrar um novo usuário (com senha hasheada)
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    try {
        // Gera o "salt" e o "hash" da senha
        const saltRounds = 10; // Fator de custo do hash
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insere o novo usuário no banco de dados com a senha hasheada
        const [result] = await pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role || 'admin'] // 'admin' como role padrão se não for fornecido
        );

        res.status(201).json({ message: 'Usuário criado com sucesso!', userId: result.insertId });

    } catch (error) {
        // Código 'ER_DUP_ENTRY' é específico do MySQL para entradas duplicadas
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este nome de usuário já existe.' });
        }
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// 5. Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse em http://localhost:${PORT}`);
});