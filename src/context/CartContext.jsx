// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { message } from 'antd'; // Importa message para feedback

// 1. Criar o Contexto
const CartContext = createContext();

// 2. Criar o Provedor do Contexto
export const CartProvider = ({ children }) => {
  // Estado para armazenar os itens do carrinho
  // Tenta carregar do localStorage na inicialização
  const [cartItems, setCartItems] = useState(() => {
     try {
        const localData = localStorage.getItem('agroCartItems');
        // Verifica se localData existe e é um array válido após o parse
        const parsedData = localData ? JSON.parse(localData) : [];
        return Array.isArray(parsedData) ? parsedData : []; // Garante que seja um array
     } catch (error) {
         console.error("Erro ao carregar carrinho do localStorage:", error);
         return []; // Retorna array vazio em caso de erro
     }
  });

  // Salva no localStorage sempre que cartItems mudar
  useEffect(() => {
    try {
        // Garante que estamos salvando um array válido
        localStorage.setItem('agroCartItems', JSON.stringify(Array.isArray(cartItems) ? cartItems : []));
    } catch (error) {
         console.error("Erro ao salvar carrinho no localStorage:", error);
    }
  }, [cartItems]);


  // --- Ações do Carrinho ---

  const addToCart = (product, quantity = 1) => {
    // Validação mais robusta do produto
    if (!product || typeof product !== 'object' || !product.id || quantity <= 0 || typeof product.price !== 'number' || isNaN(product.price)) {
        console.error("Tentativa de adicionar produto inválido/incompleto ao carrinho:", product);
        message.error("Não foi possível adicionar este item ao carrinho (dados inválidos).", 2);
        return;
    }

    setCartItems(prevItems => {
      // Garante que prevItems seja sempre um array
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);

      let updatedItems;

      if (existingItemIndex > -1) {
        // Item já existe, atualiza quantidade
        updatedItems = [...currentItems];
        const existingItem = updatedItems[existingItemIndex];
        // Garante que a quantidade existente seja numérica
        const currentQuantity = typeof existingItem.quantity === 'number' ? existingItem.quantity : 0;
        const newQuantity = currentQuantity + quantity;
        // TODO: Adicionar lógica de verificação de estoque aqui se necessário
        // if (product.stock !== undefined && newQuantity > product.stock) { ... }
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
        console.log(`Quantidade atualizada para ${product.name}: ${newQuantity}`);
        message.success(`${quantity}x ${product.name} adicionado(s) (total: ${newQuantity})!`, 1.5);
      } else {
        // Novo item, adiciona ao carrinho
        console.log(`Adicionando novo item ${product.name} ao carrinho.`);
        updatedItems = [
          ...currentItems,
          { // Garante que as propriedades essenciais existam
            id: product.id,
            name: product.name || 'Produto Desconhecido',
            price: product.price, // Já validado como número
            imageUrl: product.imageUrl || product.images?.[0] || 'https://via.placeholder.com/64', // Fallback para imagem
            quantity: quantity,
            // stock: product.stock // Adiciona estoque se precisar
          }
        ];
        message.success(`${product.name} adicionado ao carrinho!`, 1.5);
      }
      console.log("Novo estado do carrinho:", updatedItems);
      return updatedItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
        const updatedItems = Array.isArray(prevItems) ? prevItems.filter(item => item.id !== productId) : [];
        if (updatedItems.length < (prevItems || []).length) {
             message.info(`Item removido do carrinho.`, 1.5);
        }
        return updatedItems;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
     const quantityNum = Number(newQuantity);
     // Ignora se não for número ou se for NaN
     if (isNaN(quantityNum)) {
         console.warn(`Tentativa de atualizar quantidade com valor inválido: ${newQuantity}`);
         return;
     }

     setCartItems(prevItems => {
         const currentItems = Array.isArray(prevItems) ? prevItems : [];
         if (quantityNum <= 0) {
             // Remove se quantidade for 0 ou menor
             console.log(`Removendo ${productId} devido à quantidade <= 0`);
             return currentItems.filter(item => item.id !== productId);
         } else {
             // Atualiza a quantidade
             // TODO: Adicionar lógica de verificação de estoque máximo aqui
             console.log(`Atualizando quantidade de ${productId} para ${quantityNum}`);
             return currentItems.map(item =>
                 item.id === productId ? { ...item, quantity: quantityNum } : item
             );
         }
     });
 };

  const increaseQuantity = (productId) => {
    setCartItems(prevItems => {
        const currentItems = Array.isArray(prevItems) ? prevItems : [];
        return currentItems.map(item =>
            item.id === productId
            // Garante que quantity é número antes de incrementar
            ? { ...item, quantity: (typeof item.quantity === 'number' ? item.quantity : 0) + 1 }
            : item
            // TODO: Adicionar lógica de verificação de estoque máximo aqui
        );
    });
  };

   const decreaseQuantity = (productId) => {
     setCartItems(prevItems => {
         const currentItems = Array.isArray(prevItems) ? prevItems : [];
         const existingItemIndex = currentItems.findIndex(item => item.id === productId);

         if (existingItemIndex === -1) return currentItems; // Item não encontrado

         const existingItem = currentItems[existingItemIndex];
         const currentQuantity = typeof existingItem.quantity === 'number' ? existingItem.quantity : 1; // Assume 1 se inválido

         if (currentQuantity <= 1) {
             // Remove se a quantidade atual for 1 ou menos
             console.log(`Removendo ${productId} ao diminuir quantidade para 0 ou menos.`);
             return currentItems.filter(item => item.id !== productId);
         } else {
             // Diminui a quantidade
             console.log(`Diminuindo quantidade de ${productId}.`);
             const updatedItems = [...currentItems];
             updatedItems[existingItemIndex] = { ...existingItem, quantity: currentQuantity - 1 };
             return updatedItems;
         }
     });
   };


  const clearCart = () => {
    console.log("Limpando carrinho.");
    setCartItems([]); // Define como array vazio
    message.info('Carrinho esvaziado.');
  };

  // --- Cálculos Derivados (com mais segurança) ---

  const cartItemCount = useMemo(() => {
    // Garante que cartItems é um array
    const currentItems = Array.isArray(cartItems) ? cartItems : [];
    return currentItems.reduce((count, item) => {
        // Garante que item.quantity é um número antes de somar
        const quantity = typeof item?.quantity === 'number' ? item.quantity : 0;
        return count + quantity;
    }, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
     // Garante que cartItems é um array
    const currentItems = Array.isArray(cartItems) ? cartItems : [];
    return currentItems.reduce((total, item) => {
        // Garante que price e quantity são números válidos
        const price = typeof item?.price === 'number' ? item.price : 0;
        const quantity = typeof item?.quantity === 'number' ? item.quantity : 0;
        return total + price * quantity;
    }, 0);
  }, [cartItems]);
  // --- Fim Cálculos ---


  // 3. Valor fornecido pelo Contexto
  const value = useMemo(() => ({ // Envolve value em useMemo para otimização
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartItemCount,
    cartTotal,
  }), [cartItems, cartItemCount, cartTotal]); // Dependências do value

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 4. Hook Customizado para consumir o Contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};