// js/perfilAcademia.js

document.addEventListener('DOMContentLoaded', () => {
    // Seleção de elementos no início para melhor organização
    const detalhesAcademiaDiv = document.getElementById('detalhesAcademia');
    const profileName = document.getElementById('profileName');
    const listaAlunosUl = document.getElementById('listaAlunos');
    const logoutBtn = document.querySelector('.logout');
    const btnEditarPerfil = document.getElementById('btnEditarPerfil');
    const formEditarPerfil = document.getElementById('form-editar-perfil');
    const editNomeAcademia = document.getElementById('editNomeAcademia');
    const editEmailAcademia = document.getElementById('editEmailAcademia');
    const editTelefoneAcademia = document.getElementById('editTelefoneAcademia');
    const btnCancelar = document.querySelector('.btn-cancelar');

    // Elementos do formulário de notificação
    const formNotificacao = document.getElementById('formNotificacao');
    const tituloNotificacaoInput = document.getElementById('tituloNotificacao');
    const conteudoNotificacaoTextarea = document.getElementById('conteudoNotificacao');
    const tipoNotificacaoSelect = document.getElementById('tipoNotificacao');

    // Elementos do modal de mensalidade
    const modal = document.getElementById('gerenciarMensalidadeModal');
    const closeBtn = document.querySelector('.close-btn');
    const novaDataInput = document.getElementById('novaDataInput');
    const salvarMensalidadeBtn = document.getElementById('salvarMensalidadeBtn');
    const modalAlunoNome = document = document.getElementById('modalAlunoNome');

    // Declara a variável da instância do Flatpickr
    let flatpickrInstance;

    // Inicializa o Flatpickr no input de data
    if (novaDataInput && typeof flatpickr !== 'undefined') {
        flatpickrInstance = flatpickr(novaDataInput, {
            dateFormat: "d/m/Y",
            locale: "pt",
            altInput: false,
            altFormat: "d/m/Y",
            onReady: function(selectedDates, dateStr, instance) {
                // Adiciona um listener para o evento 'input' para aplicar a máscara manual
                instance.element.addEventListener('input', function(e) {
                    const value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
                    let formattedValue = '';
                    if (value.length > 0) {
                        formattedValue += value.substring(0, 2);
                    }
                    if (value.length >= 3) {
                        formattedValue += '/' + value.substring(2, 4);
                    }
                    if (value.length >= 5) {
                        formattedValue += '/' + value.substring(4, 8);
                    }
                    e.target.value = formattedValue;
                });
            }
        });
    }

    let isEditing = false;
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || usuarioLogado.tipo !== 'academia') {
        window.location.href = 'Login.html';
        return;
    }

    const academiaId = usuarioLogado.id;

    // --- Funções de Lógica ---
    const handleEditarClick = () => {
        isEditing = !isEditing;
        if (formEditarPerfil) {
            formEditarPerfil.style.display = isEditing ? 'flex' : 'none';
        }
        if (btnEditarPerfil) {
            btnEditarPerfil.textContent = isEditing ? 'Cancelar Edição' : 'Editar Perfil';
        }

        if (isEditing) {
            const nomeElement = detalhesAcademiaDiv.querySelector('[data-nome]');
            const emailElement = detalhesAcademiaDiv.querySelector('[data-email]');
            const telefoneElement = detalhesAcademiaDiv.querySelector('[data-telefone]');
            
            if (nomeElement && editNomeAcademia) editNomeAcademia.value = nomeElement.dataset.nome;
            if (emailElement && editEmailAcademia) editEmailAcademia.value = emailElement.dataset.email;
            if (telefoneElement && editTelefoneAcademia) editTelefoneAcademia.value = telefoneElement.dataset.telefone;
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const novosDados = {
            nome: editNomeAcademia.value,
            email: editEmailAcademia.value,
            telefone: editTelefoneAcademia.value
        };

        try {
            const response = await fetch(`http://localhost:3000/perfil/academia/${academiaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novosDados)
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar o perfil.');
            }

            alert('Perfil atualizado com sucesso!');
            isEditing = false;
            if (formEditarPerfil) formEditarPerfil.style.display = 'none';
            if (btnEditarPerfil) btnEditarPerfil.textContent = 'Editar Perfil';
            carregarPerfil();
        } catch (error) {
            console.error('Erro ao salvar o perfil:', error);
            alert('Erro ao salvar as alterações do perfil.');
        }
    };

    const handleNotificacaoSubmit = async (e) => {
        e.preventDefault();
        
        const alunoId = tipoNotificacaoSelect.value === 'geral' ? null : tipoNotificacaoSelect.value;
        const tipo = tipoNotificacaoSelect.value === 'geral' ? 'geral' : 'privada';

        const notificacao = {
            id_academia: academiaId,
            aluno_id: alunoId,
            titulo: tituloNotificacaoInput.value,
            conteudo: conteudoNotificacaoTextarea.value,
            tipo: tipo
        };

        try {
            const response = await fetch('http://localhost:3000/notificacoes/enviar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificacao)
            });

            if (!response.ok) {
                const erroData = await response.json();
                throw new Error(erroData.message || 'Falha ao enviar a notificação.');
            }

            alert('Notificação enviada com sucesso!');
            formNotificacao.reset();
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            alert(`Erro ao enviar a notificação: ${error.message}`);
        }
    };
    
    const atualizarMensalidade = async (alunoId, novaData) => {
        console.log(`Atualizando mensalidade do aluno ${alunoId} para a data ${novaData}...`);
    };
    
    async function carregarPerfil() {
        try {
            const responseAcademia = await fetch(`http://localhost:3000/perfil/academia/${academiaId}`);
            if (!responseAcademia.ok) {
                throw new Error('Não foi possível carregar os dados da academia.');
            }
            const dadosAcademia = await responseAcademia.json();
            
            if (profileName) profileName.textContent = dadosAcademia.nome;
            if (detalhesAcademiaDiv) {
                detalhesAcademiaDiv.innerHTML = `
                    <p data-nome="${dadosAcademia.nome}"><strong>Nome:</strong> ${dadosAcademia.nome}</p>
                    <p data-email="${dadosAcademia.email}"><strong>Email:</strong> ${dadosAcademia.email}</p>
                    <p data-telefone="${dadosAcademia.telefone}"><strong>Telefone:</strong> ${dadosAcademia.telefone}</p>
                `;
            }

            const responseAlunos = await fetch(`http://localhost:3000/perfil/academia/alunos/${academiaId}`);
            if (!responseAlunos.ok) {
                throw new Error('Não foi possível carregar os alunos.');
            }
            const alunos = await responseAlunos.json();

            renderizarAlunos(alunos);
            popularDropdownNotificacoes(alunos);

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            if (detalhesAcademiaDiv) {
                detalhesAcademiaDiv.innerHTML = `<p class="mensagem-erro">Não foi possível carregar os dados da academia.</p>`;
            }
            if (listaAlunosUl) {
                listaAlunosUl.innerHTML = '<p class="mensagem-erro">Não foi possível carregar os alunos.</p>';
            }
        }
    }

    const renderizarAlunos = (alunos) => {
        if (!listaAlunosUl) return;
        
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
    };
    
    const popularDropdownNotificacoes = (alunos) => {
        if (!tipoNotificacaoSelect) return;
        
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
    };
    
    // --- Escutadores de Eventos ---

    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener('click', handleEditarClick);
    }
    
    if (formEditarPerfil) {
        formEditarPerfil.addEventListener('submit', handleFormSubmit);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', (e) => {
            e.preventDefault();
            handleEditarClick();
        });
    }

    if (formNotificacao) {
        formNotificacao.addEventListener('submit', handleNotificacaoSubmit);
    }

    if (listaAlunosUl) {
        listaAlunosUl.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-gerenciar-mensalidade')) {
                const alunoId = e.target.dataset.alunoId;
                const alunoNome = e.target.dataset.alunoNome;
                
                modalAlunoNome.textContent = `Gerenciar Mensalidade de ${alunoNome}`;
                modal.style.display = 'block';

                if (flatpickrInstance) {
                    flatpickrInstance.clear();
                }

                salvarMensalidadeBtn.dataset.alunoId = alunoId;
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if (salvarMensalidadeBtn) {
        salvarMensalidadeBtn.addEventListener('click', () => {
            const alunoId = salvarMensalidadeBtn.dataset.alunoId;
            const novaData = novaDataInput.value;
            
            if (!novaData || novaData.length !== 10) {
                alert('Por favor, selecione ou digite uma data no formato DD/MM/AAAA.');
                return;
            }
            
            atualizarMensalidade(alunoId, novaData);
            
            modal.style.display = 'none';
            novaDataInput.value = '';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Início da aplicação
    carregarPerfil();
});