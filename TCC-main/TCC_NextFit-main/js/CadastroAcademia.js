document.addEventListener("DOMContentLoaded", () => {
    const academiaForm = document.getElementById("academiaForm");
    const mensagem = document.getElementById("mensagem");

    console.log("DOM Content Loaded - Iniciando script do CadastroAcademia.js.");

    // Array de cidades permitidas (apenas SC) - mantém sua lógica de validação aqui
    const cidadesSC = [
        "Abdon Batista", "Abelardo Luz", "Agrolândia", "Agronômica", "Água Doce", "Águas de Chapecó",
        "Águas Frias", "Águas Mornas", "Alfredo Wagner", "Alto Bela Vista", "Anchieta", "Angelina",
        "Anita Garibaldi", "Anitápolis", "Antônio Carlos", "Aparea da Serra", "Arabutã", "Araquari",
        "Araranguá", "Armazém", "Arroio Trinta", "Arvoredo", "Ascurra", "Atalanta", "Aurora",
        "Balneário Arroio do Silva", "Balneário Barra do Sul", "Balneário Camboriú", "Balneário Gaivota",
        "Bandeirante", "Barra Bonita", "Barra Velha", "Bela Vista do Toldo", "Benedito Novo", "Biguaçu",
        "Blumenau", "Bocaina do Sul", "Bom Jardim da Serra", "Bom Jesus", "Bom Jesus do Oeste",
        "Bom Retiro", "Botuverá", "Braço do Norte", "Braço do Trombudo", "Brunópolis", "Brusque",
        "Caçador", "Caibi", "Calmon", "Camboriú", "Campo Alegre", "Campo Belo do Sul", "Campo Erê",
        "Campos Novos", "Canelinha", "Canoinhas", "Capão Alto", "Capinzal", "Capivari de Baixo",
        "Catanduvas", "Caxambu do Sul", "Celso Ramos", "Centenário", "Chapecó", "Cocal do Sul",
        "Concórdia", "Cordilheira Alta", "Coronel Freitas", "Coronel Martins", "Correia Pinto",
        "Corupá", "Criciúma", "Cunha Porã", "Cunhataí", "Curitibanos", "Descanso", "Dionísio Cerqueira",
        "Dona Emma", "Doutor Pedrinho", "Entre Rios", "Ermo", "Erval Velho", "Faxinal dos Guedes",
        "Feliz Natal", "Figueira", "Florianópolis", "Formosa do Sul", "Forquilhinha", "Fraiburgo",
        "Frei Rogério", "Galvão", "Garopaba", "Garuva", "Gaspar", "Governador Celso Ramos",
        "Grão Pará", "Gravatal", "Guabiruba", "Guaraciaba", "Guaramirim", "Guarujá do Sul",
        "Guatambú", "Herval d'Oeste", "Ibiam", "Ibicaré", "Ibirama", "Içara", "Ilhota",
        "Imaruí", "Imbituba", "Imbuia", "Indaial", "Iomerê", "Ipira", "Iporã do Oeste",
        "Ipumirim", "Iraceminha", "Irani", "Irati", "Irineópolis", "Itá", "Itaiópolis",
        "Itajaí", "Itapema", "Itapiranga", "Itapoá", "Ituporanga", "Jaborá", "Jacinto Machado",
        "Jaguaruna", "Jaraguá do Sul", "Jardinópolis", "Joaçaba", "Joinville", "José Boiteux",
        "Jupiá", "Lacerdópolis", "Lages", "Laguna", "Lajeado Grande", "Laurentino", "Lauro Muller",
        "Lebon Régis", "Leoberto Leal", "Lindóia do Sul", "Lontras", "Luiz Alves", "Luzerna",
        "Macieira", "Mafra", "Major Gercino", "Major Vieira", "Maracajá", "Maravilha", "Marema",
        "Massaranduba", "Matos Costa", "Meleiro", "Mirim Doce", "Modelo", "Mondai", "Monte Carlo",
        "Monte Castelo", "Morro da Fumaça", "Morro Grande", "Navegantes", "Nova Erechim",
        "Nova Itaberaba", "Nova Trento", "Nova Veneza", "Novo Horizonte", "Orleans", "Otacílio Costa",
        "Ouro", "Ouro Verde", "Paial", "Painel", "Palhoça", "Palma Sola", "Palmeira", "Palmitos",
        "Papanduva", "Paraíso", "Passo de Torres", "Passos Maia", "Paulo Lopes", "Pedras Grandes",
        "Penha", "Peritiba", "Petrolândia", "Pinhalzinho", "Pinheiro Preto", "Piratuba", "Planalto Alegre",
        "Pomerode", "Ponte Alta", "Ponte Alta do Norte", "Ponte Serrada", "Porto Belo", "Porto União",
        "Pouso Redondo", "Praia Grande", "Presidente Castelo Branco", "Presidente Getúlio",
        "Presidente Nereu", "Princesa", "Quilombo", "Rancho Queimado", "Rio das Antas", "Rio do Campo",
        "Rio do Oeste", "Rio do Sul", "Rio Fortuna", "Rio Negrinho", "Rio Rufino", "Riqueza",
        "Rodeio", "Romelândia", "Salete", "Saltinho", "Salvador do Sul", "Santa Cecília",
        "Santa Helena", "Santa Rosa de Lima", "Santa Rosa do Sul", "Santa Terezinha",
        "Santa Terezinha do Progresso", "Santiago do Sul", "Santo Amaro da Imperatriz",
        "São Bento do Sul", "São Bernardino", "São Bonifácio", "São Carlos", "São Cristóvão do Sul",
        "São Domingos", "São Francisco do Sul", "São João Batista", "São João do Itaperiú",
        "São João do Oeste", "São Joaquim", "São José", "São José do Cedro", "São José do Cerrito",
        "São Lourenço do Oeste", "São Ludgero", "São Martinho", "São Miguel da Boa Vista",
        "São Miguel do Oeste", "São Pedro de Alcântara", "Saudades", "Schroeder", "Seara",
        "Serra Alta", "Siderópolis", "Sombrio", "Sul Brasil", "Taió", "Tangará", "Tigrinhos",
        "Tijucas", "Timbé do Sul", "Timbó", "Timbó Grande", "Três Barras", "Treviso",
        "Treze de Maio", "Treze Tílias", "Trombudo Central", "Tubarão", "Tunápolis", "Turvo",
        "União do Oeste", "Urussanga", "Vargeão", "Vargem", "Vargem Bonita", "Vidal Ramos",
        "Vidreira", "Vitor Meireles", "Witmarsum", "Xanxerê", "Xavantina", "Xaxim", "Zortéa"
    ];

    // ... código anterior

    academiaForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nomeAcademia").value.trim();
        const email = document.getElementById("emailAcademia").value.trim();
        const cidade = document.getElementById("cidade").value.trim();
        const bairro = document.getElementById("bairro").value.trim();
        const rua = document.getElementById("rua").value.trim();
        const cep = document.getElementById("cep").value.trim();
        const numero = document.getElementById("numero").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const horario = document.getElementById("horario").value.trim();
        const senha = document.getElementById("senhaAcademia").value.trim();
        const confirmaSenha = document.getElementById("confirmaSenhaAcademia").value.trim();

        // Adicione a validação de senha e de cidade que estava no código original
        if (senha !== confirmaSenha) {
            mensagem.innerText = "As senhas não coincidem.";
            mensagem.classList.add("erro");
            return;
        }

        // Converte a cidade para a primeira letra maiúscula e o restante minúscula para a validação
        const cidadeValidada = cidade.charAt(0).toUpperCase() + cidade.slice(1).toLowerCase();
        if (!cidadesSC.includes(cidadeValidada)) {
            mensagem.innerText = "O cadastro é permitido apenas para academias de Santa Catarina.";
            mensagem.classList.add("erro");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cadastro/academia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nomeAcademia: nome,
                    emailAcademia: email,
                    cidade: cidade,
                    bairro: bairro,
                    rua: rua,
                    cep: cep,
                    numero: numero,
                    telefone: telefone,
                    horario: horario,
                    senhaAcademia: senha
                })
            });

            const data = await response.json();

            // ...código anterior...

            if (response.ok) {
                mensagem.innerText = data.message;
                mensagem.classList.remove("erro");
                mensagem.classList.add("sucesso");

                // Limpe o formulário para evitar que a próxima tentativa use dados antigos
                academiaForm.reset();

                // Adiciona um pequeno atraso para que o usuário possa ver a mensagem de sucesso
                setTimeout(() => {
                    window.location.href = "Login.html";
                }, 1500); // Redireciona após 1.5 segundos

            } else {
                // Código para tratar erros (já existente)
                mensagem.innerText = data.message || "Erro ao cadastrar academia.";
                mensagem.classList.remove("sucesso");
                mensagem.classList.add("erro");
            }

        } catch (error) {
            console.error('Erro de rede ou servidor:', error);
            mensagem.innerText = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
            mensagem.classList.remove("sucesso");
            mensagem.classList.add("erro");
        }
    });
});