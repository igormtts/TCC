// js/CadastroAluno.js

document.addEventListener("DOMContentLoaded", () => {
    const alunoForm = document.getElementById("alunoForm");
    const selectAcademia = document.getElementById("academia");

    console.log("DOM Content Loaded - Iniciando script do CadastroAluno.js.");

    // Função para carregar academias do backend
    async function carregarAcademiasNoSelect() {
        selectAcademia.innerHTML = '<option value="">Carregando academias...</option>';
        selectAcademia.disabled = true; // Desabilita enquanto carrega

        try {
            const response = await fetch('http://localhost:3000/academias');
            if (!response.ok) {
                throw new Error('Erro ao buscar academias do servidor.');
            }
            const academias = await response.json();

            selectAcademia.innerHTML = '<option value="">Selecione uma academia</option>';
            if (academias.length > 0) {
                academias.forEach((academia) => {
                    const option = document.createElement("option");
                    option.value = academia.id;
                    option.textContent = academia.nome;
                    selectAcademia.appendChild(option);
                });
                selectAcademia.disabled = false;
            } else {
                selectAcademia.innerHTML = '<option value="">Nenhuma academia cadastrada. Cadastre uma primeiro!</option>';
                selectAcademia.disabled = true;
            }
            console.log("Select de academias atualizado com dados do backend.");
        } catch (error) {
            console.error('Erro ao carregar academias:', error);
            selectAcademia.innerHTML = '<option value="">Erro ao carregar academias.</option>';
            selectAcademia.disabled = true;
            showPopup("Erro ao carregar lista de academias. Verifique o servidor.", 'erro');
        }
    }

    // Carrega academias ao carregar a página
    carregarAcademiasNoSelect();
    
    alunoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById("nomeAluno").value.trim();
        const sobrenome = document.getElementById("sobrenomeAluno").value.trim();
        const email = document.getElementById("emailAluno").value.trim();
        const senhaAluno = document.getElementById("senhaAluno").value.trim();
        const confirmaSenhaAluno = document.getElementById("confirmaSenhaAluno").value.trim();
        const academiaId = selectAcademia.value;

        // Validação da senha
        if (senhaAluno !== confirmaSenhaAluno) {
            showPopup("As senhas não coincidem. Por favor, verifique.", 'erro');
            return; 
        }

        // Validação de campos
        if (!nome || !sobrenome || !email || !senhaAluno || !confirmaSenhaAluno || !academiaId) {
            showPopup("Por favor, preencha todos os campos.", 'erro');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cadastro/aluno', {
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
                showPopup(data.message, 'sucesso');
                alunoForm.reset(); 
                selectAcademia.value = ""; 

                setTimeout(() => {
                    window.location.href = "Login.html"; 
                }, 1500);

            } else {
                showPopup(data.message || "Erro ao cadastrar aluno.", 'erro');
            }
        } catch (error) {
            console.error('Erro de rede ou servidor:', error);
            showPopup("Erro ao conectar com o servidor. Tente novamente mais tarde.", 'erro');
        }
    });
});