// js/perfilAluno.js

document.addEventListener('DOMContentLoaded', () => {
    const dadosAlunoDiv = document.getElementById('dadosAluno');
    const detalhesMensalidadeDiv = document.getElementById('detalhesMensalidade');
    const btnPagar = document.getElementById('btnPagar');
    const logoutBtn = document.querySelector('.logout-btn');
    const profileName = document.getElementById('profileName');
    const btnEditarPerfil = document.getElementById('btnEditarPerfil');
    const formEditarPerfil = document.getElementById('form-editar-perfil');
    const editNomeAluno = document.getElementById('editNomeAluno');
    const editSobrenomeAluno = document.getElementById('editSobrenomeAluno');
    const editEmailAluno = document.getElementById('editEmailAluno');
    const btnCancelar = document.querySelector('.btn-cancelar');


    // 1. Pega os dados do aluno do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || usuarioLogado.tipo !== 'aluno') {
        window.location.href = 'Login.html';
        return;
    }

    const alunoId = usuarioLogado.id;

    // 2. Função para carregar os dados da mensalidade do aluno
    async function carregarMensalidade() {
        try {
            const responseMensalidade = await fetch(`http://localhost:3000/mensalidades/${alunoId}`);

            if (!responseMensalidade.ok) {
                throw new Error('Erro ao buscar dados da mensalidade.');
            }

            const mensalidade = await responseMensalidade.json();

            // Exibe os dados da mensalidade
            if (mensalidade.proximoVencimento) {
                detalhesMensalidadeDiv.innerHTML = `
                    <p><strong>Vencimento:</strong> ${new Date(mensalidade.proximoVencimento).toLocaleDateString()}</p>
                `;
                btnPagar.style.display = 'block';
            } else {
                detalhesMensalidadeDiv.innerHTML = '<p>Nenhuma mensalidade cadastrada.</p>';
                btnPagar.style.display = 'none';
            }

        } catch (error) {
            console.error('Erro ao carregar mensalidade:', error);
            detalhesMensalidadeDiv.innerHTML = '<p class="mensagem-erro">Não foi possível carregar a mensalidade.</p>';
            btnPagar.style.display = 'none';
        }
    }

    // 3. Função para carregar os dados do perfil do aluno
    async function carregarPerfil() {
        try {
            // Requisição para a rota de dados do aluno
            const responsePerfil = await fetch(`http://localhost:3000/perfil/aluno/${alunoId}`);
            if (!responsePerfil.ok) {
                throw new Error('Erro ao buscar dados do aluno.');
            }
            const dadosAluno = await responsePerfil.json();

            // Exibe os dados do aluno
             profileName.textContent = dadosAluno.nome + ' ' + dadosAluno.sobrenome;
            dadosAlunoDiv.innerHTML = `
                <p><strong>Nome:</strong> ${dadosAluno.nome} ${dadosAluno.sobrenome}</p>
                <p><strong>Email:</strong> ${dadosAluno.email}</p>
            `;

            // Chama a função
            carregarMensalidade();
        } catch (error) {
            console.error('Erro ao carregar perfil do aluno:', error);
            dadosAlunoDiv.innerHTML = '<p class="mensagem-erro">Não foi possível carregar os dados do perfil.</p>';
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
    // Função para alternar o formulário de edição
    btnEditarPerfil.addEventListener('click', () => {
        const isEditing = formEditarPerfil.style.display === 'flex';
        formEditarPerfil.style.display = isEditing ? 'none' : 'flex';
        btnEditarPerfil.textContent = isEditing ? 'Editar Perfil' : 'Cancelar Edição';

        // Preenche o formulário com os dados atuais
        if (!isEditing) {
            const dadosAtuais = dadosAlunoDiv.querySelectorAll('p');
            editNomeAluno.value = dadosAtuais[0].textContent.replace('Nome Completo: ', '').split(' ')[0];
            editSobrenomeAluno.value = dadosAtuais[0].textContent.replace('Nome Completo: ', '').split(' ')[1];
            editEmailAluno.value = dadosAtuais[1].textContent.replace('Email: ', '');
        }
    });

    btnCancelar.addEventListener('click', (e) => {
        e.preventDefault();
        formEditarPerfil.style.display = 'none';
        btnEditarPerfil.textContent = 'Editar Perfil';
    });

    // Função para salvar as alterações do perfil
    formEditarPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novosDados = {
            nome: editNomeAluno.value,
            sobrenome: editSobrenomeAluno.value,
            email: editEmailAluno.value,
        };

        try {
            const response = await fetch(`http://localhost:3000/perfil/aluno/${alunoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novosDados)
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar o perfil.');
            }

            alert('Perfil atualizado com sucesso!');
            formEditarPerfil.style.display = 'none';
            carregarPerfil(); // Recarrega os dados do perfil
        } catch (error) {
            console.error('Erro ao salvar o perfil:', error);
            alert('Erro ao salvar as alterações do perfil.');
        }
    });


    carregarPerfil();
});