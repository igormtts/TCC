// js/Inicio.js

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById('loginBtn');
    const cadastroBtn = document.getElementById('cadastroBtn');
    const nav = document.querySelector('.nav');

    // Recupera o usuário logado do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Verifica se há um usuário logado
    if (usuarioLogado) {
        // Oculta os botões de Login e Cadastro
        if (loginBtn) loginBtn.style.display = 'none';
        if (cadastroBtn) cadastroBtn.style.display = 'none';

        // Cria e adiciona o botão "Meu Perfil"
        const perfilLink = document.createElement('a');
        perfilLink.className = 'nav-btn';
        perfilLink.textContent = 'Meu Perfil';
        
        // Define o link do perfil com base no tipo de usuário
        if (usuarioLogado.tipo === 'aluno') {
            perfilLink.href = 'perfilAluno.html'; 
        } else if (usuarioLogado.tipo === 'academia') {
            perfilLink.href = 'perfilAcademia.html';
        }
        nav.appendChild(perfilLink);

        // Cria e adiciona o botão "Notificações"
        const notificacoesLink = document.createElement('a');
        notificacoesLink.className = 'nav-btn';
        notificacoesLink.textContent = 'Notificações';
        notificacoesLink.href = 'notificacoes.html';
        nav.appendChild(notificacoesLink);

        // Cria e adiciona o botão "Sair"
        const sairLink = document.createElement('a');
        sairLink.href = '#';
        sairLink.className = 'nav-btn logout-btn';
        sairLink.textContent = 'Sair';
        nav.appendChild(sairLink);

        // Adiciona o evento de clique para o botão "Sair"
        sairLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.reload(); 
        });

    } else {
        // Se não houver usuário logado, garante que os botões de Login e Cadastro estão visíveis
        if (loginBtn) loginBtn.style.display = 'block';
        if (cadastroBtn) cadastroBtn.style.display = 'block';
    }

    // Código de animação das seções (opcional, mas bom manter)
    const sections = document.querySelectorAll("section");
    sections.forEach((section, index) => {
        section.style.opacity = 0;
        setTimeout(() => {
            section.style.opacity = 1;
        }, 500 * index);
    });
});