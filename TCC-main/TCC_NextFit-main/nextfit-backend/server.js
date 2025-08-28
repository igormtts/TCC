
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração da Conexão com o Banco de Dados MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'nextfit'
};

async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Conectado ao banco de dados MySQL!");
        return connection;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error;
    }
}

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
             WHERE a.id_academia = ?`, // Corrigido para a coluna correta 'id_academia'
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
        const { id_academia, aluno_id, titulo, conteudo, tipo } = req.body;
        
        // Verificação de campos obrigatórios
        if (!id_academia || !titulo || !conteudo || !tipo) {
            console.error('Erro 400: Campos obrigatórios faltando. Dados recebidos:', req.body);
            return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
        }

        connection = await getConnection();

        // Query SQL e parâmetros serão montados dinamicamente
        let sql;
        let params;

        if (tipo === 'geral') {
            sql = 'INSERT INTO Notificacoes (id_academia, titulo, conteudo, tipo) VALUES (?, ?, ?, ?)';
            params = [id_academia, titulo, conteudo, tipo];
        } else {
            // Se o tipo for 'privada', o aluno_id é obrigatório
            if (!aluno_id) {
                console.error('Erro 400: ID do aluno é obrigatório para notificações privadas.');
                return res.status(400).json({ message: 'ID do aluno é obrigatório para notificações privadas.' });
            }
            sql = 'INSERT INTO Notificacoes (id_academia, aluno_id, titulo, conteudo, tipo) VALUES (?, ?, ?, ?, ?)';
            params = [id_academia, aluno_id, titulo, conteudo, tipo];
        }

        // Executa a query
        await connection.execute(sql, params);
        
        res.status(201).json({ message: 'Notificação enviada com sucesso.' });
    } catch (error) {
        // Exibe o erro exato do SQL, que pode estar no `sqlMessage` ou `message`
        console.error('Erro fatal ao enviar notificação:', error.sqlMessage || error.message);
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

// Rota para atualizar o perfil do aluno
app.put('/perfil/aluno/:alunoId', async (req, res) => {
    let connection;
    try {
        const { alunoId } = req.params;
        const { nome, sobrenome, email } = req.body;
        connection = await getConnection();

        await connection.execute(
            'UPDATE Alunos SET nome = ?, sobrenome = ?, email = ? WHERE id = ?',
            [nome, sobrenome, email, alunoId]
        );

        res.status(200).json({ message: 'Perfil do aluno atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar perfil do aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
    } finally {
        if (connection) connection.end();
    }
});

// Rota para atualizar o perfil da academia
app.put('/perfil/academia/:academiaId', async (req, res) => {
    let connection;
    try {
        const { academiaId } = req.params;
        const { nome, email, telefone } = req.body;
        connection = await getConnection();

        await connection.execute(
            'UPDATE Academias SET nome = ?, email = ?, telefone = ? WHERE id = ?',
            [nome, email, telefone, academiaId]
        );

        res.status(200).json({ message: 'Perfil da academia atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar perfil da academia:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
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