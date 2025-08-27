// js/perfilAcademia.js

document.addEventListener('DOMContentLoaded', () => {
    const detalhesAcademiaDiv = document.getElementById('detalhesAcademia');
    const listaAlunosUl = document.getElementById('listaAlunos');
    const logoutBtn = document.querySelector('.logout');
    
    // Elementos do modal de gerenciamento (se você os tiver no seu HTML)
    const closeBtn = document.querySelector('.close-btn');
    const alunoNomeModal = document.getElementById('alunoNomeModal');
    const novaDataVencimentoInput = document.getElementById('novaDataVencimento');
    const btnSalvarData = document.getElementById('btnSalvarData');
    const gerenciamentoModal = document.getElementById('gerenciamentoModal');

    // **NOVO**: Garante que o modal comece escondido
    if (gerenciamentoModal) {
        gerenciamentoModal.classList.add('escondido');
    }

    // ... sua função carregarPerfil()

    // Onde você abre o modal (por exemplo, no evento de clique do botão "Gerenciar Mensalidade")
    listaAlunosUl.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-gerenciar-mensalidade')) {
            // ... seu código para pegar o ID e o nome do aluno ...

            if (gerenciamentoModal) {
                // **CORREÇÃO**: Remove a classe para mostrar o modal
                gerenciamentoModal.classList.remove('escondido');
            }
        }
    });

    // Onde você fecha o modal (por exemplo, no evento de clique do "x" ou fora do modal)
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (gerenciamentoModal) {
                // **CORREÇÃO**: Adiciona a classe para fechar o modal
                gerenciamentoModal.classList.add('escondido');
            }
        });
    }

    if (gerenciamentoModal) {
        window.addEventListener('click', (e) => {
            if (e.target === gerenciamentoModal) {
                if (gerenciamentoModal) {
                    // **CORREÇÃO**: Adiciona a classe para fechar o modal
                    gerenciamentoModal.classList.add('escondido');
                }
            }
        });
    }

    

    // Elemento para o dropdown de notificações
    const tipoNotificacaoSelect = document.getElementById('tipoNotificacao');

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || usuarioLogado.tipo !== 'academia') {
        window.location.href = 'Login.html';
        return;
    }

    const academiaId = usuarioLogado.id;
async function carregarPerfil() {
    try {
        console.log("Tentando carregar perfil para o ID da academia:", academiaId);

        // Requisição para buscar os dados da academia
        const responseAcademia = await fetch(`http://localhost:3000/perfil/academia/${academiaId}`);
        
        // **NOVO**: Verifica a resposta antes de tentar ler o JSON
        if (!responseAcademia.ok) {
            console.error('Erro na requisição. Status:', responseAcademia.status, 'Texto do erro:', await responseAcademia.text());
            detalhesAcademiaDiv.innerHTML = '<p class="mensagem-erro">Não foi possível carregar os dados da academia.</p>';
            return;
        }

        const dadosAcademia = await responseAcademia.json();
        console.log("Dados da academia recebidos:", dadosAcademia); // NOVO: Loga os dados recebidos

        // Exibe os dados da academia
        if (detalhesAcademiaDiv) {
            detalhesAcademiaDiv.innerHTML = `
                <p><strong>Nome:</strong> ${dadosAcademia.nome || 'Não informado'}</p>
                <p><strong>Email:</strong> ${dadosAcademia.email || 'Não informado'}</p>
                <p><strong>Cidade:</strong> ${dadosAcademia.cidade || 'Não informado'}</p>
                <p><strong>Endereço:</strong> ${dadosAcademia.rua || 'Não informada'}, ${dadosAcademia.numero || 'S/N'}, ${dadosAcademia.bairro || 'Não informado'}</p>
                <p><strong>Telefone:</strong> ${dadosAcademia.telefone || 'Não informado'}</p>
                <p><strong>Horário de Atendimento:</strong> ${dadosAcademia.horario_atendimento || 'Não informado'}</p>
            `;
        }
        console.log("Perfil da academia carregado com sucesso.");

        // Requisição para buscar a lista de alunos
        const responseAlunos = await fetch(`http://localhost:3000/perfil/academia/alunos/${academiaId}`);
        if (!responseAlunos.ok) {
            console.error('Erro ao buscar lista de alunos. Status:', responseAlunos.status, 'Texto do erro:', await responseAlunos.text());
            listaAlunosUl.innerHTML = '<p class="mensagem-erro">Não foi possível carregar os alunos.</p>';
            return;
        }
        const alunos = await responseAlunos.json();
        console.log("Dados de alunos recebidos:", alunos);

        // Exibe a lista de alunos na UL
        if (listaAlunosUl) {
            listaAlunosUl.innerHTML = ''; 
            if (alunos.length > 0) {
                alunos.forEach(aluno => {
                    const li = document.createElement('li');
                    li.className = 'aluno-item';
                    li.innerHTML = `
                        <div>
                            <p><strong>Nome:</strong> ${aluno.nome} ${aluno.sobrenome}</p>
                            <p><strong>Email:</strong> ${aluno.email}</p>
                        </div>
                        <button class="btn-gerenciar-mensalidade" data-aluno-id="${aluno.id}" data-aluno-nome="${aluno.nome} ${aluno.sobrenome}">Gerenciar Mensalidade</button>
                    `;
                    listaAlunosUl.appendChild(li);
                });
            } else {
                listaAlunosUl.innerHTML = '<p class="mensagem-vazia">Nenhum aluno cadastrado ainda.</p>';
            }
        }
        console.log("Lista de alunos carregada com sucesso.");

        // Limpa e popula o dropdown de notificações
        const tipoNotificacaoSelect = document.getElementById('tipoNotificacao');
        if (tipoNotificacaoSelect) {
            while (tipoNotificacaoSelect.options.length > 1) {
                tipoNotificacaoSelect.remove(1);
            }
            if (alunos.length > 0) {
                alunos.forEach(aluno => {
                    const option = document.createElement('option');
                    option.value = aluno.id;
                    option.textContent = `${aluno.nome} ${aluno.sobrenome}`;
                    tipoNotificacaoSelect.appendChild(option);
                });
            }
        }
        console.log("Dropdown de notificações populado com sucesso.");

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (detalhesAcademiaDiv) {
            detalhesAcademiaDiv.innerHTML = '<p class="mensagem-erro">Não foi possível carregar os dados. Verifique a conexão com o servidor.</p>';
        }
    }
}
carregarPerfil();
});