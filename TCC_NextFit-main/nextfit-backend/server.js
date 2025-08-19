// server.js (dentro da sua pasta NextFit-TCC ou nextfit-backend)

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
        console.error("Erro ao conectar ao banco de dados:", error.message);
        throw new Error("Falha na conexão com o banco de dados.");
    }
}

// TESTE: Rota simples para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('Backend NextFit está online!');
});

// Rota de Cadastro de Academia
app.post('/cadastro/academia', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { nomeAcademia, emailAcademia, cidade, bairro, rua, cep, numero, telefone, horario, senhaAcademia } = req.body;

        if (!nomeAcademia || !emailAcademia || !senhaAcademia || !cidade || !bairro || !rua || !cep || !numero || !telefone || !horario) {
            return res.status(400).json({ message: 'Todos os campos da academia são obrigatórios.' });
        }

        const [existingAcademias] = await connection.execute(
            'SELECT id FROM Academias WHERE nome = ? OR email = ?',
            [nomeAcademia, emailAcademia]
        );

        if (existingAcademias.length > 0) {
            return res.status(409).json({ message: 'Nome da academia ou e-mail já cadastrado.' });
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senhaAcademia, saltRounds);

        const idAcademia = `academia_${Date.now()}`;

        const [result] = await connection.execute(
            'INSERT INTO Academias (id, nome, email, cidade, bairro, rua, cep, numero, telefone, horario_atendimento, senha_hash, data_cadastro, data_atualizacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [
                idAcademia,
                nomeAcademia,
                emailAcademia,
                cidade,
                bairro,
                rua,
                cep,
                numero,
                telefone,
                horario,
                senhaHash
            ]
        );

        res.status(201).json({ message: 'Academia cadastrada com sucesso!', id: idAcademia });

    } catch (error) {
        console.error('Erro ao cadastrar academia:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar academia.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota de Cadastro de Aluno
app.post('/cadastro/aluno', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { nomeAluno, sobrenomeAluno, emailAluno, senhaAluno, academiaId } = req.body;

        if (!nomeAluno || !sobrenomeAluno || !emailAluno || !senhaAluno || !academiaId) {
            return res.status(400).json({ message: 'Todos os campos do aluno são obrigatórios.' });
        }

        const [existingAlunos] = await connection.execute(
            'SELECT id FROM Alunos WHERE email = ?',
            [emailAluno]
        );

        if (existingAlunos.length > 0) {
            return res.status(409).json({ message: 'Este e-mail já está cadastrado para outro aluno.' });
        }

        const [academiaExists] = await connection.execute(
            'SELECT id FROM Academias WHERE id = ?',
            [academiaId]
        );

        if (academiaExists.length === 0) {
            return res.status(404).json({ message: 'Academia selecionada não encontrada.' });
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senhaAluno, saltRounds);

        const idAluno = `aluno_${Date.now()}`;

        const [result] = await connection.execute(
            'INSERT INTO Alunos (id, id_academia, nome, sobrenome, email, senha_hash, data_cadastro, data_atualizacao, status) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)',
            [
                idAluno,
                academiaId,
                nomeAluno,
                sobrenomeAluno,
                emailAluno,
                senhaHash,
                'ativo'
            ]
        );

        res.status(201).json({ message: 'Aluno cadastrado com sucesso!', id: idAluno });

    } catch (error) {
        console.error('Erro ao cadastrar aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar aluno.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota para buscar todas as academias (para o select do cadastro de aluno)
app.get('/academias', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT id, nome FROM Academias ORDER BY nome ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar academias:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar academias.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota de Login de Aluno
app.post('/login/aluno', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        }

        const [alunos] = await connection.execute(
            'SELECT id, nome, sobrenome, email, senha_hash FROM Alunos WHERE email = ?',
            [email]
        );

        if (alunos.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado ou credenciais inválidas.' });
        }

        const aluno = alunos[0];

        const senhaCorreta = await bcrypt.compare(senha, aluno.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ message: 'Email ou senha incorretos.' });
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

// Rota de Login de Academia
app.post('/login/academia', async (req, res) => {
    const { nome, senha } = req.body;
    const nomeLimpo = nome.trim();

    const [academias] = await connection.execute(
        'SELECT ... FROM Academias WHERE nome = ?',
        [nomeLimpo]
    );
    let connection;
    try {
        connection = await getConnection();
        const { nome, senha } = req.body;

        if (!nome || !senha) {
            return res.status(400).json({ message: 'Nome da academia e senha são obrigatórios.' });
        }

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

// --- FIM DAS ROTAS DE LOGIN ---

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Backend NextFit rodando em http://localhost:${port}`);
});