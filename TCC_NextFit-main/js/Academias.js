// js/Academias.js

document.addEventListener("DOMContentLoaded", () => {
    const listaAcademias = document.getElementById("lista-academias");

    async function carregarAcademias() {
        listaAcademias.innerHTML = '<p class="mensagem-carregando">Carregando academias...</p>';

        try {
            const response = await fetch('http://localhost:3000/academias');

            if (!response.ok) {
                throw new Error('Erro ao buscar academias do servidor.');
            }

            const academias = await response.json();
            
            listaAcademias.innerHTML = '';
            
            document.querySelector("h2").innerText = `Academias Cadastradas (${academias.length})`;

            if (academias.length === 0) {
                listaAcademias.innerHTML = `
                    <div class="mensagem-vazia">
                        <p>Nenhuma academia encontrada no banco de dados.</p>
                    </div>
                `;
            } else {
                academias.forEach((academia) => {
                    const card = document.createElement("div");
                    card.classList.add("academia-card");
                    card.style.cursor = "pointer";
                
                    card.innerHTML = `
                        <h4>${academia.nome}</h4>
                        <p>ID da academia: ${academia.id}</p>
                        <p>Cidade: ${academia.cidade}</p>
                    `;
                
                    card.addEventListener("click", () => {
                        localStorage.setItem("academiaSelecionada", JSON.stringify(academia));
                        window.location.href = "Informacoes.html";
                    });
                
                    listaAcademias.appendChild(card);
                });    
            }
        } catch (error) {
            console.error("Erro ao carregar academias:", error);
            listaAcademias.innerHTML = `
                <div class="mensagem-erro">
                    <p>Não foi possível carregar as academias. Verifique se o servidor está rodando.</p>
                </div>
            `;
        }
    }

    carregarAcademias();
});