// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  // Extrai o pathname (ex: "/", "/planos", "/faq") do objeto de localização atual
  const { pathname } = useLocation();

  // Usa o useEffect para executar uma ação sempre que o pathname mudar
  useEffect(() => {
    // Executa a função de scroll do navegador para ir para as coordenadas (0, 0) - topo da página
    window.scrollTo(0, 0);
  }, [pathname]); // O array de dependências garante que o efeito rode sempre que o pathname mudar

  // Este componente não renderiza nada visualmente
  return null;
}

export default ScrollToTop;