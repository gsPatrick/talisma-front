// src/pages/AdminDashboardPage/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Typography, Card, Row, Col, Space, Button, Spin, Alert,
  message
} from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  TagOutlined, // Ícone para Produtos
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminProductsPage from './AdminProductsPage'; // Importa a página de produtos admin
import './AdminDashboardPage.css';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// Placeholder Logo - Substitua pela sua URL real do logo (pode ser diferente do e-commerce)
const adminLogoUrl = "https://i.imgur.com/xOouAUy.png";


const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  // <<< ALTERADO: Começa com 'products' selecionado >>>
  const [selectedKey, setSelectedKey] = useState('products');


  // Efeito para verificar autenticação ao carregar a página
  useEffect(() => {
    // Se não estiver autenticado e o loading inicial já terminou, redireciona para o login
    if (!isAuthenticated && !loading) {
      message.warning("Você precisa fazer login para acessar o Dashboard.", 3);
      navigate('/admin/auth', { replace: true });
      return;
    }
    // Se estiver autenticado mas os dados do usuário ainda não carregaram, espere
  }, [isAuthenticated, loading, navigate, user]);


  // Exibe spinner GLOBAL apenas enquanto loading do AuthContext for true OU se user existir mas sem ID (problema de state)
  // A busca de detalhes ou outros loadings específicos das sub-páginas (AdminProductsPage, etc.)
  // devem ser gerenciados DENTRO dessas sub-páginas.
  if (loading || (isAuthenticated && !user && !loading)) { // Verifica se isAuthenticated mas user é null após loading
       console.log("Renderizando spinner AdminDashboardPage:", {authLoading: loading, isAuthenticated: isAuthenticated, userExists: !!user});
      return (
        <div className="admin-loading-page">
           <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} size="large" tip={loading ? "Carregando autenticação..." : "Verificando usuário..."}>
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
           </Spin>
        </div>
      );
   }

  // Se loading do AuthContext terminou E NÃO está autenticado, redireciona (já tratado pelo useEffect)
   if (!isAuthenticated && !loading) {
       console.log("AdminDashboardPage: AuthContext terminou, não autenticado. Redirecionando via useEffect.");
       return null; // O useEffect já cuidou do navigate
   }
    // Se autenticado, mas user object é null após authLoading (inconsistência do context)
    if (isAuthenticated && !user && !loading) {
        console.error("AdminDashboardPage: State inconsistency - isAuthenticated true, but user is null after loading.");
        // Mostra um erro aqui pois o state está inconsistente
         return (
             <Layout className="admin-dashboard-layout">
                <Header className="admin-header"> {/* ... header minimal */} </Header>
                <Content className="admin-content-layout">
                   <Alert message="Erro de Autenticação" description="Não foi possível carregar os dados do usuário admin. Tente relogar." type="error" showIcon style={{maxWidth: '600px', margin: '40px auto'}}/>
                </Content>
             </Layout>
         );
    }


  // Conteúdo a ser renderizado baseado no item de menu selecionado
  const renderContent = () => {
    // user está garantido como não null e autenticado aqui
    switch (selectedKey) {
      case 'dashboard':
         return (
           <div className="dashboard-overview-content">
                <Title level={3} className="dashboard-overview-title">Resumo do Dashboard (Placeholder)</Title>
                 <p>Conteúdo do dashboard principal.</p>
                 <Alert message="Esta é a página de dashboard principal (placeholder)." description="Navegue usando o menu lateral. Atualmente, apenas 'Produtos' está disponível." type="info" showIcon />
            </div>
         );
      // <<< Renderiza a página de produtos admin >>>
      case 'products':
        // Passar user e token para a página de produtos se ela precisar (opcional, pode usar useAuth dentro dela tbm)
        return <AdminProductsPage />;
      // Removidos os casos 'orders', 'customers', 'settings' pois não estão mais no menu
      default:
        return (
            <div className="dashboard-section-placeholder">
                <Title level={3}>Seção Não Encontrada</Title>
                <Alert message="Seção não encontrada ou não implementada." type="warning" showIcon />
            </div>
        );
    }
  };

  // Renderiza o layout do dashboard APENAS se autenticado E user está disponível
  // O loading e os erros de autenticação/inconsistência já foram tratados acima.
  return (
    <Layout className="admin-dashboard-layout">
      {/* Cabeçalho do Dashboard */}
      <Header className="admin-header">
         <div className="admin-header-left">
            <Link to="/admin/dashboard">
                <img src={adminLogoUrl} alt="AgroStore Admin Logo" className="admin-logo" />
            </Link>
             <Title level={4} className="admin-header-title">Painel Administrativo</Title>
         </div>
         <div className="admin-header-right">
             <Space size="middle">
                 {/* Exibe nome do usuário logado */}
                 {user && <Text className="admin-user-greeting">Olá, <Text strong>{user.name || 'Admin'}</Text></Text>}
                 {/* Botão de Logout */}
                 <Button type="text" icon={<LogoutOutlined />} onClick={logout} className="admin-logout-button">Sair</Button>
             </Space>
         </div>
      </Header>

      <Layout>
        {/* Barra Lateral (Sider) */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          width={250}
          className="admin-sider"
          theme="light" // Explicitamente setado para light para facilitar o CSS
        >
          {/* Menu de Navegação do Dashboard - Usando a nova API com 'items' */}
          {/* <<< ATUALIZADO: USANDO items PROP NO MENU >>> */}
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            onSelect={({ key }) => setSelectedKey(key)}
            className="admin-sidebar-menu"
            items={[ // Definido array de itens diretamente na prop items
                 {
                     key: 'products',
                     icon: <TagOutlined />,
                     label: 'Produtos',
                 },
                 // Adicione outros itens de menu aqui conforme implementar as páginas
                 // { type: 'divider' },
                 // { key: 'settings', icon: <SettingOutlined />, label: 'Configurações' },
            ]}
          /> {/* Fim Menu com items */}

        </Sider>

        {/* Conteúdo Principal */}
        <Layout className="admin-content-layout">
          <Content className="admin-content">
             {renderContent()} {/* Renderiza o conteúdo da seção selecionada */}
          </Content>
           {/* Opcional: Footer do Admin */}
            {/* <Layout.Footer style={{ textAlign: 'center', padding: '12px', color: '#888' }}>
                AgroStore Admin ©{new Date().getFullYear()}
            </Layout.Footer> */}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboardPage;