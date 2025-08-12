// Inicio.js

// Aqui você pode adicionar funcionalidades extras para a página inicial,
// como animações ou integração futura com APIs

document.addEventListener("DOMContentLoaded", () => {
    console.log("Página Home carregada com sucesso!");
  
    // Exemplo: efeito de fade-in nas seções
    const sections = document.querySelectorAll("section");
    sections.forEach((section, index) => {
      section.style.opacity = 0;
      section.style.transition = "opacity 0.8s ease";
      setTimeout(() => {
        section.style.opacity = 1;
      }, index * 300);
    });
if (tipo === "aluno") {
  const usuario = alunos.find((a) => a.email === email && a.senha === senha);
  if (usuario) {
    localStorage.setItem("usuarioLogado", JSON.stringify({ tipo: "aluno", dados: usuario }));
    window.location.href = "Inicio.html";
  }
} else if (tipo === "academia") {
  const usuario = academias.find((a) => a.nome.toLowerCase() === email.toLowerCase() && a.senha === senha);
  if (usuario) {
    localStorage.setItem("usuarioLogado", JSON.stringify({ tipo: "academia", dados: usuario }));
    window.location.href = "Inicio.html";
  }
}

  });

  