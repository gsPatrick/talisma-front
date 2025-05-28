// src/componentsAgro/ShoppingCartDrawer.jsx
import React from 'react';
// <<< ADICIONADO Link à importação >>>
import { useNavigate, Link } from 'react-router-dom';
import { Drawer, List, Avatar, Button, InputNumber, Typography, Empty, Divider, Popconfirm, message, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import './ShoppingCartDrawer.css';

const { Title, Text } = Typography;

// Função formatPrice
const formatPrice = (value) => {
  if (typeof value !== 'number' || isNaN(value)) { return 'R$ --'; }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ShoppingCartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartTotal,
    cartItemCount
  } = useCart();

  const handleQuantityChange = (item, value) => {
    const newQuantity = Number(value);
    if (!isNaN(newQuantity)) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleCheckout = () => {
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
          message.warning("Seu carrinho está vazio!");
          return;
      }
      onClose();
      navigate('/checkout/cart'); // <<< Ajuste esta rota se necessário
  };

  console.log("Renderizando Drawer do Carrinho. Itens:", cartItems);

  return (
    <Drawer
      title={
        <Space>
          <ShoppingCartOutlined />
          Seu Carrinho ({typeof cartItemCount === 'number' ? cartItemCount : 0})
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={380}
      className="shopping-cart-drawer"
      footer={
        Array.isArray(cartItems) && cartItems.length > 0 ? (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <Text strong>Total:</Text>
              <Text strong className="total-price">{formatPrice(typeof cartTotal === 'number' ? cartTotal : 0)}</Text>
            </div>
            <Button
                type="primary" block size="large"
                className="checkout-button" onClick={handleCheckout}
            >
                Finalizar Compra
            </Button>
            <Popconfirm
                title="Limpar carrinho?" description="Tem certeza?"
                onConfirm={clearCart} okText="Sim" cancelText="Não" placement="topRight"
            >
                <Button type="link" danger size="small" className="clear-cart-button">
                    Esvaziar Carrinho
                </Button>
            </Popconfirm>
          </div>
        ) : null
      }
      key={open ? 'drawer-open' : 'drawer-closed'} // Força re-render se 'open' mudar
    >
      {/* Conteúdo Principal */}
      {!Array.isArray(cartItems) || cartItems.length === 0 ? (
        <Empty description={<Text type="secondary">Seu carrinho está vazio.</Text>} style={{marginTop: '40px'}} />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={cartItems}
          className="cart-item-list"
          renderItem={(item) => {
            console.log("Renderizando item no Drawer:", item);
            if (!item || typeof item !== 'object' || !item.id) {
                console.error("Item inválido no carrinho:", item);
                return <List.Item style={{color: 'red', fontSize: '0.8em'}}>Item inválido encontrado</List.Item>;
            }
            const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 1;
            const itemPrice = typeof item.price === 'number' ? item.price : 0;

            return (
              <List.Item
                className="cart-item"
                actions={[
                  <Popconfirm
                    key={`remove-${item.id}`} title="Remover item?"
                    onConfirm={() => removeFromCart(item.id)} okText="Sim" cancelText="Não"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" aria-label={`Remover ${item.name || 'item'}`}/>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar shape="square" size={64} src={item.imageUrl || 'https://via.placeholder.com/64'} alt={item.name || 'Produto'} />}
                  // <<< Link agora está definido e pode ser usado >>>
                  title={<Link to={`/produto/${item.id}`} onClick={onClose} className="cart-item-title">{item.name || 'Produto sem nome'}</Link>}
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                       <Text strong className="cart-item-price">{formatPrice(itemPrice)}</Text>
                       <Space className="quantity-controls">
                           <Button size="small" icon={<MinusOutlined />} onClick={() => decreaseQuantity(item.id)} aria-label={`Diminuir quantidade de ${item.name || 'item'}`}/>
                           <InputNumber
                              aria-label={`Quantidade de ${item.name || 'item'}`} min={0}
                              value={itemQuantity}
                              onChange={(value) => handleQuantityChange(item, value)}
                              size="small" className="quantity-input-drawer"
                          />
                           <Button size="small" icon={<PlusOutlined />} onClick={() => increaseQuantity(item.id)} aria-label={`Aumentar quantidade de ${item.name || 'item'}`}/>
                       </Space>
                    </Space>
                  }
                />
              </List.Item>
            );
          }} // Fim renderItem
        />
      )}
    </Drawer>
  );
};

export default ShoppingCartDrawer;