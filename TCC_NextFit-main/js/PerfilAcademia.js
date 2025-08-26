// js/perfilAcademia.js

document.addEventListener('DOMContentLoaded', () => {
    const detalhesAcademiaDiv = document.getElementById('detalhesAcademia');
    const listaAlunosUl = document.getElementById('listaAlunos');
    const logoutBtn = document.querySelector('.logout');
    
    // Elementos do modal de gerenciamento (se você os tiver no seu HTML)
    const gerenciamentoModal = document.getElementById('gerenciamentoModal');
    const closeBtn = document.querySelector('.close-btn');
    const alunoNomeModal = document.getElementById('alunoNomeModal');
    const novaDataVencimentoInput = document.getElementById('novaDataVencimento');
    const btnSalvarData = document.getElementById('btnSalvarData');

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || usuarioLogado.tipo !== 'academia') {
        window.location.href = 'Login.html';
        return;
    }

    const academiaId = usuarioLogado.id;

    async function carregarPerfil() {
        try {
            // Requisição para buscar os dados da academia
            const responseAcademia = await fetch(`http://localhost:3000/perfil/academia/${academiaId}`);
            if (!responseAcademia.ok) {
                // Se a requisição falhar, exibe o status e o texto do erro no console
                console.error('Erro ao buscar dados da academia. Status:', responseAcademia.status, 'Texto do erro:', await responseAcademia.text());
                throw new Error('Erro ao buscar dados da academia.');
            }
            const dadosAcademia = await responseAcademia.json();

            detalhesAcademiaDiv.innerHTML = `
                <p><strong>Nome:</strong> ${dadosAcademia.nome}</p>
                <p><strong>Email:</strong> ${dadosAcademia.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> ${dadosAcademia.telefone || 'Não informado'}</p>
            `;

            // Requisição para buscar a lista de alunos
            const responseAlunos = await fetch(`http://localhost:3000/perfil/academia/alunos/${academiaId}`);
            if (!responseAlunos.ok) {
                 // Se a requisição falhar, exibe o status e o texto do erro no console
                console.error('Erro ao buscar a lista de alunos. Status:', responseAlunos.status, 'Texto do erro:', await responseAlunos.text());
                throw new Error('Erro ao buscar a lista de alunos.');
            }
            const alunos = await responseAlunos.json();

            listaAlunosUl.innerHTML = '';
            if (alunos.length > 0) {
                alunos.forEach(aluno => {
                    const alunoItem = document.createElement('li');
                    alunoItem.className = 'aluno-item';
                    alunoItem.innerHTML = `
                        <strong>${aluno.nome} ${aluno.sobrenome}</strong>
                        <span>Email: ${aluno.email}</span>
                        <span>Vencimento: ${aluno.data_vencimento ? new Date(aluno.data_vencimento).toLocaleDateString('pt-BR') : 'Não definido'}</span>
                        <button class="gerenciar-btn" data-aluno-id="${aluno.id}" data-aluno-nome="${aluno.nome}">Gerenciar</button>
                    `;
                    listaAlunosUl.appendChild(alunoItem);
                });

                document.querySelectorAll('.gerenciar-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const alunoId = e.target.dataset.alunoId;
                        const alunoNome = e.target.dataset.alunoNome;
                        alunoNomeModal.textContent = alunoNome;
                        gerenciamentoModal.style.display = 'block';
                        btnSalvarData.dataset.alunoId = alunoId;
                    });
                });

            } else {
                listaAlunosUl.innerHTML = '<li class="mensagem">Nenhum aluno cadastrado.</li>';
            }

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            detalhesAcademiaDiv.innerHTML = '<p class="mensagem erro">Não foi possível carregar o perfil da academia.</p>';
        }
    }
    
    // Adiciona o listener para o botão de salvar data do modal
    if (btnSalvarData) {
        btnSalvarData.addEventListener('click', async () => {
            const alunoId = btnSalvarData.dataset.alunoId;
            const novaDataVencimento = novaDataVencimentoInput.value;

            if (!novaDataVencimento) {
                alert('Por favor, selecione uma nova data.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/mensalidades/atualizar-vencimento', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        alunoId: alunoId,
                        novaDataVencimento: novaDataVencimento
                    })
                });

                if (!response.ok) {
                    throw new Error('Falha ao atualizar a data.');
                }

                alert('Data de vencimento atualizada com sucesso!');
                gerenciamentoModal.style.display = 'none';
                carregarPerfil();
                
            } catch (error) {
                console.error('Erro ao salvar nova data:', error);
                alert('Erro ao salvar a nova data de vencimento.');
            }
        });
    }

    // Adiciona o listener para o botão de fechar o modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            gerenciamentoModal.style.display = 'none';
        });
    }

    // Adiciona o listener para fechar o modal clicando fora dele
    if (gerenciamentoModal) {
        window.addEventListener('click', (e) => {
            if (e.target === gerenciamentoModal) {
                gerenciamentoModal.style.display = 'none';
            }
        });
    }
    
    // Adiciona a funcionalidade de Sair
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'Inicio.html';
        });
    }
    
    carregarPerfil();
});