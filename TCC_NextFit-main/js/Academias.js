document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("lista-academias");
  const academiasCadastradas = JSON.parse(localStorage.getItem("academias")) || [];
  const total = academiasCadastradas.length;
 document.querySelector("h2").innerText += ` (${total})`;



  if (academiasCadastradas.length === 0) {
    lista.innerHTML = `
      <div class="mensagem-vazia">
        <p>Impossível carregar a página. Não há academias cadastradas.</p>
      </div>
    `;
  } else {
    academiasCadastradas.forEach((academia) => {
      const card = document.createElement("div");
      card.classList.add("academia-card");
      card.style.cursor = "pointer";
    
      card.innerHTML = `
        <h4>${academia.nome}</h4>
        <span>ID da academia: ${academia.id}</span>
      `;
    
      card.addEventListener("click", () => {
        localStorage.setItem("academiaSelecionada", JSON.stringify(academia));
        window.location.href = "Detalhes.html";
      });
    
      lista.appendChild(card);
    });    
  }
});
