// js/Login.js
document.addEventListener("DOMContentLoaded", () => {
    const tipoLogin = document.getElementById("tipoLogin");
    const loginForm = document.getElementById("loginForm");
    const mensagem = document.getElementById("mensagem");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const tipo = tipoLogin.value;
        const emailOuNome = document.getElementById("emailOuNome").value.trim();
        const senha = document.getElementById("senhaLogin").value.trim();

        mensagem.className = "mensagem";
        mensagem.textContent = "";

        if (!emailOuNome || !senha) {
            mensagem.textContent = "Preencha todos os campos.";
            mensagem.classList.add("erro");
            return;
        }

        try {
            let url = '';
            let bodyData = {};

            if (tipo === "aluno") {
                url = 'http://localhost:3000/login/aluno';
                bodyData = { email: emailOuNome, senha: senha };
            } else if (tipo === "academia") {
                url = 'http://localhost:3000/login/academia';
                bodyData = { nome: emailOuNome, senha: senha };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();

            if (response.ok) {
                let usuarioLogado;
                if (tipo === "aluno") {
                    usuarioLogado = {
                        tipo: "aluno",
                        id: data.aluno.id,
                        nome: data.aluno.nome,
                        sobrenome: data.aluno.sobrenome,
                        email: data.aluno.email
                    };
                } else if (tipo === "academia") {
                    usuarioLogado = {
                        tipo: "academia",
                        id: data.academia.id,
                        nome: data.academia.nome,
                        email: data.academia.email
                    };
                }

                if (usuarioLogado) {
                    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
                    
                    mensagem.textContent = data.message;
                    mensagem.classList.add("sucesso");
                    
                    setTimeout(() => {
                        window.location.href = "Inicio.html";
                    }, 1000);
                } else {
                    mensagem.textContent = "Erro ao processar dados de usuário.";
                    mensagem.classList.add("erro");
                }

            } else {
                mensagem.textContent = data.message || "Erro no login. Verifique suas credenciais.";
                mensagem.classList.add("erro");
            }

        } catch (error) {
            console.error("Erro na requisição de login:", error);
            mensagem.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
            mensagem.classList.add("erro");
        }
    });
});