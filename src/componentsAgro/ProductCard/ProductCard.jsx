// src/componentsAgro/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Button, Tag, Rate, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext'; // <<< IMPORTADO useCart
import './ProductCard.css';

const { Title, Text, Paragraph } = Typography;

// Função para formatar preço
const formatPrice = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'Indisp.';
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Componente ProductCard
const ProductCard = ({ product }) => {
  const { addToCart } = useCart(); // <<< USA O HOOK DO CARRINHO

  // Retorna null se o produto não for válido para evitar erros
  if (!product || !product.id) {
    console.warn("ProductCard recebeu produto inválido:", product);
    return null;
  }

  // Desestruturação com valores padrão
  const {
    id,
    name = 'Produto Sem Nome',
    imageUrl = 'https://placehold.co/300x300.png',
    price = 0,
    originalPrice = null,
    rating = null,
    link = `/produto/${id}` // Link padrão
  } = product;

  // Cálculo de desconto
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Handler para adicionar ao carrinho
  const handleAddToCart = (e) => {
      e.preventDefault(); // Previne a navegação do Link pai
      e.stopPropagation(); // Impede que o evento suba para o Link pai
      addToCart(product, 1); // <<< CHAMA A FUNÇÃO DO CONTEXTO (adiciona 1 unidade)
      // A mensagem de sucesso agora é mostrada pelo CartContext
  };

  return (
    // Link envolvendo todo o card
    <Link to={link} className="product-card-link">
      <Card
        hoverable
        className="product-card-agro"
        cover={
          <div className="product-card-image-wrapper">
             <img alt={name} src={imageUrl} className="product-card-image" loading="lazy"/> {/* Added lazy loading */}
             {hasDiscount && discountPercent > 0 && (
                <Tag color="error" className="discount-tag">{discountPercent}% OFF</Tag>
             )}
          </div>
        }
      >
        {/* Conteúdo do Card */}
        <div className="product-card-content">
          <Title level={5} className="product-card-title" ellipsis={{ rows: 2, tooltip: name }}>
            {name}
          </Title>

          {/* Avaliação */}
          {typeof rating === 'number' && rating > 0 && ( // Verifica se é número > 0
            <Rate
              disabled
              allowHalf
              defaultValue={rating}
              className="product-card-rating"
            />
          )}

          {/* Preços */}
          <div className="product-card-price-section">
            {hasDiscount && (
              <Text delete type="secondary" className="original-price">
                {formatPrice(originalPrice)}
              </Text>
            )}
            <Text strong className="current-price">
              {formatPrice(price)}
            </Text>
          </div>

          {/* Botão Adicionar */}
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="product-card-add-button"
            onClick={handleAddToCart} // <<< Chama o handler atualizado
            block
          >
            Adicionar
          </Button>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;