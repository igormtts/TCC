// server.js

require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const express = require('express');
const mysql = require('mysql2/promise'); // Usar 'mysql2/promise' para async/await
const cors = require('cors');
const bcrypt = require('bcrypt'); // Para hash de senhas

const app = express();
const port = process.env.PORT || 3000; // Porta do seu servidor backend

// Middleware
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json()); // Permite que o Express entenda JSON no corpo das requisições

// Configuração da Conexão com o Banco de Dados MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root', // Mude para sua senha do MySQL
    database: process.env.DB_DATABASE || 'nextfit' // Mude para o nome do seu banco de dados
};

// Função para obter conexão com o banco de dados
async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Conectado ao banco de dados MySQL!");
        return connection;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error; // Lança o erro para ser tratado pela rota
    }
}
// Função para criar as tabelas no banco de dados se elas não existirem
async function createTables() {
    let connection;
    try {
        connection = await getConnection();

        // Tabela de Academias
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Academias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                cidade VARCHAR(255),
                bairro VARCHAR(255),
                rua VARCHAR(255),
                cep VARCHAR(8),
                numero VARCHAR(10),
                telefone VARCHAR(11),
                horario_atendimento VARCHAR(255),
                senha VARCHAR(255) NOT NULL
            )
        `);
        console.log("Tabela 'Academias' verificada/criada com sucesso.");

        // Tabela de Alunos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Alunos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                sobrenome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                academia_id INT,
                FOREIGN KEY (academia_id) REFERENCES Academias(id)
            )
        `);
        console.log("Tabela 'Alunos' verificada/criada com sucesso.");

        // Tabela de Mensalidades
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Mensalidades (
                id INT AUTO_INCREMENT PRIMARY KEY,
                aluno_id INT NOT NULL,
                data_vencimento DATE NOT NULL,
                status VARCHAR(50) DEFAULT 'pendente',
                FOREIGN KEY (aluno_id) REFERENCES Alunos(id)
            )
        `);
        console.log("Tabela 'Mensalidades' verificada/criada com sucesso.");

        // Tabela de Notificações
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Notificacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                aluno_id INT,
                titulo VARCHAR(255) NOT NULL,
                conteudo TEXT NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (aluno_id) REFERENCES Alunos(id)
            )
        `);
        console.log("Tabela 'Notificacoes' verificada/criada com sucesso.");
    } catch (error) {
        console.error("Erro ao criar tabelas no banco de dados:", error);
    } finally {
        if (connection) connection.end();
    }
}

// Chame a função de criação de tabelas antes de iniciar o servidor
createTables().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});

