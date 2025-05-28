// src/pages/MyAccountPage/MyAccountPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Typography, Card, Row, Col, Spin, Button, Space, Divider, message, Modal, Form, Input, Alert
} from 'antd';

import {
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, LockOutlined, LoadingOutlined, ShoppingCartOutlined
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import HeaderAgro from '../../componentsAgro/HeaderAgro/HeaderAgro';
// import FooterAgro from '../../componentsAgro/FooterAgro';
import { useAuth } from '../../context/AuthContext';
import './MyAccountPage.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Item } = Form;


// <<< URL BASE DA SUA API BACKEND >>>
const API_BASE_URL = 'http://localhost:3001/api/v1';


const MyAccountPage = () => {
  const navigate = useNavigate();
  const { user: authenticatedUser, isAuthenticated, loading: authLoading, token, logout } = useAuth();

  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm] = Form.useForm();


   const handleModalCancel = () => {
     console.log("Modal cancelado.");
     setIsEditModalVisible(false);
     editForm.resetFields();
   };


  // --- Efeito para verificar autenticação E buscar detalhes do usuário logado da API ---
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      message.warning("Você precisa fazer login para acessar sua conta.", 3);
      navigate('/auth', { replace: true });
      return;
    }

    const currentUserId = authenticatedUser?.user_id;
    const detailsNeedFetching = isAuthenticated && currentUserId && !authLoading && (!userDetails || userDetails.user_id !== currentUserId) && !loadingDetails && !errorDetails;

    if (detailsNeedFetching) {
        console.log(`Autenticado (User ID: ${currentUserId}), buscando detalhes pela API...`);
        const fetchUserDetails = async () => {
            setLoadingDetails(true);
            setErrorDetails(null);

            try {
                const url = `${API_BASE_URL}/me`;
                console.log("Chamando API:", url);

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const contentType = response.headers.get("content-type");
                 if (!contentType || !contentType.includes("application/json")) {
                    const errorText = await response.text();
                    console.error("Resposta da API não é JSON válida para detalhes do usuário:", response.status, errorText);
                    if (response.status === 401 || response.status === 403) {
                         console.error("API retornou 401/403. Deslogando frontend.");
                         logout();
                         return;
                    }
                    throw new TypeError("Resposta da API não é JSON válida para detalhes do usuário.");
                 }

                const data = await response.json();

                if (response.ok && data && data.user_id === currentUserId) {
                    setUserDetails(data);
                    console.log("Detalhes do usuário recebidos da API:", data);
                } else if (response.status === 401 || response.status === 403) {
                     console.error("API retornou 401/403 para /me endpoint. Deslogando frontend.");
                     logout();
                }
                 else {
                    console.error(`API retornou status ${response.status} ou dados inválidos/inesperados para /me endpoint:`, data);
                    setErrorDetails(data?.message || `Erro ${response.status}: Falha ao carregar dados do usuário.`);
                    setUserDetails(null);
                }

            } catch (err) {
                console.error("Erro na comunicação ou inesperado ao buscar detalhes:", err);
                 if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                      setErrorDetails('Não foi possível conectar ao servidor backend para buscar seus dados.');
                 } else {
                      setErrorDetails(err?.message || 'Erro inesperado ao buscar dados do usuário.');
                 }
                 setUserDetails(null);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchUserDetails();
    }
     else if (!isAuthenticated && !authLoading && userDetails) {
         console.log("Usuário deslogado, limpando detalhes locais.");
         setUserDetails(null);
         setLoadingDetails(false);
         setErrorDetails(null);
     }
     else if (isAuthenticated && !authenticatedUser && !authLoading && !errorDetails) {
         console.error("AuthContext state inconsistency: isAuthenticated is true, but user object is missing after authLoading finishes.");
         setErrorDetails("Erro de autenticação interna. Tente relogar.");
         setUserDetails(null);
         setLoadingDetails(false);
     }

  }, [isAuthenticated, authenticatedUser?.user_id, authLoading, token, navigate, API_BASE_URL, logout]);


  // --- Lógica de Loading e Redirecionamento (No JSX) ---
  if (authLoading || loadingDetails) {
       return (
         <div className="ecommerce-loading-page">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} size="large" tip={authLoading ? "Verificando acesso..." : "Carregando seus dados..."}>
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
            </Spin>
         </div>
       );
    }

    if (!isAuthenticated) {
         return null;
     }

    if (errorDetails) {
         return (
            <Layout className="ecommerce-layout my-account-layout">
               <HeaderAgro/>
               <Content className="ecommerce-main-content my-account-content" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
                 <Alert message="Erro ao carregar seus dados" description={errorDetails} type="error" showIcon />
               </Content>
            </Layout>
          );
     }

   if (!userDetails) {
        return (
           <Layout className="ecommerce-layout my-account-layout">
              <HeaderAgro/>
              <Content className="ecommerce-main-content my-account-content" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
                <Alert message="Erro interno" description="Não foi possível carregar os detalhes do usuário." type="error" showIcon />
              </Content>
           </Layout>
        );
   }

   const { name, email, whatsapp_number, address } = userDetails;


  // --- Handlers para botões ---
  const handleEditProfile = () => {
       editForm.setFieldsValue({
           name: name,
           email: email,
           whatsapp_number: whatsapp_number,
           address: {
               cep: userDetails?.address?.cep,
               street: userDetails?.address?.street,
               number: userDetails?.address?.number,
               complement: userDetails?.address?.complement,
               neighborhood: userDetails?.address?.neighborhood,
               city: userDetails?.address?.city,
               state: userDetails?.address?.state,
           }
       });
      setIsEditModalVisible(true);
  };

  const handleEditAddress = () => {
      console.log("Editar Endereço (Placeholder)");
       message.info("Funcionalidade de edição de endereço em construção.");
  };
  const handleChangePassword = () => {
      console.log("Mudar Senha (Placeholder)");
       message.info("Funcionalidade de alteração de senha em construção.");
  };

  // --- Handler do Modal de Edição (Submit) ---
  const handleModalSubmit = async () => {
      try {
          const values = await editForm.validateFields();
          setIsEditing(true);

           console.log("Dados de edição do perfil:", values);

          const url = `${API_BASE_URL}/me`;

          const response = await fetch(url, {
              method: 'PUT',
              headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify({
                   name: values.name,
                   whatsapp_number: values.whatsapp_number,
                   // address: values.address // Exemplo se o formulário incluir edição de address
               }),
          });

           const contentType = response.headers.get("content-type");
           if (!contentType || !contentType.includes("application/json")) {
              const errorText = await response.text();
              console.error("Resposta da API não é JSON válida para atualização:", response.status, errorText);
               if (response.status === 401 || response.status === 403) {
                    logout();
                    message.error("Sessão expirada ou inválida. Faça login novamente.");
                    return;
               }
              throw new TypeError("Resposta da API não é JSON válida para atualização.");
           }

          const data = await response.json();

          if (response.ok && data) {
              setUserDetails(data);
              message.success('Dados atualizados com sucesso!', 2);
              setIsModalVisible(false);
          } else {
              console.error("Erro da API ao atualizar usuário:", data.message || response.statusText);
              message.error(data.message || `Erro ${response.status}: Falha ao atualizar dados.`);
          }

      } catch (info) {
          console.error('Validação ou Submissão falhou:', info);
           if (info && info.errorFields) {
               message.error('Por favor, corrija os erros no formulário.');
          } else if (info instanceof TypeError && info.message.includes('Failed to fetch')) {
               message.error('Não foi possível conectar ao servidor backend para salvar.');
          } else {
              message.error(info.message || 'Erro inesperado ao salvar dados.');
          }

      } finally {
          setIsEditing(false);
      }
  };


  // Renderização Principal
  return (
    <Layout className="ecommerce-layout my-account-layout">
      <HeaderAgro />

      <Content className="ecommerce-main-content my-account-content">
        <Title level={2} className="my-account-title">Minha Conta</Title>
        <Paragraph type="secondary" className="my-account-subtitle">Gerencie seus dados, endereços e pedidos.</Paragraph>

        <Row gutter={[24, 24]}>
          {/* Dados Pessoais */}
          <Col xs={24} md={12}>
            <Card
              title={<Space><UserOutlined /> Dados Pessoais</Space>}
              bordered={false}
              className="my-account-card profile-card"
              extra={<Button type="text" icon={<EditOutlined />} onClick={handleEditProfile} disabled={isEditing || loadingDetails}>Editar</Button>}
            >
              <Space direction="vertical" size={12} style={{width: '100%'}}>
                {/* Usa dados do estado userDetails */}
                <Text><Text strong>Nome:</Text> {userDetails.name || 'Não informado'}</Text>
                <Text><Text strong>E-mail:</Text> {userDetails.email || 'Não informado'}</Text>
                <Text><Text strong>Telefone/WhatsApp:</Text> {userDetails.whatsapp_number || 'Não informado'}</Text>
                {/* Adicione outros dados pessoais aqui se a API retornar */}
              </Space>
               <Divider dashed/>
               <Button type="link" onClick={handleChangePassword} style={{padding: 0}} disabled={isEditing || loadingDetails}>Alterar Senha</Button>
            </Card>
          </Col>

          {/* Endereço de Entrega */}
          <Col xs={24} md={12}>
             <Card
               title={<Space><EnvironmentOutlined /> Endereço de Entrega</Space>}
               bordered={false}
               className="my-account-card address-card"
                extra={<Button type="text" icon={<EditOutlined />} onClick={handleEditAddress} disabled={isEditing || loadingDetails}>Editar</Button>}
             >
                {/* Usa dados do estado userDetails e acesso seguro com ? */}
                {userDetails.address ? (
                    <Space direction="vertical" size={6} style={{width: '100%'}}>
                       <Text>{userDetails.address?.street || 'Rua/Avenida não informada'}, {userDetails.address?.number || 'S/N'}</Text>
                        {userDetails.address?.complement && <Text>Complemento: {userDetails.address.complement}</Text>}
                       <Text>{userDetails.address?.neighborhood || 'Bairro não informado'}</Text>
                       <Text>{(userDetails.address?.city || 'Cidade não informada')} - {(userDetails.address?.state || 'UF não informada')}</Text>
                       <Text>CEP: {userDetails.address?.cep || 'Não informado'}</Text>
                    </Space>
                 ) : (
                    <Text type="secondary">Nenhum endereço cadastrado.</Text>
                 )}
             </Card>
          </Col>
        </Row>

         {/* Botão ou Card para Meus Pedidos */}
         <Card bordered={false} className="my-account-card orders-card">
             <Space size="large" align="center" style={{width: '100%', justifyContent: 'space-between'}}>
                 <Title level={4} style={{margin: 0}}><ShoppingCartOutlined/> Meus Pedidos</Title>
                 {/* <<< BOTÃO VER TODOS OS PEDIDOS: JÁ NAVEGA PARA /meus-pedidos-agro >>> */}
                 <Button type="primary" size="large" onClick={() => navigate('/meus-pedidos')} disabled={isEditing || loadingDetails}>Ver Todos os Pedidos</Button>
             </Space>
         </Card>


        {/* Modal de Edição de Dados Pessoais */}
        <Modal
          title="Editar Dados Pessoais"
          open={isEditModalVisible}
          onOk={handleModalSubmit}
          onCancel={handleModalCancel} // Usa a função definida handleModalCancel
          okText="Salvar"
          cancelText="Cancelar"
          confirmLoading={isEditing}
          destroyOnClose={true}
          className="my-account-edit-modal"
        >
           <Spin spinning={isEditing} tip="Salvando...">
               <Form
                 form={editForm}
                 layout="vertical"
                 name="edit_profile_form"
                 initialValues={userDetails}
               >
                 <Item
                   name="name"
                   label="Nome Completo"
                   rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
                 >
                   <Input prefix={<UserOutlined />} placeholder="Seu nome completo" />
                 </Item>

                 <Item
                   name="email"
                   label="E-mail"
                 >
                   <Input prefix={<MailOutlined />} disabled={true} />
                 </Item>

                 <Item
                   name="whatsapp_number"
                   label="WhatsApp (Opcional)"
                 >
                   <Input prefix={<PhoneOutlined />} placeholder="Ex: 41987654321" />
                 </Item>

               </Form>
           </Spin>
        </Modal>


      </Content>

      {/* Renderiza Footer (ajuste conforme seu componente) */}
       <footer className="placeholder-footer"> E-commerce Footer </footer>
    </Layout>
  );
};

export default MyAccountPage;