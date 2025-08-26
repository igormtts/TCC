// js/perfilAluno.js

document.addEventListener('DOMContentLoaded', () => {
    const dadosAlunoDiv = document.getElementById('dadosAluno');
    const detalhesMensalidadeDiv = document.getElementById('detalhesMensalidade');
    const btnPagar = document.getElementById('btnPagar');
    const logoutBtn = document.querySelector('.logout-btn');

    // 1. Pega os dados do aluno do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || usuarioLogado.tipo !== 'aluno') {
        window.location.href = 'Login.html';
        return;
    }

    const alunoId = usuarioLogado.id;

    // 2. Função para carregar os dados do perfil do aluno
    async function carregarPerfil() {
        try {
            // Requisição para a rota de dados do aluno
            const responsePerfil = await fetch(`http://localhost:3000/perfil/aluno/${alunoId}`);
            if (!responsePerfil.ok) {
                throw new Error('Erro ao buscar dados do aluno.');
            }
            const dadosAluno = await responsePerfil.json();

            // Exibe os dados do aluno
            dadosAlunoDiv.innerHTML = `
                <p><strong>Nome:</strong> ${dadosAluno.nome} ${dadosAluno.sobrenome}</p>
                <p><strong>Email:</strong> ${dadosAluno.email}</p>
            `;

            // Chama a função para carregar a mensalidade
            carregarMensalidade();

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            dadosAlunoDiv.innerHTML = '<p class="mensagem-erro">Não foi possível carregar o perfil.</p>';
        }
    }

    // 3. Função para carregar os detalhes da mensalidade
    async function carregarMensalidade() {
        try {
            const responseMensalidade = await fetch(`http://localhost:3000/mensalidades/aluno/${alunoId}`);
            if (!responseMensalidade.ok) {
                if (responseMensalidade.status === 404) {
                    detalhesMensalidadeDiv.innerHTML = '<p class="mensagem-vazia">Nenhuma mensalidade pendente. Parabéns!</p>';
                    btnPagar.style.display = 'none';
                    return;
                }
                throw new Error('Erro ao buscar mensalidade.');
            }

            const mensalidade = await responseMensalidade.json();
            
            const dataVencimento = new Date(mensalidade.data_vencimento).toLocaleDateString('pt-BR');
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(mensalidade.valor);

            detalhesMensalidadeDiv.innerHTML = `
                <p><strong>Academia:</strong> ${mensalidade.academia_nome}</p>
                <p><strong>Valor:</strong> ${valorFormatado}</p>
                <p><strong>Status:</strong> <span style="color: red;">Pendente</span></p>
                <p><strong>Vencimento:</strong> ${dataVencimento}</p>
            `;
            btnPagar.style.display = 'block';

        } catch (error) {
            console.error('Erro ao carregar mensalidade:', error);
            detalhesMensalidadeDiv.innerHTML = '<p class="mensagem-erro">Não foi possível carregar a mensalidade.</p>';
            btnPagar.style.display = 'none';
        }
    }

    // 4. Lógica para o botão de pagamento
    btnPagar.addEventListener('click', async () => {
        btnPagar.textContent = 'Processando...';
        btnPagar.disabled = true;

        try {
            const response = await fetch(`http://localhost:3000/mensalidades/pagar/${alunoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Falha ao processar o pagamento.');
            }

            alert('Mensalidade paga com sucesso!');
            carregarMensalidade(); // Atualiza a seção de mensalidade
            
        } catch (error) {
            console.error('Erro no pagamento:', error);
            alert('Erro ao pagar a mensalidade. Tente novamente.');
        } finally {
            btnPagar.textContent = 'Pagar Agora';
            btnPagar.disabled = false;
        }
    });

    // 5. Adiciona a funcionalidade de Sair
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'Inicio.html';
    });
    
    // Chama a função para carregar os dados quando a página for carregada
    carregarPerfil();
});