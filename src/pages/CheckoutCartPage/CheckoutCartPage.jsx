// src/pages/CheckoutCartPage/CheckoutCartPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // CORREÇÃO: Esta importação deve estar em uma linha separada
import { Form, Input, Button, Radio, Typography, Card, Row, Col, Divider, message, Spin, Steps, List, Avatar, Layout, Space, Empty, Select, Alert } from 'antd'; // Importado Alert para mensagem de erro de frete
import { CreditCardOutlined, QrcodeOutlined, BarcodeOutlined, LockOutlined, UserOutlined, MailOutlined, ArrowLeftOutlined, WhatsAppOutlined, LoadingOutlined, EnvironmentOutlined, TruckOutlined } from '@ant-design/icons';
import HeaderAgro from '../../componentsAgro/HeaderAgro/HeaderAgro'; // <<< Verifique o caminho
// import FooterLP from '../../componentsLP/FooterLP'; // <<< Verifique o caminho (ou use FooterAgro)
import { useCart } from '../../context/CartContext'; // Importa o hook do carrinho
import debounce from 'lodash.debounce'; // Importa debounce
import './CheckoutCartPage.css'; // Estilos específicos para esta página

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Option } = Select; // Importa Option para o Select de Frete

// Função formatPrice
const formatPrice = (value) => {
  if (typeof value !== 'number' || isNaN(value)) { return 'R$ --'; }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Simulação de dados Pix/Boleto
const fakePixData = { qrCodeValue: "000201...", copyPasteCode: "000201..." };
const fakeBoletoLink = "https://...";
const fakeBoletoBarcode = "...";

// Simulação API Melhor Envio / Frete
const calculateShippingOptions = async (cep, cartWeight = 1) => {
  console.log(`Simulando cálculo de frete para CEP: ${cep}, Peso: ${cartWeight}kg`);
  await new Promise(resolve => setTimeout(resolve, 800));
  const options = [];
  const cepPrefix = cep.substring(0, 5);
  if (cepPrefix >= "01000" && cepPrefix <= "09999") {
      options.push({ id: 'pac', name: 'PAC', cost: 15.50, estimated_delivery: 5 });
      options.push({ id: 'sedex', name: 'SEDEX', cost: 25.00, estimated_delivery: 2 });
      options.push({ id: 'jadlog', name: '.Package (Jadlog)', cost: 22.80, estimated_delivery: 3 });
  } else if (cepPrefix >= "20000" && cepPrefix <= "28999") {
      options.push({ id: 'pac', name: 'PAC', cost: 18.00, estimated_delivery: 7 });
      options.push({ id: 'sedex', name: 'SEDEX', cost: 35.50, estimated_delivery: 3 });
  } else if (cepPrefix >= "88000" && cepPrefix <= "88999") { // Exemplo para SC
       options.push({ id: 'pac', name: 'PAC', cost: 22.00, estimated_delivery: 10 });
       options.push({ id: 'sedex', name: 'SEDEX', cost: 40.00, estimated_delivery: 4 });
       options.push({ id: 'jadlog', name: '.Package (Jadlog)', cost: 45.00, estimated_delivery: 6 });
  }
  // Simula um pequeno erro aleatório
  // if (Math.random() < 0.1) { throw new Error("Erro ao calcular frete. Tente novamente."); }
  return options;
};

const CheckoutCartPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, cartItemCount } = useCart();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currentStep, setCurrentStep] = useState(0);

  // Estados para Frete
  const [shippingCep, setShippingCep] = useState('');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [shippingError, setShippingError] = useState(null);

  // Redireciona se carrinho vazio
  useEffect(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      message.warning('Seu carrinho está vazio. Adicione itens para continuar.', 3);
      const timer = setTimeout(() => { navigate('/produtos'); }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems, navigate]);

  // Lógica ViaCEP
  const fetchAddressFromCep = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
        setShippingAddress(null); setShippingOptions([]); setSelectedShipping(null); setShippingError(null);
        // Limpa campos de endereço se o CEP ficar inválido
        form.setFieldsValue({ shippingStreet: undefined, shippingNumber: undefined, shippingComplement: undefined });
        return;
    }
    setLoadingAddress(true); setShippingError(null);
    console.log(`Buscando endereço para CEP: ${cleanCep}`);
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!response.ok) throw new Error('Erro na comunicação com ViaCEP.');
        const data = await response.json();
        if (data.erro) throw new Error('CEP não encontrado.');
        const address = { street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf };
        setShippingAddress(address);
        // Pré-preenche campos do formulário
        form.setFieldsValue({
            shippingStreet: address.street,
            // outros campos como bairro, cidade, estado podem ser preenchidos se adicionados ao form e se não estiverem sendo gerenciados pelo state
        });
        await fetchShippingOptions(cleanCep); // Chama cálculo de frete
    } catch (error) {
        console.error("Erro ao buscar CEP:", error); setShippingAddress(null); setShippingOptions([]); setSelectedShipping(null);
        setShippingError(error.message || "Não foi possível buscar o endereço.");
        // Limpa campos de endereço em caso de erro
        form.setFieldsValue({ shippingStreet: undefined, shippingNumber: undefined, shippingComplement: undefined });
    } finally { setLoadingAddress(false); }
  };

  // Lógica Frete
  const fetchShippingOptions = async (cep) => {
     const cleanCep = cep.replace(/\D/g, '');
     if (cleanCep.length !== 8) {
        setShippingOptions([]); setSelectedShipping(null);
        return;
     }
    setLoadingShipping(true); setShippingError(null); setShippingOptions([]); setSelectedShipping(null);
    try {
        const cartWeight = cartItems.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0);
        const options = await calculateShippingOptions(cleanCep, Math.max(cartWeight, 0.5)); // Peso mínimo
        setShippingOptions(options);
        if (options.length === 0) { setShippingError("Nenhuma opção de frete encontrada para este CEP."); }
    } catch (error) {
        console.error("Erro ao calcular frete:", error); setShippingError(error.message || "Erro ao calcular opções de frete.");
    } finally { setLoadingShipping(false); }
  };

  // Debounce CEP
  const debouncedFetchAddress = useCallback(debounce(fetchAddressFromCep, 600), [form]); // Adiciona form à dependência se setFieldsValue for usado

  // Handlers
  const handleCepChange = (e) => {
    const cep = e.target.value;
    setShippingCep(cep);
    // Limpa o endereço e opções de frete imediatamente ao digitar no CEP
    setShippingAddress(null);
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingError(null);
    form.setFieldsValue({ shippingStreet: undefined, shippingNumber: undefined, shippingComplement: undefined });

    debouncedFetchAddress(cep);
  };
  const handleShippingSelect = (value) => { const selectedOption = shippingOptions.find(opt => opt.id === value); setSelectedShipping(selectedOption || null); };
  const handlePaymentMethodChange = (e) => { setPaymentMethod(e.target.value); };

  // Atualiza passo do Steps baseado nos campos preenchidos
  const handleFormValuesChange = useCallback((changedValues, allValues) => {
    // Verifica se pelo menos um campo da primeira etapa foi preenchido para avançar
    const firstStepFilled = allValues.payerName || allValues.payerEmail || allValues.whatsappNumber || allValues.shippingCep;
    if (firstStepFilled && currentStep === 0) {
      setCurrentStep(1);
    }
     // Opcional: Voltar para a primeira etapa se todos os campos dela forem esvaziados
     // else if (!firstStepFilled && currentStep > 0) {
     //    setCurrentStep(0);
     // }
  }, [currentStep]);


  // Calcula Total Final
  const finalTotal = useMemo(() => { const shippingCost = selectedShipping?.cost ?? 0; return cartTotal + shippingCost; }, [cartTotal, selectedShipping]);

  // Finalizar Checkout
  const handleFinishCheckout = async (values) => {
    // Validações adicionais antes de finalizar
    if (shippingOptions.length > 0 && !selectedShipping) { message.warning("Selecione uma opção de frete."); return; }
    if (!shippingAddress) { message.warning("Informe e valide seu CEP antes de continuar."); return; }


    setLoading(true);
    // Garante que o Steps vá para o passo de pagamento/revisão se ainda não estiver lá
    if(currentStep < 1) setCurrentStep(1);

    console.log('Finalizando Compra:', { /* ... */ });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay da API de pagamento/pedido

    // Simulação de sucesso ou falha da API do pedido
    const isOrderSuccess = Math.random() > 0.1; // 90% de chance de sucesso simulado

    if (isOrderSuccess) {
      message.loading('Preparando dados do pedido...', 1);
      // clearCart(); // Limpar depois que o pedido for realmente confirmado pelo backend

      // Monta o endereço completo para passar na navegação
      const fullAddress = shippingAddress ?
        `${values.shippingStreet || shippingAddress.street}, ${values.shippingNumber || ''}${values.shippingComplement ? ' - ' + values.shippingComplement : ''} - ${shippingAddress.neighborhood}, ${shippingAddress.city}-${shippingAddress.state}`
        : 'Endereço não informado'; // Fallback caso address não esteja disponível por algum motivo


      navigate('/awaiting-payment', {
        replace: true, // Substitui a página atual no histórico de navegação
        state: {
            // Passa dados relevantes para a página de status de pagamento
            method: paymentMethod,
            planName: `Pedido #${Math.floor(Math.random()*10000)}`, // Número de pedido simulado
            amount: finalTotal,
            pixData: paymentMethod === 'pix' ? fakePixData : null,
            boletoLink: paymentMethod === 'boleto' ? fakeBoletoLink : null,
            boletoBarcode: paymentMethod === 'boleto' ? fakeBoletoBarcode : null,
            customerName: values.payerName,
            customerEmail: values.payerEmail,
            customerWhatsapp: values.whatsappNumber,
            shippingInfo: selectedShipping ? { method: selectedShipping.name, cost: selectedShipping.cost, estimatedDays: selectedShipping.estimated_delivery } : null,
            address: fullAddress,
            orderItems: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.quantity, imageUrl: item.imageUrl }))
        }
      });
       // Limpa o carrinho APENAS se a navegação ocorrer (sucesso simulado)
      clearCart();

    } else {
      message.error('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
      // Em caso de falha, mantém os dados no formulário e Steps no estado atual
      setLoading(false);
      // Se houver um erro de frete, talvez queira voltar para o passo 0 ou indicar no passo 1
      // setCurrentStep(0); // Opcional: Voltar para o início em caso de falha crítica
    }
  };

  // Falha Validação do Formulário Ant Design
  const onFinishFailed = (errorInfo) => {
      console.log('Falha na validação do formulário:', errorInfo);
      message.warning('Por favor, preencha todos os campos obrigatórios.');

      // Tenta mover o Steps para o primeiro passo se houver erro em campos dele
      const hasErrorInFirstStep = errorInfo.errorFields.some(field =>
          ['payerName', 'payerEmail', 'whatsappNumber', 'shippingCep', 'shippingStreet', 'shippingNumber'].includes(field.name[0])
      );
      if (hasErrorInFirstStep && currentStep > 0) {
         setCurrentStep(0);
      } else if (currentStep === 0 && (form.getFieldValue('payerName') || form.getFieldValue('payerEmail') || form.getFieldValue('whatsappNumber') || form.getFieldValue('shippingCep'))) {
         // Se já preencheu algo no passo 0 mas falhou em outros campos (ex: frete não selecionado), mantém no passo 1
         setCurrentStep(1);
      }
  };

  // Renderizar Campos Cartão
  const renderCardFields = () => (
     <>
      <Form.Item name="cardName" label="Nome no Cartão" rules={[{ required: true, message: 'Insira o nome como está no cartão!' }]}>
        <Input prefix={<UserOutlined />} placeholder="Nome Completo" size="large" />
      </Form.Item>
      <Form.Item name="cardNumber" label="Número do Cartão" rules={[{ required: true, message: 'Insira o número do cartão!' }, { pattern: /^\d{13,19}$/, message: 'Número de cartão inválido!' }]}>
        <Input prefix={<CreditCardOutlined />} placeholder="0000 0000 0000 0000" size="large" />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="expiry" label="Validade (MM/AA)" rules={[{ required: true, message: 'Insira a validade!' }, { pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/, message: 'Formato inválido (MM/AA)!' }]}>
            <Input placeholder="MM/AA" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="cvc" label="CVC" rules={[{ required: true, message: 'Insira o CVC!' }, { pattern: /^\d{3,4}$/, message: 'CVC inválido!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Código" size="large" />
          </Form.Item>
        </Col>
      </Row>
    </>
   );

  // Renderizar Info Pix/Boleto
  const renderPixBoletoInfo = () => (
     <div className="payment-instructions">
      <Paragraph style={{color: 'inherit'}}>
        {paymentMethod === 'pix' ? 'Após confirmar, um QR Code e código Pix serão gerados na próxima tela para você realizar o pagamento instantâneo.' : 'Após confirmar, o boleto bancário será gerado na próxima tela com as instruções para pagamento.'}
      </Paragraph>
      <Paragraph strong style={{color: 'inherit'}}>
        A liberação do seu pedido ocorrerá após a confirmação do pagamento pela instituição financeira.
      </Paragraph>
      {(paymentMethod === 'pix' || paymentMethod === 'boleto') && (
        <Paragraph type="secondary" style={{ fontSize: '0.9em', color: '#777' }}>
           Você será redirecionado para uma página segura com os detalhes para concluir seu pagamento.
        </Paragraph>
      )}
    </div>
   );

  // --- Renderização Principal ---
  return (
    <Layout className="ecommerce-layout checkout-cart-layout">
      {typeof HeaderAgro === 'function' ? <HeaderAgro /> : null}

      <Content className="ecommerce-main-content checkout-cart-content">
        <Form
          form={form} name="checkout_cart_form"
          onFinish={handleFinishCheckout} onFinishFailed={onFinishFailed}
          onValuesChange={handleFormValuesChange}
          layout="vertical" requiredMark={false}
          className="checkout-form-container"
          initialValues={{ shippingCep: shippingCep }} // Passa valor inicial do CEP
        >
          {/* O Spin agora envolve apenas o conteúdo que deve ser bloqueado durante o loading principal/CEP/Frete */}
          <Spin spinning={loading || loadingAddress || loadingShipping} tip={loading ? "Finalizando pedido..." : (loadingAddress ? "Buscando CEP..." : "Calculando Frete...")} size="large">
             <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/produtos')} className="checkout-back-button" style={{ marginBottom: '20px' }}>
               Continuar Comprando
            </Button>

            <Title level={2} className="checkout-title">Finalizar Compra</Title>
            {/* Steps */}
            <Steps current={currentStep} className="checkout-steps" responsive={false}>
                 <Step title="Seus Dados" description="Informe nome e contato." />
                 <Step title="Entrega e Pagamento" description="Confirme endereço e escolha como pagar." />
                 <Step title="Concluído" description="Pedido realizado!" />
            </Steps>


            <Row gutter={[32, 32]}>
              {/* Coluna Esquerda */}
              <Col xs={24} lg={12}>
                {/* Card Resumo do Pedido */}
                <Card title={`Resumo do Pedido (${cartItemCount} item${cartItemCount !== 1 ? 's' : ''})`} bordered={false} className="checkout-card summary-card">
                    {(!cartItems || cartItems.length === 0) ? (
                       <Empty description="Seu carrinho está vazio" />
                    ) : (
                       <List
                           itemLayout="horizontal" dataSource={cartItems} className="checkout-cart-item-list"
                           renderItem={item => (
                               <List.Item className="checkout-cart-item">
                                   <List.Item.Meta
                                       avatar={<Avatar shape="square" size={48} src={item?.imageUrl || 'https://via.placeholder.com/48'} />}
                                       title={<Text className="checkout-item-title" ellipsis={{ tooltip: item?.name || 'Produto' }}>{item?.name || 'Produto'}</Text>}
                                       description={ <Text type="secondary" className="checkout-item-pricing"> {item?.quantity || 1} x {formatPrice(item?.price || 0)} = {formatPrice((item?.price || 0) * (item?.quantity || 1))} </Text> }
                                   />
                               </List.Item>
                           )}
                        />
                    )}
                     <Divider style={{ margin: '16px 0'}} />
                     <div className="checkout-cart-subtotal"> <Text>Subtotal Produtos:</Text> <Text strong>{formatPrice(cartTotal)}</Text> </div>
                     {selectedShipping && ( <div className="checkout-cart-shipping"> <Text>Frete ({selectedShipping.name}):</Text> <Text strong>{formatPrice(selectedShipping.cost)}</Text> </div> )}
                     {/* Exibe "Calcular frete" se address e options não estiverem carregando e não houver opções */}
                     {!loadingAddress && !loadingShipping && !shippingAddress && (
                         <div className="checkout-cart-shipping"> <Text>Frete:</Text> <Text type="secondary">Calcular na seção de Endereço</Text> </div>
                     )}
                      {/* Exibe "Nenhum frete disponível" se address carregou mas options está vazio e não há erro */}
                     {!loadingAddress && !loadingShipping && shippingAddress && shippingOptions.length === 0 && !shippingError && (
                          <div className="checkout-cart-shipping"> <Text>Frete:</Text> <Text type="danger">Nenhum frete disponível</Text> </div>
                      )}
                      {/* Exibe erro de frete se houver */}
                      {!loadingShipping && shippingError && (
                           <div className="checkout-cart-shipping"> <Text>Frete:</Text> <Text type="danger">{shippingError}</Text> </div>
                       )}


                     <Divider style={{ margin: '12px 0'}} dashed/>
                     <div className="checkout-cart-total final-total"> <Text strong>Total:</Text> <Text strong className="total-price">{formatPrice(finalTotal)}</Text> </div>
                </Card>

                 {/* Card Dados do Comprador */}
                <Card title="Dados do Comprador" bordered={false} className="checkout-card">
                    <Form.Item name="payerName" label="Nome Completo" rules={[{ required: true, message: 'Insira seu nome!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Seu nome como no documento" size="large" />
                    </Form.Item>
                    <Form.Item name="payerEmail" label="E-mail" rules={[{ required: true, message: 'Insira seu e-mail!' }, { type: 'email', message: 'E-mail inválido!' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Para confirmação e contato" size="large" type="email" />
                    </Form.Item>
                    {/* Adicionado validação básica de telefone/whatsapp */}
                    <Form.Item
                       name="whatsappNumber" label="WhatsApp (Opcional)"
                       rules={[{ pattern: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, message: 'Formato de número de WhatsApp inválido!' }]}
                       tooltip="Ex: (99) 99999-9999"
                    >
                        <Input prefix={<WhatsAppOutlined />} placeholder="Seu número com DDD" size="large" type="tel" />
                    </Form.Item>
                </Card>
              </Col>

              {/* Coluna Direita */}
              <Col xs={24} lg={12}>
                 {/* Card Endereço de Entrega */}
                 <Card title="Endereço de Entrega" bordered={false} className="checkout-card">
                     <Form.Item
                        name="shippingCep" label="CEP"
                        rules={[{ required: true, message: 'Informe o CEP!' }]}
                        tooltip="Digite o CEP para buscar o endereço e calcular o frete."
                        validateStatus={shippingError ? 'error' : (loadingAddress ? 'validating' : (shippingAddress ? 'success' : ''))}
                        help={shippingError || (loadingAddress ? 'Buscando endereço...' : (shippingAddress ? `${shippingAddress.street || ''}, ${shippingAddress.neighborhood || ''}, ${shippingAddress.city || ''}-${shippingAddress.state || ''}` : null))}
                     >
                         <Input
                            prefix={<EnvironmentOutlined />}
                            placeholder="00000-000" size="large"
                            value={shippingCep} onChange={handleCepChange}
                            maxLength={9} // Permite 8 dígitos + hífen
                            // Implementar máscara se necessário
                         />
                     </Form.Item>
                     {/* Campos de endereço só aparecem após o CEP ser encontrado */}
                     {shippingAddress && (
                         <>
                             <Form.Item name="shippingStreet" label="Rua/Avenida" initialValue={shippingAddress.street} rules={[{ required: true, message: 'Confirme a rua!' }]}>
                                 <Input size="large" placeholder='Rua, Avenida, etc.' />
                             </Form.Item>
                              <Row gutter={16}>
                                 <Col xs={12}> {/* Coluna para Número */}
                                   <Form.Item name="shippingNumber" label="Número" rules={[{ required: true, message: 'Nº?' }]}>
                                       <Input size="large" type="text" placeholder="Número" />
                                   </Form.Item>
                                 </Col>
                                 <Col xs={12}> {/* Coluna para Complemento */}
                                   <Form.Item name="shippingComplement" label="Complemento">
                                       <Input size="large" placeholder="Apto, Bloco, Casa" />
                                   </Form.Item>
                                 </Col>
                              </Row>
                              {/* Campos que podem vir do ViaCEP mas não são editáveis aqui, apenas para informação */}
                              {/* Você pode adicioná-los se precisar que o usuário confirme, ou apenas exibir */}
                              {/*
                              <Form.Item label="Bairro">
                                  <Input size="large" value={shippingAddress.neighborhood} disabled />
                              </Form.Item>
                               <Row gutter={16}>
                                 <Col xs={12}><Form.Item label="Cidade"><Input size="large" value={shippingAddress.city} disabled /></Form.Item></Col>
                                 <Col xs={12}><Form.Item label="Estado"><Input size="large" value={shippingAddress.state} disabled /></Form.Item></Col>
                               </Row>
                              */}
                         </>
                     )}

                     {/* Seção de Frete */}
                     {/* Exibe spinner ou select apenas se o CEP foi validado e o endereço encontrado */}
                     {shippingAddress && (
                         <>
                            {loadingShipping && <Spin tip="Calculando opções de frete..." style={{display: 'block', marginTop: '1rem'}}/>}
                            {!loadingShipping && shippingOptions.length > 0 && (
                                 <Form.Item name="shippingOption" label="Opção de Frete" rules={[{ required: true, message: 'Selecione o frete!' }]}>
                                    <Select placeholder="Escolha o tipo de entrega" onChange={handleShippingSelect} size="large" value={selectedShipping?.id} >
                                        {shippingOptions.map(opt => (<Option key={opt.id} value={opt.id}> {opt.name} - {formatPrice(opt.cost)} (aprox. {opt.estimated_delivery} dias) </Option> ))}
                                    </Select>
                                 </Form.Item>
                            )}
                            {/* Exibe mensagem se não houver opções após a busca */}
                             {!loadingShipping && shippingOptions.length === 0 && !shippingError && (
                                 <Alert
                                     message="Nenhum frete disponível"
                                     description="Não encontramos opções de frete para o CEP informado. Por favor, verifique o CEP ou entre em contato."
                                     type="warning"
                                     showIcon
                                 />
                             )}
                            {/* Exibe erro específico de frete se houver */}
                            {!loadingShipping && shippingError && (
                                 <Alert
                                     message="Erro ao calcular frete"
                                     description={shippingError}
                                     type="error"
                                     showIcon
                                 />
                             )}
                         </>
                     )}
                      {/* Mensagem para digitar o CEP se ainda não o fez */}
                     {!shippingAddress && !loadingAddress && !shippingCep && (
                          <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: '1rem', color: '#777' }}>
                              Por favor, digite seu CEP acima para calcularmos as opções de frete.
                          </Paragraph>
                      )}
                 </Card>

                {/* Card Forma de Pagamento */}
                 <Card title="Forma de Pagamento" bordered={false} className="checkout-card">
                   <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod} style={{ width: '100%' }}>
                     <Row gutter={[16, 16]}>
                       <Col span={24}><Radio value="card" className="payment-method-radio"><CreditCardOutlined /> Cartão de Crédito</Radio></Col>
                       <Col span={24}><Radio value="pix" className="payment-method-radio"><QrcodeOutlined /> Pix</Radio></Col>
                       <Col span={24}><Radio value="boleto" className="payment-method-radio"><BarcodeOutlined /> Boleto Bancário</Radio></Col>
                     </Row>
                   </Radio.Group>
                 </Card>

                {/* Card Detalhes do Pagamento e Botão Finalizar */}
                <Card title="Detalhes do Pagamento" bordered={false} className="checkout-card payment-details-card">
                     {paymentMethod === 'card' && renderCardFields()}
                     {(paymentMethod === 'pix' || paymentMethod === 'boleto') && renderPixBoletoInfo()}
                     <Form.Item style={{ marginTop: '24px', marginBottom: '8px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="checkout-submit-button"
                            loading={loading}
                            size="large" block
                            icon={<LockOutlined />}
                            disabled={loading || !shippingAddress || (shippingOptions.length > 0 && !selectedShipping) || (shippingOptions.length === 0 && !shippingError) || cartItemCount === 0} // Desabilita se carregando, sem endereço, sem frete selecionado (se houver opções), ou se carrinho vazio, ou se há erro de frete e nenhuma opção
                        >
                           {loading ? 'Processando...' : `Finalizar Compra (${formatPrice(finalTotal)})`}
                        </Button>
                     </Form.Item>
                     <Paragraph className="secure-payment-info"> <LockOutlined /> Pagamento seguro. Seus dados estão protegidos. </Paragraph>
                </Card>
              </Col>
            </Row>
          </Spin> {/* Fim do Spin */}
        </Form>
      </Content>

      {/* Renderiza Header e Footer se existirem */}
      {/* typeof FooterLP === 'function' ? <FooterLP /> : <footer className="placeholder-footer"> E-commerce Footer </footer> */}
      {/* Se tiver um componente de FooterAgro, use ele */}
       <footer className="placeholder-footer"> E-commerce Footer </footer> {/* Placeholder */}

    </Layout>
  );
};

export default CheckoutCartPage;