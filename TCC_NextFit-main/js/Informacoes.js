document.addEventListener("DOMContentLoaded", () => {
    const detalhes = document.getElementById("detalhes");
    const academia = JSON.parse(localStorage.getItem("academiaSelecionada"));
  
    if (!academia) {
      detalhes.innerHTML = "<p>Nenhuma academia selecionada.</p>";
      return;
    }
  
    const endereco = academia.endereco;
    detalhes.innerHTML = `
      <h3>${academia.nome}</h3>
      <p><strong>ID:</strong> ${academia.id}</p>
      <p><strong>Cidade:</strong> ${endereco.cidade}</p>
      <p><strong>Bairro:</strong> ${endereco.bairro}</p>
      <p><strong>Rua:</strong> ${endereco.rua}</p>
      <p><strong>Número:</strong> ${endereco.numero}</p>
      <p><strong>CEP:</strong> ${endereco.cep}</p>
    `;
  });