// js/notificacoes.js

document.addEventListener('DOMContentLoaded', () => {
    const listaNotificacoes = document.getElementById('lista-notificacoes');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || usuarioLogado.tipo !== 'aluno') {
        window.location.href = 'Login.html'; // Redireciona se não for um aluno logado
        return;
    }

    const alunoId = usuarioLogado.id;

    async function carregarNotificacoes() {
        try {
            const response = await fetch(`http://localhost:3000/notificacoes/aluno/${alunoId}`);

            if (!response.ok) {
                throw new Error('Erro ao carregar notificações.');
            }

            const notificacoes = await response.json();
            listaNotificacoes.innerHTML = ''; // Limpa o "Carregando..."

            if (notificacoes.length > 0) {
                notificacoes.forEach(notificacao => {
                    const card = document.createElement('div');
                    card.className = 'notificacao-card';
                    card.innerHTML = `
                        <h4>${notificacao.titulo}</h4>
                        <p>${notificacao.conteudo}</p>
                    `;
                    listaNotificacoes.appendChild(card);
                });
            } else {
                listaNotificacoes.innerHTML = '<p class="mensagem-vazia">Nenhuma notificação por enquanto.</p>';
            }

        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            listaNotificacoes.innerHTML = '<p class="mensagem-erro">Não foi possível carregar as notificações.</p>';
        }
    }
    
    // Adiciona o evento de logout para o botão "Sair"
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'Inicio.html';
        });
    }

    carregarNotificacoes();
});