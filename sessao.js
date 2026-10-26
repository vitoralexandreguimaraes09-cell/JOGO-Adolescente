/*
 * Desconecta! - controle de sessão entre index.html, jogo.html e escola.html
 *
 * Carregue este arquivo antes dos scripts principais das três páginas.
 * Não apaga dados durante F5; apaga quando a pessoa sai do site e volta
 * por uma navegação nova ou pelo botão Voltar.
 */
(() => {
  'use strict';

  const EXIT_MARKER = 'desconectaExitPending';
  const SESSION_MARKER = 'desconectaSessionActive';
  const INTERNAL_NAV_MARKER = 'desconectaInternalNavigation';

  const pageName = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const navigation = performance.getEntriesByType('navigation')[0];
  const navigationType = navigation ? navigation.type : 'navigate';

  const cameFromInternalPage = sessionStorage.getItem(INTERNAL_NAV_MARKER) === '1';

  if (cameFromInternalPage) {
    // A navegação index -> jogo -> escola -> index faz parte da mesma partida.
    sessionStorage.removeItem(INTERNAL_NAV_MARKER);
  } else if (navigationType === 'reload') {
    // O pagehide é acionado também no F5. Neste caso, cancela a marca de saída.
    localStorage.removeItem(EXIT_MARKER);
  } else if (localStorage.getItem(EXIT_MARKER) === '1') {
    // Retorno após sair do site: limpar todos os dados persistidos do jogo.
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('desconecta')) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.removeItem(SESSION_MARKER);

    if (pageName === 'index.html') {
      window.addEventListener('DOMContentLoaded', () => {
        alert('📵 Sua sessão anterior foi encerrada. O progresso do Desconecta! foi reiniciado!');
      }, { once: true });
    }
  }

  // Chamar antes de mudar entre as páginas do próprio jogo.
  window.marcarNavegacaoInterna = function () {
    sessionStorage.setItem(INTERNAL_NAV_MARKER, '1');
  };

  // Fallback para saída/fechamento. Não é garantido em todos os navegadores móveis.
  window.addEventListener('pagehide', () => {
    if (sessionStorage.getItem(INTERNAL_NAV_MARKER) === '1') return;
    localStorage.setItem(EXIT_MARKER, '1');
  });
})();
