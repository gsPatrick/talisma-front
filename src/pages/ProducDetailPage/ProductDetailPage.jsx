// src/pages/ProductDetailPage/ProductDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout, Row, Col, Card, Typography, Button, Spin, Alert, Image, Rate, InputNumber, Tag, Tabs, message, Empty, Space } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'; // Removidos UserOutlined, MailOutlined, WhatsAppOutlined, TagOutlined, CalendarOutlined, IdcardOutlined - não usados diretamente aqui
import HeaderAgro from '../../componentsAgro/HeaderAgro/HeaderAgro';
import ProductCard from '../../componentsAgro/ProductCard/ProductCard'; // Usado para produtos relacionados
 import FooterLP from '../../componentsAgro/FooterAgro/FooterAgro';
import { useCart } from '../../context/CartContext'; // Hook do carrinho
import './ProductDetailPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// <<< URL BASE DA SUA API BACKEND >>>
const API_BASE_URL = 'https://geral-talismaapi.r954jc.easypanel.host/api/v1'; // Ajuste a URL base da sua API

// Helper para formatar preço (Mantido)
const formatPrice = (value) => {
  if (typeof value !== 'number' || isNaN(value)) { return 'Indisp.'; }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função formatDate (mantida, pode ser útil)
const formatDate = (dateString) => { /* ... (mantido) ... */ };


// --- Simulação de busca por produtos relacionados (AGORA USANDO A NOVA SIMULAÇÃO DO SERVICE) ---
// Não precisamos mais dos mocks locais e da função getRelatedProductsMock aqui.
// Vamos importar a função de simulação do service mock.
// TODO: Em um sistema real, importaríamos o service ProductService ou uma função API.
// Por enquanto, para o mock, reusamos a função que já ajustamos em product.service.js
// No frontend, você normalmente não importaria o service do backend.
// Faria uma chamada Fetch/Axios para um endpoint API DE RELACIONADOS, ex: `/api/v1/products/:productId/related`
// OU chamaria `/api/v1/products?category=X&limit=4&exclude=ID`
// Para fins de mock rápido AQUI, vamos simular essa busca de relacionados com base no productDetails recebido.
// Em um backend real, o endpoint de detalhes poderia INCLUIR uma lista de relacionados.

const ProductDetailPage = () => {
  const { productId } = useParams(); // ID do produto da URL
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Hook do carrinho

  const [productDetails, setProductDetails] = useState(null);
   // <<< Estado para produtos relacionados >>>
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // Estado para quantidade


  // --- Buscar Dados do Produto da API ---
  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProductDetails(null); // Limpa detalhes enquanto carrega novo produto
    setQuantity(1); // Reseta quantidade para 1
    setRelatedProducts([]); // Limpa relacionados enquanto carrega novo produto

    try {
      // <<< CHAMADA API REAL PARA DETALHES DO PRODUTO >>>
      const url = `${API_BASE_URL}/products/${productId}`;
      console.log("Buscando detalhes do produto da API:", url);

      const response = await fetch(url);
       // Verifica se a resposta é JSON válida
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const errorText = await response.text();
         console.error("Resposta da rede não é JSON válida para detalhes:", response.status, errorText);
         throw new TypeError("Resposta da rede não é JSON válida para detalhes.");
      }

      const data = await response.json(); // Assume que a API retorna o objeto do produto

      if (response.ok) {
        setProductDetails(data); // Define os detalhes do produto

        // Ajusta quantidade inicial baseada no estoque retornado pela API
        if (data && data.stock !== undefined && data.stock <= 0) {
          setQuantity(0); // Quantidade inicial 0 se sem estoque
        } else {
          setQuantity(1); // Quantidade inicial 1 se com estoque
        }

         // --- Buscar Produtos Relacionados (Ainda usando Mock SIMULADO DO SERVICE) ---
         // Em um sistema real, chamaria um endpoint API como /api/v1/products/:productId/related
         // Ou buscaria por categoria: /api/v1/products?category=X&limit=4&exclude=ID
         // Para fins de mock rápido AQUI no frontend, vamos SIMULAR essa busca de relacionados
         // usando os dados mockados do SERVICE simulateFetchAdminProducts.
         // NOTA: Isso não é o ideal em uma arquitetura limpa, mas funciona para o mock atual.
         // O IDEAL seria ter um endpoint backend específico para relacionados.
         if (data?.category) { // Se o produto retornado tem categoria
              // Simula a busca de relacionados (usando a função mockada que está 'exportada' no service mock)
              // Passa filtros para a simulação: categoria, excluir o produto atual, limitar
               const relatedFilters = {
                   categoryIds: [categoryStructure[data.category]?.id].filter(id => id !== undefined), // Filtra pela ID da categoria do produto
                   // Excluir o produto atual requer lógica adicional no mockFetch ou na API real
                   // Exemplo mock to filter out current product:
                   // allMockProductsForDetails.filter(p => p.is_active && p.category === data.category && p.id !== data.id)
                   // Vamos fazer a simulação aqui no frontend por simplicidade com os dados mockados completos:
               };
                const mockRelated = allMockProductsForDetails.filter(p =>
                    p.is_active &&
                    p.category === data.category && // Mesma categoria
                    p.id !== data.id // Exclui o produto atual
                 ).sort(() => 0.5 - Math.random()).slice(0, 4); // Embaralha e limita
                 setRelatedProducts(mockRelated); // Define os relacionados encontrados
         } else {
             setRelatedProducts([]); // Nenhuns relacionados se sem categoria
         }
         // --- Fim Mock Relacionados AQUI no frontend ---


      } else {
        // Produto não encontrado (404) ou outro erro da API
         console.error("Erro API ao buscar detalhes do produto:", data.message || response.statusText);
         // Adapta mensagem de erro para 404 vs outros erros
         if (response.status === 404) {
             setError('Produto não encontrado ou indisponível.');
             message.error('Produto não encontrado ou indisponível.', 3);
         } else {
            setError(data.message || `Erro ${response.status}: Falha ao carregar detalhes do produto.`);
             message.error(data.message || 'Erro ao carregar detalhes do produto.');
         }
      }

    } catch (err) {
      console.error("Erro na comunicação com a API de detalhes do produto:", err);
       if (err instanceof TypeError && err.message === 'Failed to fetch') {
            setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        } else {
            setError('Erro inesperado ao buscar detalhes do produto.');
        }
      message.error('Erro na comunicação com o servidor.'); // Mensagem genérica de erro
    } finally {
      setLoading(false);
    }
  }, [productId]); // Dependência do useEffect: productId

  // Carregar produto ao montar o componente ou quando o productId na URL mudar
  useEffect(() => {
    loadProduct();
  }, [loadProduct]); // Dependência do useEffect: loadProduct (função useCallback)


  // --- Handlers ---
  const handleQuantityChange = useCallback((value) => {
    const maxQty = productDetails?.stock;
    let newQty = value === null || value === undefined || value < 1 ? 1 : value; // Garante que a qtde é pelo menos 1

    // Se houver limite de estoque e a nova quantidade exceder, ajusta para o máximo
    if (maxQty !== undefined) {
        if (maxQty === 0) {
            newQty = 0; // Se estoque é zero, quantidade não pode ser mais que zero
             if (value > 0) message.warning(`Produto sem estoque!`, 2); // Avisa se tentou adicionar > 0
        } else if (newQty > maxQty) {
            newQty = maxQty; // Limita pela quantidade em estoque
            if (maxQty > 0) message.warning(`Estoque máximo disponível: ${maxQty}`, 2); // Avisa sobre o limite
        }
    }

    setQuantity(newQty); // Atualiza o estado da quantidade
  }, [productDetails]); // Recria o handler se productDetails mudar


  // Handler para adicionar ao carrinho (usa o hook do CartContext)
  const handleAddToCart = useCallback(() => {
    // Verifica se há detalhes do produto e se a quantidade é válida (> 0)
    if (!productDetails || quantity <= 0 || productDetails.stock === 0) {
        message.warning("Não é possível adicionar este item ao carrinho.", 2);
        return;
    }
     // Verifica se a quantidade solicitada excede o estoque (redundante se input max está certo, mas boa prática)
     if (productDetails.stock !== undefined && quantity > productDetails.stock) {
         message.warning(`Quantidade solicitada excede o estoque disponível (${productDetails.stock}).`, 2);
          // Opcional: ajustar a quantidade no input aqui: setQuantity(productDetails.stock > 0 ? productDetails.stock : 0);
         return; // Não adiciona ao carrinho
     }


    addToCart(productDetails, quantity); // Chama a função do CartContext
    // A mensagem de sucesso já é mostrada pelo CartContext
  }, [productDetails, quantity, addToCart]); // Dependências para useCallback


  // --- Renderização Condicional (Loading/Erro/Produto Não Encontrado) ---
  // Spinner global ou mensagem de erro se não houver productDetails
  if (loading || (!productDetails && !error)) { // Mostra loading enquanto busca OU se terminou e não achou/deu erro
      return (
        <Layout className="ecommerce-layout product-detail-layout loading">
           <HeaderAgro/>
           <Content className="ecommerce-main-content product-detail-content" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
             <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} size="large" tip={"Carregando detalhes do produto..."}/>
           </Content>
            {/* Footer opcional */}
            {/* <footer className="placeholder-footer"> E-commerce Footer </footer> */}
        </Layout>
      );
  }

  if (error) {
       return (
         <Layout className="ecommerce-layout product-detail-layout error">
            <HeaderAgro/>
            <Content className="ecommerce-main-content product-detail-content" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
              <Alert message="Erro ao carregar produto" description={error} type="error" showIcon />
            </Content>
            {/* Footer opcional */}
            {/* <footer className="placeholder-footer"> E-commerce Footer </footer> */}
         </Layout>
       );
  }

  // Se chegou aqui, loading é false, não há erro, e productDetails existe
  // Desestruturação segura (já validamos productDetails acima)
  // Use original_price conforme schema backend
  const { name, images, imageUrl, price, original_price, rating, stock, description, specs, category, subcategory } = productDetails;

  const hasDiscount = original_price !== undefined && original_price !== null && original_price > price; // Verifica null também
  const discountPercent = hasDiscount ? Math.round(((original_price - price) / original_price) * 100) : 0;
  const isInStock = stock !== undefined && stock !== null && stock > 0; // Verifica null também
  // Prioriza o array 'images', fallback para 'imageUrl' se array vazio ou não array
  const imageList = Array.isArray(images) && images.length > 0 ? images : (imageUrl ? [imageUrl] : []);

  // --- Renderização Principal ---
  return (
    <Layout className="ecommerce-layout product-detail-layout">
      <HeaderAgro /> {/* Header do E-commerce */}

      <Content className="ecommerce-main-content product-detail-content">
         <div className="breadcrumb-container">
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Voltar</Button>
            {/* Breadcrumb básico (pode expandir) - Exibe Categoria e Subcategoria se existirem */}
             {(category || subcategory) && (
                 <Text type="secondary" style={{marginLeft: '10px'}}>
                    {/* Link para a página da categoria principal se existir */}
                    {category && `/ ${category} ${categoryStructure[category]?.slug ? '' : '(N/S)'}`}
                    {category && categoryStructure[category]?.slug && <Link to={`/produtos/${categoryStructure[category].slug}`}>{category}</Link>}
                    {/* Exibe a subcategoria se existir */}
                    {subcategory && `/ ${subcategory}`}
                 </Text>
             )}
         </div>

        <Row gutter={[32, 32]} className="product-main-info">
          {/* Coluna da Imagem */}
          <Col xs={24} md={12} className="product-image-column">
             {imageList.length > 0 ? (
                 <Image.PreviewGroup items={imageList}>
                    {/* Usa imageList[0] ou imageUrl para a imagem principal */}
                    <Image className="main-product-image" src={imageList[0] || 'https://via.placeholder.com/600x600/f5f5f5/005C40?text=Sem+Imagem'} alt={name} placeholder={<Spin indicator={<LoadingOutlined spin />} />} />
                 </Image.PreviewGroup>
             ) : ( <div className="main-product-image-placeholder">Sem Imagem</div> )}
            {/* Thumbnails - Exibe apenas se houver mais de uma imagem */}
            {imageList.length > 1 && (
                <div className="thumbnail-container">
                   {/* Renderiza thumbs para as imagens adicionais (slice(1)) */}
                   {imageList.slice(1).map((imgUrl, index) => (
                       <img key={index} src={imgUrl || 'https://via.placeholder.com/60x60/f5f5f5/005C40?text=Sem+Imagem'} alt={`${name} - view ${index + 2}`} className="thumbnail-image" />
                    ))}
                </div>
            )}
          </Col>

          {/* Coluna de Informações */}
          <Col xs={24} md={12} className="product-info-column">
            <Title level={2} className="product-detail-title">{name}</Title>
            <Space className="product-meta-info" size="middle" wrap>
                 {/* Rating (se disponível e > 0) */}
                 {rating !== undefined && rating !== null && rating > 0 && <Rate disabled allowHalf defaultValue={rating} />}
                 {/* Status de Estoque (se stock for definido) */}
                 {stock !== undefined && stock !== null ? (
                     <Tag icon={isInStock ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={isInStock ? "success" : "error"}>
                          {stock} em estoque
                      </Tag>
                 ) : ( // Se stock não for definido ou for null
                     <Tag color="default">Estoque: N/I</Tag>
                 )}
            </Space>
            <div className="product-detail-price-section">
              {/* Preço Original e Desconto (se houver) */}
              {hasDiscount && (
                 <Text delete type="secondary" className="detail-original-price">{formatPrice(original_price)}</Text>
              )}
              {/* Preço Atual */}
              <Text strong className="detail-current-price">{formatPrice(price)}</Text>
               {/* Tag de Desconto (se houver) */}
               {hasDiscount && discountPercent > 0 && (<Tag color="error" className="detail-discount-tag">{discountPercent}% OFF</Tag>)}
            </div>

             {/* Descrição Curta (ou a completa se não houver tabs) */}
             {description && (<Paragraph type="secondary" className="product-short-description">{description}</Paragraph>)} {/* Exibe a descrição completa aqui */}
              {!description && <Paragraph type="secondary" className="product-short-description">Nenhuma descrição disponível.</Paragraph>}


            <div className="product-actions">
                <Space align="center" size="middle">
                    <Text strong>Quantidade:</Text>
                    {/* Input de Quantidade - Min 1 se em estoque > 0, Min 0 se estoque 0 */}
                    <InputNumber
                        min={isInStock ? 1 : 0}
                        max={isInStock ? stock : 0} // Max é o estoque disponível
                        value={quantity}
                        onChange={handleQuantityChange}
                        disabled={!isInStock} // Desabilita se sem estoque (stock <= 0)
                        size="large"
                        className="quantity-input"
                    />
                </Space>
                {/* Botão Adicionar - Desabilita se sem estoque ou quantidade <= 0 */}
                <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={!isInStock || quantity <= 0}
                    className="add-to-cart-button"
                >
                     {isInStock ? 'Adicionar ao Carrinho' : 'Produto Indisponível'}
                </Button>
            </div>
          </Col>
        </Row>

         {/* Tabs (Descrição Completa e Especificações) */}
          {/* Exibe Tabs apenas se houver descrição ou specs */}
         {(description || (specs && Object.keys(specs).length > 0)) && (
             <Tabs defaultActiveKey={description ? "1" : "2"} className="product-tabs-section"> {/* Ativa 1 se descrição existir, senão 2 */}
                {description && (
                    <TabPane tab="Descrição Completa" key="1">
                         <Paragraph className="tab-content-paragraph">{description}</Paragraph>
                     </TabPane>
                 )}
                {specs && Object.keys(specs).length > 0 && (
                    <TabPane tab="Especificações Técnicas" key={(description ? "2" : "1")}> {/* Key 2 se houver descrição, 1 se não */}
                         <ul className="specs-list">
                             {Object.entries(specs).map(([key, value]) => (
                                 <li key={key}><Text strong>{key}:</Text> <Text>{value}</Text></li>
                              ))}
                         </ul>
                    </TabPane>
                )}
              </Tabs>
         )}
          {/* Mensagem se não houver descrição nem specs */}
           {!description && !(specs && Object.keys(specs).length > 0) && (
               <Alert message="Informações Adicionais" description="Não há descrição completa ou especificações técnicas detalhadas disponíveis para este produto." type="info" showIcon style={{marginTop: '3rem'}}/>
           )}


          {/* Produtos Relacionados (Ainda usando Mock do Frontend por enquanto) */}
           {relatedProducts && relatedProducts.length > 0 && (
                <section className="related-products-section">
                    <Title level={4} className="related-title">Produtos Relacionados</Title>
                    <Row gutter={[16, 24]}>
                        {relatedProducts.map(prod => (
                           <Col key={prod.id} xs={12} sm={8} md={6} lg={6} xl={4}>
                               <ProductCard product={prod} />
                           </Col>
                        ))}
                    </Row>
                </section>
           )}
      </Content>

      {/* Renderiza Footer (ajuste conforme seu componente) */}
       <FooterLP/>
    </Layout>
  );
};

export default ProductDetailPage;