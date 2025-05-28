// src/pages/EcommerceHomePage/EcommerceHomePage.jsx
import React, { useState, useEffect } from 'react';
import HeaderAgro from '../../componentsAgro/HeaderAgro/HeaderAgro';
import BenefitsBar from '../../componentsAgro/BenefitsBar/BenefitsBar';
import HeroBannerAgro from '../../componentsAgro/HeroBannerAgro/HeroBannerAgro';
import CategoryGrid from '../../componentsAgro/CategoryGrid/CategoryGrid';
import ProductCard from '../../componentsAgro/ProductCard/ProductCard'; // Assuming ProductCard component exists
import { Typography, Layout, Row, Col, Spin, Empty, Alert } from 'antd'; // Import necessary Ant Design components

import { LoadingOutlined } from '@ant-design/icons'; // Import Ant Design icon
import './EcommerceHomePage.css'; // Import specific CSS file


// Destructure components from Ant Design Typography and Layout
const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;
// No need to import Empty.Item explicitly if using Empty.PRESENTED_IMAGE_SIMPLE


// <<< URL BASE PARA SUA API BACKEND >>>
// CORRIGIDO: Usando a sintaxe correta para acessar variáveis de ambiente no frontend com Vite (import.meta.env).
// Assume que a variável de ambiente no seu .env do frontend se chama VITE_REACT_APP_API_URL.
// Exemplo no .env (ou .env.development) do frontend: VITE_REACT_APP_API_URL=http://localhost:3001/api/v1
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api/v1';
console.log(`Frontend: Using API_BASE_URL: ${API_BASE_URL}`); // Log the base URL being used


