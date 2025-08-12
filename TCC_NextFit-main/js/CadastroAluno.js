document.addEventListener("DOMContentLoaded", () => {
    const alunoForm = document.getElementById("alunoForm");
    const mensagem = document.getElementById("mensagem");
    const selectAcademia = document.getElementById("academia");

    console.log("DOM Content Loaded - Iniciando script do CadastroAluno.js.");

    // Função para carregar academias do backend
    async function carregarAcademiasNoSelect() {
        selectAcademia.innerHTML = '<option value="">Carregando academias...</option>';
        selectAcademia.disabled = true; // Desabilita enquanto carrega

        try {
            const response = await fetch('http://localhost:3000/academias'); // Sua rota para listar academias
            if (!response.ok) {
                throw new Error('Erro ao buscar academias do servidor.');
            }
            const academias = await response.json(); // Recebe o array de academias

            selectAcademia.innerHTML = '<option value="">Selecione uma academia</option>'; // Opção padrão
            if (academias.length > 0) {
                academias.forEach((academia) => {
                    const option = document.createElement("option");
                    option.value = academia.id; // Use o ID da academia do banco de dados
                    option.textContent = academia.nome; // Use o nome da academia do banco de dados
                    selectAcademia.appendChild(option);
                });
                selectAcademia.disabled = false; // Habilita o select
            } else {
                selectAcademia.innerHTML = '<option value="">Nenhuma academia cadastrada. Cadastre uma primeiro!</option>';
                selectAcademia.disabled = true;
            }
            console.log("Select de academias atualizado com dados do backend.");
        } catch (error) {
            console.error('Erro ao carregar academias:', error);
            selectAcademia.innerHTML = '<option value="">Erro ao carregar academias.</option>';
            selectAcademia.disabled = true;
            mensagem.innerText = "Erro ao carregar lista de academias. Verifique o servidor.";
            mensagem.classList.add("erro");
        }
    }

    // Carrega academias ao carregar a página
    carregarAcademiasNoSelect();

    // Evento de Submit do Formulário de Aluno
    alunoForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        console.log("Evento 'submit' do formulário de aluno disparado.");

        mensagem.innerText = ""; // Limpa mensagens anteriores
        mensagem.classList.remove("sucesso", "erro");

        const nome = document.getElementById("nomeAluno").value.trim();
        const sobrenome = document.getElementById("sobrenomeAluno").value.trim();
        const email = document.getElementById("emailAluno").value.trim();
        const senhaAluno = document.getElementById("senhaAluno").value.trim();
        const confirmaSenhaAluno = document.getElementById("confirmaSenhaAluno").value.trim();
        const academiaId = selectAcademia.value; // Pega o ID da academia selecionada

        // Validações básicas
        if (!nome || !sobrenome || !email || !senhaAluno || !confirmaSenhaAluno || !academiaId) {
            mensagem.innerText = "Por favor, preencha todos os campos e selecione uma academia.";
            mensagem.classList.add("erro");
            return;
        }

        // --- NOVA VALIDAÇÃO ADICIONADA AQUI ---
        if (senhaAluno.length < 6) {
            mensagem.innerText = "A senha deve ter no mínimo 6 caracteres.";
            mensagem.classList.add("erro");
            return;
        }
        // --- FIM DA NOVA VALIDAÇÃO ---

        if (senhaAluno !== confirmaSenhaAluno) {
            mensagem.innerText = "As senhas não coincidem.";
            mensagem.classList.add("erro");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cadastro/aluno', { // Sua rota para cadastrar alunos
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nomeAluno: nome,
                    sobrenomeAluno: sobrenome,
                    emailAluno: email,
                    senhaAluno: senhaAluno,
                    academiaId: academiaId
                })
            });

            const data = await response.json();

            if (response.ok) {
                mensagem.innerText = data.message;
                mensagem.classList.add("sucesso");
                alunoForm.reset(); // Limpa o formulário
                selectAcademia.value = ""; // Reseta o select

                // Opcional: Redirecionar após sucesso, se desejar
                setTimeout(() => {
                    window.location.href = "Login.html"; // Redireciona para a página inicial
                }, 1500);

            } else {
                mensagem.innerText = data.message || "Erro ao cadastrar aluno.";
                mensagem.classList.add("erro");
            }
        } catch (error) {
            console.error('Erro de rede ou servidor:', error);
            mensagem.innerText = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
            mensagem.classList.add("erro");
        }
    });
});