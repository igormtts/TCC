document.addEventListener('DOMContentLoaded', () => {
    const dadosAcademiaDiv = document.getElementById('detalhesAcademia');
    const listaAlunosUl = document.getElementById('listaAlunos');
    const logoutBtn = document.querySelector('.logout');
    
    // 1. Pega os dados da academia do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || usuarioLogado.tipo !== 'academia') {
        // Se não houver uma academia logada, redireciona para a página de login
        window.location.href = 'Login.html';
        return;
    }

    const academiaId = usuarioLogado.id;

    // 2. Função para carregar os dados da academia e seus alunos
    async function carregarPerfil() {
        try {
            // Requisição para a rota de dados da academia
            // **VOCÊ PRECISA CRIAR ESTA ROTA NO SEU SERVER.JS**
            // Rota sugerida: GET /perfil/academia/:id
            const responseAcademia = await fetch(`http://localhost:3000/perfil/academia/${academiaId}`);
            if (!responseAcademia.ok) {
                throw new Error('Erro ao buscar dados da academia.');
            }
            const dadosAcademia = await responseAcademia.json();

            // Exibe os dados da academia
            dadosAcademiaDiv.innerHTML = `
                <p><strong>Nome:</strong> ${dadosAcademia.nome}</p>
                <p><strong>Email:</strong> ${dadosAcademia.email}</p>
                <p><strong>Telefone:</strong> ${dadosAcademia.telefone}</p>
                <p><strong>Endereço:</strong> ${dadosAcademia.rua}, ${dadosAcademia.numero}, ${dadosAcademia.bairro}, ${dadosAcademia.cidade}, ${dadosAcademia.cep}</p>
                <p><strong>Horário de Atendimento:</strong> ${dadosAcademia.horario_atendimento}</p>
            `;

            // Requisição para a rota de alunos da academia
            // **VOCÊ PRECISA CRIAR ESTA ROTA NO SEU SERVER.JS**
            // Rota sugerida: GET /perfil/academia/alunos/:id
            const responseAlunos = await fetch(`http://localhost:3000/perfil/academia/alunos/${academiaId}`);
            if (!responseAlunos.ok) {
                throw new Error('Erro ao buscar a lista de alunos.');
            }
            const listaAlunos = await responseAlunos.json();

            // Exibe a lista de alunos
            if (listaAlunos.length > 0) {
                listaAlunosUl.innerHTML = listaAlunos.map(aluno => `
                    <li class="aluno-item">
                        <strong>${aluno.nome} ${aluno.sobrenome}</strong>
                        <span>Email: ${aluno.email}</span>
                        <span>Status: ${aluno.status}</span>
                    </li>
                `).join('');
            } else {
                listaAlunosUl.innerHTML = '<li class="mensagem">Nenhum aluno cadastrado.</li>';
            }

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            dadosAcademiaDiv.innerHTML = '<p class="mensagem erro">Não foi possível carregar o perfil da academia.</p>';
        }
    }

    // Chama a função para carregar os dados quando a página for carregada
    carregarPerfil();

    // 3. Adiciona a funcionalidade de Sair
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'Login.html';
    });
});