const EcommerceHomePage = () => {
  // State variables for recent products data and fetching status
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecentProducts, setLoadingRecentProducts] = useState(true);
  const [errorRecentProducts, setErrorRecentProducts] = useState(null);

  // NOTE: Este componente busca apenas a PRIMEIRA página dos produtos mais recentes.
  // Ele NÃO implementa UI de paginação completa.
  // Portanto, uma variável de estado 'pagination' NÃO é necessária neste componente.
  // O 'ReferenceError' anterior acontecia porque uma variável 'pagination'
  // estava sendo usada sem ter sido declarada (por exemplo, via useState) neste escopo.
  // O código abaixo EVITA usar qualquer variável 'pagination'.


  // --- Hook useEffect para Buscar Produtos Recentes da API ---
  // Este efeito roda apenas uma vez após a renderização inicial devido ao array de dependência vazio [].
  useEffect(() => {
    // Define uma função assíncrona para lidar com a lógica de busca de dados.
    const fetchRecentProducts = async () => {
      setLoadingRecentProducts(true); // Define o estado de carregamento para true antes de buscar
      setErrorRecentProducts(null);   // Limpa quaisquer mensagens de erro anteriores
      setRecentProducts([]);          // Limpa a lista de produtos enquanto busca

      // Constrói os parâmetros da query URL para solicitar os 8 produtos mais recentes da primeira página.
      // Estes devem corresponder aos parâmetros que o endpoint /api/v1/products do seu backend espera
      // para ordenação e paginação.
      const queryParams = new URLSearchParams();
      queryParams.append('sortBy', 'created_at'); // Solicita ordenação por data de criação (para recência)
      queryParams.append('order', 'desc'); // Solicita ordenação descendente (produtos mais novos primeiro)
      queryParams.append('pageSize', 8); // Solicita um tamanho de página de 8 produtos
      queryParams.append('page', 1); // Solicita apenas a primeira página

      // Opcionalmente, adicione o filtro is_active=true aqui se o endpoint /products do seu backend
      // também retornar inativos e você só quer ativos na página inicial pública.
      // queryParams.append('is_active', 'true');


      // Combina a URL base da API com o caminho do endpoint e os parâmetros da query.
      const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
       console.log("Frontend: Tentando buscar produtos recentes da URL:", url); // Loga a URL exata que está sendo buscada

      try {
        // Realiza a requisição HTTP GET usando a API fetch do navegador.
        // Este endpoint geralmente não requer token de autenticação para visualização pública.
        const response = await fetch(url);
        console.log(`Frontend: Resposta recebida com status: ${response.status}`); // Loga o código de status HTTP

        // Antes de analisar o corpo da resposta como JSON, verifica se o cabeçalho Content-Type
        // indica uma resposta JSON. Isso previne erros se o backend retornar
        // HTML (como uma página 404) ou texto simples em caso de erro.
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           const errorText = await response.text(); // Lê o corpo da resposta como texto para depuração
           console.error("Frontend: Resposta da API não tem Content-Type JSON:", response.status, errorText); // Loga detalhes da resposta não-JSON
           // Lança um novo TypeError para ser capturado pelo bloco catch abaixo.
           throw new TypeError("Resposta da API não é JSON válida.");
        }

        // Analisa o corpo da resposta JSON em um objeto JavaScript.
        const data = await response.json();
        console.log("Frontend: Dados da resposta da API analisados:", data); // Loga a estrutura dos dados recebidos


        // Verifica se o código de status HTTP da resposta indica sucesso (intervalo 200-299).
        if (response.ok) {
            let productsArray = [];
            // Valida a estrutura dos dados recebidos do endpoint getAllProducts do seu backend.
            // Ele deve retornar { data: [...produtos], total: contagem } usando findAndCountAll e o controller.
            if (data && typeof data === 'object' && Array.isArray(data.data)) {
                productsArray = data.data; // Extrai o array de produtos da propriedade 'data'
                console.log(`Frontend: ${productsArray.length} produtos extraídos com sucesso da resposta.`);
            } else if (Array.isArray(data)) {
                // Manipulação de fallback para compatibilidade se o backend ainda retornar apenas o array diretamente (menos ideal)
                productsArray = data;
                 console.warn("Frontend: A API retornou apenas um array [...] (esperado { data, total }). Usando como está.");
            } else {
                // Manipula casos onde a estrutura de dados recebida não é a esperada.
                console.error("Frontend: Estrutura de dados da resposta da API inesperada:", data);
                // Lança um erro para ser capturado abaixo.
                throw new TypeError("Formato de resposta da API inesperado.");
            }

            // Atualiza o estado do componente com o array de produtos buscados.
            setRecentProducts(productsArray);

        } else {
           // Manipula códigos de status HTTP de erro (e.g., 4xx ou 5xx)
           console.error("Frontend: Erro na API ao buscar produtos recentes:", data.message || response.statusText, data); // Loga a mensagem de erro do backend se disponível
           // Define o estado de erro com a mensagem de erro do backend ou o texto de status.
           setErrorRecentProducts(data.message || `Erro ${response.status}: Falha ao carregar produtos recentes.`);
           setRecentProducts([]); // Garante que a lista de produtos esteja vazia em caso de erro da API.
        }

      } catch (err) {
        // Este bloco captura erros que ocorrem durante o próprio processo de fetch (e.g., problemas de rede)
        // ou erros explicitamente lançados no bloco try (como o TypeError para JSON inválido).
        console.error("Frontend: Bloco catch capturou um erro durante o fetch:", err); // Loga o objeto de erro completo
         if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
             // Fornece uma mensagem mais específica e amigável para erros de rede.
             setErrorRecentProducts('Não foi possível conectar ao servidor backend. Verifique se ele está rodando.');
         } else {
             // Para quaisquer outros erros inesperados capturados.
             setErrorRecentProducts(err?.message || 'Ocorreu um erro inesperado ao buscar produtos recentes.');
         }
         setRecentProducts([]); // Garante que a lista de produtos esteja vazia em caso de erro de fetch/rede.
      } finally {
        // Este bloco roda após a conclusão do bloco try ou catch.
        // É usado para desligar o indicador de carregamento.
        setLoadingRecentProducts(false);
      }
    };

    // Chama a função async de fetch imediatamente quando o componente é montado pela primeira vez.
    fetchRecentProducts();

    // Array de dependência está vazio []. Isso faz com que o efeito execute apenas uma vez quando
    // o componente monta. Isso é apropriado para buscar dados iniciais que não precisam ser buscados novamente
    // com base em alterações de estado ou props dentro deste componente.
  }, []); // <<< Array de dependência vazio garante que este rode apenas uma vez ao montar


  return (
    <Layout className="ecommerce-layout">
      {/* Renderiza componentes de Header, Benefits Bar, Hero Banner e Category Grid */}
      <HeaderAgro />
      <BenefitsBar />

      <Content className="ecommerce-main-content">
         <HeroBannerAgro />
         <CategoryGrid />

          {/* Seção para exibir a lista de produtos recentes */}
          <section className="featured-products-section">
            <Title level={3} style={{ textAlign: 'center', marginBottom: '2rem' }}>Produtos Recentes</Title>

             {/* Lógica de Renderização Condicional: Exibe Carregando, Erro, Produtos ou Estado Vazio */}
             {loadingRecentProducts ? (
                 // Se os dados estiverem sendo buscados no momento, exibe um spinner de carregamento.
                 <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} size="large" tip="Carregando produtos recentes..." />
                 </div>
             ) : errorRecentProducts ? (
                 // Se ocorreu um erro durante a busca, exibe uma mensagem de alerta.
                 <div style={{ padding: '20px' }}>
                     <Alert message="Erro ao carregar produtos recentes" description={errorRecentProducts} type="error" showIcon />
                 </div>
             ) : recentProducts.length > 0 ? (
                 // Se os dados foram buscados com sucesso e a lista de produtos não está vazia,
                 // exibe os produtos em um layout de grid.
                 <Row gutter={[16, 16]}> {/* Usa gutter para espaçamento horizontal e vertical */}
                     {recentProducts.map(product => (
                         // Itera sobre o array 'recentProducts'. Para cada objeto de produto,
                         // renderiza uma coluna de grid (Col) contendo um componente ProductCard.
                         // Usa o ID único do produto do banco de dados como a propriedade 'key' do React
                         // para otimização de performance.
                         <Col key={product.product_id} xs={12} sm={12} md={8} lg={6} xl={6}>
                             {/* Passa os dados do produto para o componente ProductCard. */}
                             {/* Mapeia nomes de campos do backend (snake_case) para nomes de props esperados pelo ProductCard (geralmente camelCase) */}
                             <ProductCard product={{
                                 id: product.product_id, // Mapeia product_id do backend para id do frontend
                                 name: product.name,
                                 // Lógica para determinar a URL da imagem:
                                 // 1. Usa 'product.image_url' se existir.
                                 // 2. Caso contrário, usa a primeira URL do array 'product.images' se existir e não estiver vazio.
                                 // 3. Fallback para uma URL de imagem placeholder se nenhuma URL de imagem estiver disponível do backend.
                                 imageUrl: product.image_url || (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) || 'https://via.placeholder.com/300x300/f5f5f5/005C40?text=Sem+Imagem',
                                 images: product.images, // Passa o array completo de images também se o ProductCard precisar
                                 // Garante que valores numéricos sejam analisados (parsed) de possíveis strings retornadas pelo DB do backend
                                 price: parseFloat(product.price),
                                 originalPrice: product.original_price ? parseFloat(product.original_price) : null, // Analisa original_price, pode ser null
                                 rating: product.rating ? parseFloat(product.rating) : null, // Analisa rating, pode ser null
                                 stock: product.stock !== undefined && product.stock !== null ? parseInt(product.stock, 10) : undefined, // Analisa stock, pode ser 0, undefined ou null
                                 // Inclui outras propriedades relevantes do produto se seu componente ProductCard as utilizar
                                 description: product.description,
                                 specs: product.specs, // Especificações técnicas (JSONB)
                                 category_id: product.category_id, // ID da categoria
                                 subcategory_id: product.subcategory_id, // ID da subcategoria
                                 // Se seu backend inclui objetos de categoria/subcategoria associados com nomes, passe-os também:
                                 // category: product.category,
                                 // subcategory: product.subcategory,
                             }} />
                         </Col>
                     ))}
                 </Row>
             ) : (
                 // Se o carregamento estiver completo, não houver erro e a lista de produtos estiver vazia, exibe uma mensagem de estado vazio.
                 <div style={{ textAlign: 'center', padding: '40px' }}>
                    {/* Componente Empty do Ant Design */}
                    <Empty description="Nenhum produto recente encontrado." image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                 </div>
             )}
          </section>

          {/* Adicione outras seções aqui se necessário (e.g., Categorias, Mais Vendidos) */}


      </Content>

       {/* Rodapé da página Ecommerce */}
       <footer style={{ textAlign: 'center', padding: '20px', background: '#f0f2f5', borderTop: '1px solid #ddd', color: '#888' }}>
           © {new Date().getFullYear()} Seu E-commerce Agropecuário - Placeholder Footer
       </footer>
    </Layout>
  );
};

// Exporta o componente como exportação padrão
export default EcommerceHomePage;