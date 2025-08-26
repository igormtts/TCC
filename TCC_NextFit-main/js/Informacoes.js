// js/Informacoes.js

document.addEventListener("DOMContentLoaded", () => {
    const detalhes = document.getElementById("detalhes");
    
    const academia = JSON.parse(localStorage.getItem("academiaSelecionada"));
  
    if (!academia || !academia.id) {
        detalhes.innerHTML = "<p>Nenhuma academia selecionada. Por favor, volte para a lista de academias.</p>";
        return;
    }
    
    // Faz a requisição para buscar os detalhes completos da academia
    async function carregarDetalhesAcademia() {
        try {
            const response = await fetch(`http://localhost:3000/academias/detalhes/${academia.id}`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar detalhes da academia.');
            }
            
            const detalhesAcademia = await response.json();

            detalhes.innerHTML = `
                <h3>${detalhesAcademia.nome}</h3>
                <p><strong>Email:</strong> ${detalhesAcademia.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> ${detalhesAcademia.telefone || 'Não informado'}</p>
                <p><strong>Horário de Atendimento:</strong> ${detalhesAcademia.horario_atendimento || 'Não informado'}</p>
                <p><strong>Cidade:</strong> ${detalhesAcademia.cidade || 'Não informada'}</p>
                <p><strong>Bairro:</strong> ${detalhesAcademia.bairro || 'Não informado'}</p>
                <p><strong>Rua:</strong> ${detalhesAcademia.rua || 'Não informada'}</p>
                <p><strong>Número:</strong> ${detalhesAcademia.numero || 'Não informado'}</p>
                <p><strong>CEP:</strong> ${detalhesAcademia.cep || 'Não informado'}</p>
            `;
        } catch (error) {
            console.error("Erro ao carregar detalhes da academia:", error);
            detalhes.innerHTML = `<p>Não foi possível carregar os detalhes da academia. Por favor, tente novamente mais tarde.</p>`;
        }
    }

    carregarDetalhesAcademia();
});