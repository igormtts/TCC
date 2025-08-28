// js/feedback.js

/**
 * Exibe um pop-up de mensagem com o texto e o tipo (sucesso ou erro) especificados.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'sucesso' | 'erro'} type - O tipo de mensagem ('sucesso' ou 'erro').
 */
function showPopup(message, type) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    const closeBtn = document.querySelector('.close-popup');

    if (!popup || !popupMessage) {
        console.error('Elementos do pop-up não encontrados.');
        return;
    }

    popupMessage.textContent = message;
    popupMessage.className = 'popup-message ' + type;
    popup.style.display = 'flex';

    // Fecha o pop-up ao clicar no 'x'
    closeBtn.onclick = () => {
        popup.style.display = 'none';
    };

    // Fecha o pop-up ao clicar fora dele
    window.onclick = (event) => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    };

    // Fecha automaticamente após 5 segundos
    setTimeout(() => {
        popup.style.display = 'none';
    }, 5000); 
}