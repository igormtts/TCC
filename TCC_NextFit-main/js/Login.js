// js/Login.js
document.addEventListener("DOMContentLoaded", () => {
    const tipoLogin = document.getElementById("tipoLogin");
    const loginForm = document.getElementById("loginForm");
    const mensagem = document.getElementById("mensagem");

    loginForm.addEventListener("submit", async (e) => { // Adicionado 'async' aqui
        e.preventDefault();
        const tipo = tipoLogin.value;
        const emailOuNome = document.getElementById("emailOuNome").value.trim(); // Corrigido o ID aqui
        const senha = document.getElementById("senhaLogin").value.trim();
        mensagem.className = "mensagem"; // Limpa classes de mensagem anteriores
        mensagem.textContent = ""; // Limpa texto de mensagem anterior

        if (!emailOuNome || !senha) {
            mensagem.textContent = "Preencha todos os campos.";
            mensagem.classList.add("erro");
            return;
        }

        try {
            let url = '';
            let bodyData = {};

            if (tipo === "aluno") {
                url = 'http://localhost:3000/login/aluno'; // URL para login de aluno
                bodyData = { email: emailOuNome, senha: senha }; // Backend espera 'email' e 'senha'
            } else if (tipo === "academia") {
                url = 'http://localhost:3000/login/academia';
                bodyData = { nome: emailOuNome, senha: senha }; // Backend espera 'nome' e 'senha'
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json(); // Tenta parsear a resposta JSON

            // No seu arquivo js/Login.js
            // Dentro da função do listener para o formulário
            // Após a linha 'const data = await response.json();'

            // No seu arquivo js/Login.js
            // Dentro da função do listener para o formulário
            // Após a linha 'const data = await response.json();'

            if (response.ok) {
                // Adicione esta verificação para garantir que o tipo de usuário é salvo
                const tipo = tipoLogin.value;
                let usuarioDados = {};

                if (tipo === "aluno") {
                    usuarioDados = { ...data.aluno, tipo: 'aluno' };
                } else if (tipo === "academia") {
                    usuarioDados = { ...data.academia, tipo: 'academia' };
                }

                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioDados));

                mensagem.textContent = data.message;
                mensagem.classList.add("sucesso");

                setTimeout(() => {
                    // Redireciona para a página inicial, que agora será dinâmica
                    window.location.href = "Inicio.html";
                }, 1500);

            } else {
            }
          
        { 
            mensagem.textContent = data.message || "Erro no login.";
            mensagem.classList.add("erro");
        }

    } catch (error) {
        console.error("Erro na requisição de login:", error);
        mensagem.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
        mensagem.classList.add("erro");
    }
});
});