// Rota de cadastro de academia
app.post('/cadastro/academia', async (req, res) => {
    let connection;
    try {
        const { nomeAcademia, emailAcademia, cidade, bairro, rua, cep, numero, telefone, horario, senhaAcademia } = req.body;

        if (!nomeAcademia || !emailAcademia || !senhaAcademia) {
            return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
        }

        const senha_hash = await bcrypt.hash(senhaAcademia, 10);
        connection = await getConnection();
        await connection.execute(
            'INSERT INTO Academias (nome, email, cidade, bairro, rua, cep, numero, telefone, horario_atendimento, senha_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nomeAcademia, emailAcademia, cidade, bairro, rua, cep, numero, telefone, horario, senha_hash]
        );
        res.status(201).json({ message: 'Academia cadastrada com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'O nome da academia ou o email já está em uso.' });
        }
        console.error('Erro ao cadastrar academia:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota de cadastro de aluno
app.post('/cadastro/aluno', async (req, res) => {
    let connection;
    try {
        const { nomeAluno, sobrenomeAluno, emailAluno, senhaAluno, academiaId } = req.body;

        if (!nomeAluno || !sobrenomeAluno || !emailAluno || !senhaAluno || !academiaId) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const senha_hash = await bcrypt.hash(senhaAluno, 10);
        connection = await getConnection();

        await connection.execute(
            'INSERT INTO Alunos (nome, sobrenome, email, senha_hash, id_academia) VALUES (?, ?, ?, ?, ?)',
            [nomeAluno, sobrenomeAluno, emailAluno, senha_hash, academiaId]
        );
        res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este email já está cadastrado.' });
        }
        console.error('Erro ao cadastrar aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota de login de aluno
app.post('/login/aluno', async (req, res) => {
    let connection;
    try {
        const { email, senha } = req.body;
        connection = await getConnection();
        const [alunos] = await connection.execute(
            'SELECT id, nome, sobrenome, email, senha_hash FROM Alunos WHERE email = ?',
            [email]
        );

        if (alunos.length === 0) {
            return res.status(404).json({ message: 'Email ou senha inválidos.' });
        }

        const aluno = alunos[0];
        const senhaCorreta = await bcrypt.compare(senha, aluno.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        res.status(200).json({
            message: 'Login de aluno bem-sucedido!',
            aluno: {
                id: aluno.id,
                nome: aluno.nome,
                sobrenome: aluno.sobrenome,
                email: aluno.email
            }
        });

    } catch (error) {
        console.error('Erro no login de aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login de aluno.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota de login de academia
app.post('/login/academia', async (req, res) => {
    let connection;
    try {
        const { nome, senha } = req.body;
        connection = await getConnection();
        const [academias] = await connection.execute(
            'SELECT id, nome, email, telefone, horario_atendimento, cidade, bairro, rua, numero, cep, senha_hash FROM Academias WHERE nome = ?',
            [nome]
        );

        if (academias.length === 0) {
            return res.status(404).json({ message: 'Academia não encontrada ou credenciais inválidas.' });
        }

        const academia = academias[0];

        const senhaCorreta = await bcrypt.compare(senha, academia.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ message: 'Nome da academia ou senha incorretos.' });
        }

        res.status(200).json({
            message: 'Login de academia bem-sucedido!',
            academia: {
                id: academia.id,
                nome: academia.nome,
                email: academia.email,
                telefone: academia.telefone,
                horario_atendimento: academia.horario_atendimento,
                cidade: academia.cidade,
                bairro: academia.bairro,
                rua: academia.rua,
                numero: academia.numero,
                cep: academia.cep
            }
        });

    } catch (error) {
        console.error('Erro no login de academia:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login de academia.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota para a academia ver a lista de alunos
app.get('/perfil/academia/alunos/:academiaId', async (req, res) => {
    let connection;
    try {
        const { academiaId } = req.params;
        connection = await getConnection();
        const [alunos] = await connection.execute(
            `SELECT a.id, a.nome, a.sobrenome, a.email, m.data_vencimento
             FROM Alunos AS a
             LEFT JOIN Mensalidades AS m ON a.id = m.aluno_id
             WHERE a.academia_id = ?`,
            [academiaId]
        );
        res.status(200).json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos da academia:', error);
        res.status(500).json({ message: 'Erro ao buscar alunos da academia.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota para buscar os dados de uma única academia para a página de perfil
app.get('/perfil/academia/:academiaId', async (req, res) => {
    let connection;
    try {
        const { academiaId } = req.params;
        connection = await getConnection();
        const [academias] = await connection.execute(
            `SELECT id, nome, email, telefone, horario_atendimento, cidade, bairro, rua, numero, cep
             FROM Academias
             WHERE id = ?`,
            [academiaId]
        );

        if (academias.length === 0) {
            return res.status(404).json({ message: 'Academia não encontrada.' });
        }

        res.status(200).json(academias[0]);
    } catch (error) {
        console.error('Erro ao buscar dados da academia:', error);
        res.status(500).json({ message: 'Erro ao buscar dados da academia.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota para buscar todas as academias (usado no cadastro de aluno e na lista geral)
app.get('/academias', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [academias] = await connection.execute('SELECT id, nome, cidade, bairro, rua, numero, cep, email, telefone, horario_atendimento FROM Academias');
        res.status(200).json(academias);
    } catch (error) {
        console.error('Erro ao buscar academias:', error);
        res.status(500).json({ message: 'Erro ao buscar academias.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota para atualizar a data de vencimento
app.put('/mensalidades/atualizar-vencimento', async (req, res) => {
    let connection;
    try {
        const { alunoId, novaDataVencimento } = req.body;
        if (!alunoId || !novaDataVencimento) {
            return res.status(400).json({ message: 'ID do aluno e nova data de vencimento são obrigatórios.' });
        }

        connection = await getConnection();
        await connection.execute(
            `INSERT INTO Mensalidades (aluno_id, data_vencimento)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE data_vencimento = ?;`,
            [alunoId, novaDataVencimento, novaDataVencimento]
        );
        res.status(200).json({ message: 'Data de vencimento atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar a data de vencimento:', error);
        res.status(500).json({ message: 'Erro ao atualizar a data de vencimento.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota para a academia enviar uma notificação para um aluno
app.post('/notificacoes/enviar', async (req, res) => {
    let connection;
    try {
        const { academia_id, aluno_id, titulo, conteudo, tipo } = req.body;
        if (!academia_id || !titulo || !conteudo || !tipo) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
        }

        connection = await getConnection();
        await connection.execute(
            'INSERT INTO Notificacoes (academia_id, aluno_id, titulo, conteudo, tipo) VALUES (?, ?, ?, ?, ?)',
            [academia_id, aluno_id, titulo, conteudo, tipo]
        );
        res.status(201).json({ message: 'Notificação enviada com sucesso.' });
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        res.status(500).json({ message: 'Erro ao enviar notificação.' });
    } finally {
        if (connection) connection.end();
    }
});
// Rota para buscar os detalhes de uma academia por ID
app.get('/academias/detalhes/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM Academias WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Academia não encontrada.' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar detalhes da academia:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.end();
    }
});// Rota para buscar os dados de um aluno por ID
app.get('/perfil/aluno/:alunoId', async (req, res) => {
    let connection;
    try {
        const { alunoId } = req.params;
        connection = await getConnection();
        const [aluno] = await connection.execute('SELECT id, nome, sobrenome, email FROM Alunos WHERE id = ?', [alunoId]);

        if (aluno.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }

        res.status(200).json(aluno[0]);
    } catch (error) {
        console.error('Erro ao buscar dados do aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.end();
    }
});
// Rota para buscar os dados de um aluno por ID
app.get('/perfil/aluno/:alunoId', async (req, res) => {
    let connection;
    try {
        const { alunoId } = req.params;
        connection = await getConnection();
        const [aluno] = await connection.execute('SELECT id, nome, sobrenome, email FROM Alunos WHERE id = ?', [alunoId]);

        if (aluno.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }

        res.status(200).json(aluno[0]);
    } catch (error) {
        console.error('Erro ao buscar dados do aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.end();
    }
});
// Rota para buscar todos os alunos de uma academia específica
app.get('/perfil/academia/alunos/:academiaId', async (req, res) => {
    let connection;
    try {
        const { academiaId } = req.params;
        connection = await getConnection();
        const [alunos] = await connection.execute('SELECT id, nome, sobrenome, email FROM Alunos WHERE academia_id = ?', [academiaId]);

        res.status(200).json(alunos);
    } catch (error) {
        console.error('Erro ao buscar a lista de alunos da academia:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar alunos.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota para o aluno ver suas notificações
app.get('/notificacoes/aluno/:alunoId', async (req, res) => {
    let connection;
    try {
        const { alunoId } = req.params;
        connection = await getConnection();
        const [notificacoes] = await connection.execute(
            'SELECT * FROM Notificacoes WHERE aluno_id = ? OR tipo = "geral" ORDER BY data_envio DESC',
            [alunoId]
        );
        res.status(200).json(notificacoes);
    } catch (error) {
        console.error('Erro ao buscar notificações do aluno:', error);
        res.status(500).json({ message: 'Erro ao buscar notificações do aluno.' });
    } finally {
        if (connection) connection.end();
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});