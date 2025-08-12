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

            if (response.ok) { // Se a resposta for um status 2xx (sucesso)
                mensagem.textContent = data.message;
                mensagem.classList.add("sucesso");

                // Armazena informações do usuário logado no localStorage
                // Adapte os campos conforme o que seu backend retorna
                if (tipo === "aluno") {
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        tipo: "aluno",
                        id: data.aluno.id,
                        nome: data.aluno.nome,
                        sobrenome: data.aluno.sobrenome,
                        email: data.aluno.email
                    }));
                } else if (tipo === "academia") {
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        tipo: "academia",
                        id: data.academia.id,
                        nome: data.academia.nome,
                        cidade: data.academia.cidade, // Adapte conforme o retorno do backend
                        telefone: data.academia.telefone // Adapte conforme o retorno do backend
                    }));
                }

                setTimeout(() => window.location.href = "Inicio.html", 1500); // Redireciona após sucesso

            } else { // Se a resposta for um status de erro (4xx, 5xx)
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