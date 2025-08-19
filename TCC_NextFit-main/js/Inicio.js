document.addEventListener("DOMContentLoaded", () => {
    // Pega os botões da navegação
    const loginBtn = document.getElementById('loginBtn');
    const cadastroBtn = document.getElementById('cadastroBtn');
    const nav = document.querySelector('.nav');

    // 1. Verifica se há um usuário logado no localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (usuarioLogado) {
        // Se houver um usuário logado, esconda os botões de Login e Cadastro
        if (loginBtn) loginBtn.style.display = 'none';
        if (cadastroBtn) cadastroBtn.style.display = 'none';

        // Cria e adiciona o link de Perfil
        const perfilLink = document.createElement('a');
        perfilLink.className = 'nav-btn';
        perfilLink.textContent = 'Meu Perfil';
        
        // Define o link correto com base no tipo de usuário
        if (usuarioLogado.tipo === 'aluno') {
            perfilLink.href = 'perfilAluno.html'; 
        } else if (usuarioLogado.tipo === 'academia') {
            perfilLink.href = 'perfilAcademia.html';
        }
        nav.appendChild(perfilLink);

        // Cria e adiciona o link de Sair
        const sairLink = document.createElement('a');
        sairLink.href = '#';
        sairLink.className = 'nav-btn logout-btn';
        sairLink.textContent = 'Sair';
        nav.appendChild(sairLink);

        // Adiciona a funcionalidade de Sair
        sairLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.reload(); 
        });

    } else {
        // Se não houver usuário logado, garanta que os botões de login e cadastro estão visíveis
        if (loginBtn) loginBtn.style.display = 'block';
        if (cadastroBtn) cadastroBtn.style.display = 'block';
    }

    // Código de animação (mantido)
    const sections = document.querySelectorAll("section");
    sections.forEach((section, index) => {
        section.style.opacity = 0;
        section.style.transition = "opacity 0.8s ease";
        setTimeout(() => {
            section.style.opacity = 1;
        }, index * 300);
    });
});