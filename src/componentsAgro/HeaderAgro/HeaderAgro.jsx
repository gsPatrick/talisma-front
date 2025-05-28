// src/componentsAgro/HeaderAgro.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Input, Button, Badge, Dropdown, Menu, Space, Drawer, Avatar, Divider, Tooltip, AutoComplete, Spin, Typography } from 'antd';

import {
    SearchOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    MenuOutlined,
    CloseOutlined,
    DownOutlined,
    AppstoreOutlined, // Todas as Categorias
    InfoCircleOutlined, // Sobre Nós
    SafetyCertificateOutlined, // Segurança
    QuestionCircleOutlined, // FAQ
    TagOutlined, // Ofertas
    GiftOutlined, // Kits Promocionais
    LogoutOutlined, // Sair
    LoginOutlined, // Login
} from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import ShoppingCartDrawer from '../ShoppingCartDrawer/ShoppingCartDrawer';
import { useAuth } from '../../context/AuthContext'; // Hook de autenticação
import debounce from 'lodash.debounce'; // Importar debounce
import './HeaderAgro.css';

const { Text } = Typography;


// <<< DECLARAÇÃO DA VARIÁVEL logoUrl FORA DO COMPONENTE >>>
// Placeholder logo - Substitua pela sua URL real
const logoUrl = "https://i.imgur.com/xOouAUy.png"; // <<<< ESTA LINHA DEVE ESTAR AQUI >>>>


// <<< URL BASE DA SUA API BACKEND >>>
const API_BASE_URL =  'http://localhost:3001/api/v1'; // Ajuste a URL base da sua API


// Definição das categorias e subcategorias COM slugs (Mantida)
const categories = [
    { name: 'Promoção', slug: 'promocao', subcategories: [
        { name: 'Do dia', slug: 'do-dia' },
        { name: 'Especial Agro Talismã 9 Anos', slug: 'especial-agro-talisma-9-anos' },
        { name: 'Semanal', slug: 'semanal' },
        { name: 'Mensal', slug: 'mensal' },
    ]},
    { name: 'Medicamentos', slug: 'medicamentos', subcategories: [
        { name: 'Antibióticos', slug: 'antibioticos' },
        { name: 'Anti-inflamatórios', slug: 'anti-inflamatorios' },
        { name: 'Demais Medicamentos', slug: 'demais-medicamentos' },
        { name: 'Mosquicidas e Carrapaticidas', slug: 'mosquicidas-e-carrapaticidas' },
        { name: 'Vermífugos', slug: 'vermiFugos' },
        { name: 'Mata Bicheira', slug: 'mata-bicheira' },
        { name: 'Terapêuticos', slug: 'terapeuticos' },
        { name: 'IATF', slug: 'iatf' },
        { name: 'Outros', slug: 'outros' },
    ]},
    { name: 'Vestuário', slug: 'vestuario', subcategories: [
        { name: 'Acessórios', slug: 'acessorios' },
        { name: 'Bonés', slug: 'bones' },
        { name: 'Botas', slug: 'botas' },
        { name: 'Botinas', slug: 'botinas' },
        { name: 'Carteira', slug: 'carteira' },
        { name: 'Chapéu', slug: 'chapeu' },
        { name: 'Cinto', slug: 'cinto' },
        { name: 'Outros', slug: 'outros' },
    ]},
    { name: 'Casa e Jardim', slug: 'casa-e-jardim', subcategories: [
        { name: 'Baraticida', slug: 'baraticida' },
        { name: 'Cupinicida', slug: 'cupinicida' },
        { name: 'Formicida', slug: 'formicida' },
        { name: 'Herbicida', slug: 'herbicida' },
        { name: 'Inseticida', slug: 'inseticida' },
        { name: 'Lesmicida', slug: 'lesmicida' },
        { name: 'Mosquicida', slug: 'mosquicida' },
        { name: 'Raticida', slug: 'raticida' },
        { name: 'Repelente de pássaros', slug: 'repelente-de-passaros' },
        { name: 'Outros', slug: 'outros' },
    ]},
    { name: 'Ferragista', slug: 'ferragista', subcategories: [
        { name: 'Acessórios para Ferramentas', slug: 'acessorios-para-ferramentas' },
        { name: 'Bombas de Água', slug: 'bombas-de-agua' },
        { name: 'Cabos Elétricos', slug: 'cabos-eletricos' },
        { name: 'Carrinho de Mão', slug: 'carrinho-de-mao' },
        { name: 'Canos e Tubos', slug: 'canos-e-tubos' },
        { name: 'Conexões de Água', slug: 'conexoes-de-agua' },
        { name: 'Conexões de Esgoto', slug: 'conexoes-de-esgoto' },
        { name: 'Ferramentas a Bateria', slug: 'ferramentas-a-bateria' },
        { name: 'Ferramentas Elétricas', slug: 'ferramentas-eletricas' },
        { name: 'Ferramentas Manuais', slug: 'ferramentas-manuais' },
        { name: 'Ralos e Sifões', slug: 'ralos-e-sifoes' },
        { name: 'Registros', slug: 'registros' },
        { name: 'Outros', slug: 'outros' },
    ]},
    { name: 'Fazenda', slug: 'fazenda', subcategories: [
        { name: 'Acessórios cercas', slug: 'acessorios-cercas' },
        { name: 'Arames/cordoalhas', slug: 'arames-cordoalhas' },
        { name: 'Cerca elétrica', slug: 'cerca-eletrica' },
        { name: 'Eletrificador/Energizador', slug: 'eletrificador-energizador' },
        { name: 'Tela', slug: 'tela' },
        { name: 'Selaria', slug: 'selaria' },
        { name: 'Ordenha', slug: 'ordenha' },
        { name: 'Outros', slug: 'outros' },
    ]},
    { name: 'Higienização e limpeza', slug: 'higienizacao-e-limpeza', subcategories: [
        { name: 'Desinfetantes', slug: 'desinfetantes' },
        { name: 'Detergentes', slug: 'detergentes' },
        { name: 'Outros Químicos', slug: 'outros-quimicos' },
    ]},
    { name: 'Pet', slug: 'pet', subcategories: [
        { name: 'Brinquedos', slug: 'brinquedos' },
        { name: 'Coleira', slug: 'coleira' },
        { name: 'Vestiários', slug: 'vestiarios' },
    ]},
    { name: 'Suplementos', slug: 'suplementos', subcategories: [
        { name: 'Aves', slug: 'aves' },
        { name: 'Bovinos', slug: 'bovinos' },
        { name: 'Equinos', slug: 'equinos' },
        { name: 'Suínos', slug: 'suinos' },
        { name: 'Outros', slug: 'outros' },
    ]},
];

// Links especiais que não fazem parte da estrutura de categorias/subcategorias (Mantida)
const specialLinks = [
    { name: 'Kits Promocionais', slug: 'kits-promocionais', icon: <GiftOutlined /> },
    { name: 'Ofertas %', slug: 'produtos/ofertas', icon: <TagOutlined /> }, // Assumindo rota /produtos/ofertas
];

// Helper para formatar preço (local para o header) (Mantido)
const formatPrice = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string' || value === null || value === undefined) { return 'R$ --'; }
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'R$ --';
  return numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


const HeaderAgro = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [cartDrawerVisible, setCartDrawerVisible] = useState(false);
  // <<< OBTEM user, isAuthenticated, logout E TOKEN DO AUTHCONTEXT >>>
  const { user, isAuthenticated, logout, token } = useAuth();

  const { cartItemCount } = useCart();
  // <<< DECLARAÇÃO DA VARIÁVEL navigate >>>
  const navigate = useNavigate(); // Obtém a instância de navegação
  const location = useLocation(); // Obtém a localização atual

  // <<< ESTADOS PARA A BUSCA AUTOCOMPLETE >>>
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);


  // Função para verificar se um link de categoria ou subcategoria está ativo (Mantida)
  const isCategoryOrSubcategoryActive = (categorySlug) => {
      return location.pathname.startsWith(`/produtos/${categorySlug}`);
  };
   // Função para verificar se uma subcategoria está ativa (lendo query param) (Mantida)
  const isSubcategoryActive = (categorySlug, subcategorySlug) => {
      if (!location.pathname.startsWith(`/produtos/${categorySlug}`)) {
          return false;
      }
      const queryParams = new URLSearchParams(location.search);
      const subParam = queryParams.get('sub');
      if (!subParam) return false;
      return subParam.split(',').map(s => s.trim()).includes(subcategorySlug);
  };


  // --- FUNÇÃO ASSÍNCRONA DE BUSCA POR SUGESTÕES (DEBOUNCED) ---
  const fetchSuggestions = useCallback(debounce(async (searchTerm) => {
      if (searchTerm.length < 3) {
          setSuggestions([]);
          setIsSearching(false);
          return;
      }

      setIsSearching(true);

      const queryParams = new URLSearchParams();
      queryParams.append('q', searchTerm);
      queryParams.append('pageSize', 10); // Limitar sugestões

      const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
      console.log("Buscando sugestões da API:", url);

      try {
          const response = await fetch(url, {
              // Inclui o token se autenticado. O endpoint /products geralmente é público.
              // headers: isAuthenticated ? { 'Authorization': `Bearer ${token}` } : {}
          });

           if (!response.ok) {
               console.error("API error fetching suggestions:", response.status, response.statusText);
               setSuggestions([]);
               return;
           }
          const contentType = response.headers.get("content-type");
           if (!contentType || !contentType.includes("application/json")) {
              console.error("Resposta da API não é JSON válida para sugestões:", response.status, response.statusText);
              setSuggestions([]);
              return;
           }

          const data = await response.json(); // Assume { data: [...produtos], total: ... }

          if (Array.isArray(data.data)) {
              const mappedSuggestions = data.data.map(product => ({
                   // AutoComplete espera um 'value' único (string) para cada opção
                  value: product.product_id ? product.product_id.toString() : product.id ? product.id.toString() : `product-${Math.random()}`,
                   // 'label' é o conteúdo a ser renderizado na lista (Nó React)
                  label: (
                       // Link para Product Detail. Usa product_id do backend ou id do mock.
                      <Link to={`/produto/${product.product_id ? product.product_id : product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                           <img src={product.image_url || (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) || 'https://via.placeholder.com/40x40/f5f5f5/005C40?text=Img'} alt={product.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                           <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                               <Text strong ellipsis={{ tooltip: product.name }} style={{ display: 'block', fontSize: '0.9em', lineHeight: 1.2, marginBottom: 2 }}>{product.name || 'Produto sem nome'}</Text>
                               <Text type="secondary" style={{ fontSize: '0.8em' }}>{formatPrice(product.price)}</Text>
                           </div>
                      </Link>
                  ),
                   key: product.product_id ? product.product_id.toString() : product.id ? product.id.toString() : `key-${Math.random()}`,
              }));
              setSuggestions(mappedSuggestions);
          } else {
              console.error("Formato de dados inesperado na resposta da API para sugestões:", data);
              setSuggestions([]);
          }

      } catch (err) {
          console.error("Erro na comunicação ou inesperado ao buscar sugestões:", err);
          setSuggestions([]);
      } finally {
          setIsSearching(false);
      }
  }, 300), [API_BASE_URL]);


  // --- Handlers do AutoComplete ---
  const handleAutoCompleteSearch = useCallback((value) => {
      setSearchValue(value);
      console.log("AutoComplete onSearch (typing or enter):", value);

      if (value && value.length >= 3) {
          fetchSuggestions(value);
      } else {
          setSuggestions([]);
          setIsSearching(false);
      }
   }, [fetchSuggestions]);


  const handleAutoCompleteSelect = useCallback((value, option) => {
      console.log('Sugestão selecionada:', value, option);
      setSearchValue('');
      setSuggestions([]);
      setIsSearching(false);
   }, []);


  const handleAutoCompleteChange = useCallback((value) => {
      setSearchValue(value);
       if (!value) {
           setSuggestions([]);
           setIsSearching(false);
       }
   }, []);


   // Handler chamado quando o usuário pressiona Enter no input (para ir para a página de lista completa)
  const handleSearchOnEnter = useCallback(() => {
       if (searchValue.trim()) {
           console.log("Enter pressionado, navegando para busca completa:", searchValue.trim());
           setSuggestions([]);
           setIsSearching(false);
           navigate(`/produtos?q=${encodeURIComponent(searchValue.trim())}`);
       }
   }, [searchValue, navigate]);


  // Menu do Dropdown do Usuário (Desktop) - Usando a nova API com `items` (Mantido)
  const userMenuItems = isAuthenticated && user ? (
    {
        items: [
            { key: 'account', label: <Link to="/minha-conta-agro">Minha Conta</Link> },
            { key: 'orders', label: <Link to="/meus-pedidos-agro">Meus Pedidos</Link> },
             { type: 'divider' },
            { key: 'logout', label: 'Sair', danger: true, onClick: logout },
        ],
        className: 'user-dropdown-menu',
    }
  ) : { items: [] };

  // Funções Drawer Menu Mobile (Mantido)
  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  // Conteúdo do Drawer (Menu Sanduíche) (Mantido)
  const drawerMenu = (
    <Menu mode="inline" className="mobile-drawer-menu" onSelect={closeDrawer}>
        {/* Login/Conta no Drawer - Condicional baseado em autenticação */}
        <Menu.Item key="drawer-account" className="mobile-nav-link account main-account">
            {isAuthenticated && user ? (
                <Link to="/minha-conta-agro" onClick={closeDrawer}>
                    <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px', backgroundColor: 'rgba(0, 92, 64, 0.1)', color: '#005C40' }}/>
                    Olá, {user.name || 'Usuário'}!
                </Link>
            ) : (
                <Link to="/auth" onClick={closeDrawer}>
                    <LoginOutlined/> Login | Cadastre-se
                </Link>
            )}
        </Menu.Item>
        {isAuthenticated && user && (
             <>
                <Menu.Item key="drawer-my-orders" className="mobile-nav-link">
                    <Link to="/meus-pedidos-agro" onClick={closeDrawer}>
                        <ShoppingCartOutlined/> Meus Pedidos
                    </Link>
                </Menu.Item>
             </>
        )}

        <Menu.Divider className="mobile-drawer-divider"/>

        {/* Link Geral Todas as Categorias no Drawer */}
         <Menu.Item key="drawer-all-products" className="mobile-nav-link all-cats">
            <Link to="/produtos" onClick={closeDrawer}>
                 <AppstoreOutlined /> Todas as Categorias
             </Link>
        </Menu.Item>

        <Menu.Divider className="mobile-drawer-divider"/>

        {/* Categorias e Subcategorias no Drawer */}
        {categories.map(category => (
            <Menu.SubMenu
                key={`drawer-${category.slug}`}
                title={<span className="mobile-nav-link category-title">{category.name}</span>}
                 className={`mobile-nav-link mobile-submenu ${isCategoryOrSubcategoryActive(category.slug) || category.subcategories.some(sub => isSubcategoryActive(category.slug, sub.slug)) ? 'active-parent' : ''}`}
            >
                {/* Link para a página da Categoria Principal dentro do SubMenu */}
                 <Menu.Item key={`drawer-${category.slug}-all`} className="mobile-nav-link sub-link all">
                     <Link to={`/produtos/${category.slug}`} onClick={closeDrawer}>Ver Todos em {category.name}</Link>
                 </Menu.Item>
                 <Menu.Divider className="mobile-drawer-divider-submenu"/>

                {/* Links das Subcategorias no Drawer */}
                {category.subcategories && category.subcategories.map(sub => (
                    <Menu.Item key={`drawer-${category.slug}-${sub.slug}`} className={`mobile-nav-link sub-link ${isSubcategoryActive(category.slug, sub.slug) ? 'active-sub' : ''}`}>
                         <Link to={`/produtos/${category.slug}?sub=${sub.slug}`} onClick={closeDrawer}>
                            {sub.name}
                        </Link>
                    </Menu.Item>
                ))}
            </Menu.SubMenu>
        ))}

        <Menu.Divider className="mobile-drawer-divider"/>

        {/* Links Especiais no Drawer */}
        {specialLinks.map(link => (
            <Menu.Item key={`drawer-${link.slug}`} className="mobile-nav-link special">
                 <Link to={`/${link.slug}`} onClick={closeDrawer}>
                     {link.icon} {link.name}
                 </Link>
            </Menu.Item>
        ))}

        <Menu.Divider className="mobile-drawer-divider"/>

        {/* Links Institucionais no Drawer */}
         <Menu.Item key="drawer-sobre-nos" className="mobile-nav-link">
            <Link to="/sobre-nos" onClick={closeDrawer}>
                <InfoCircleOutlined /> Sobre Nós
             </Link>
        </Menu.Item>
         <Menu.Item key="drawer-seguranca" className="mobile-nav-link">
             <Link to="/seguranca" onClick={closeDrawer}>
                 <SafetyCertificateOutlined/> Segurança
             </Link>
        </Menu.Item>
         <Menu.Item key="drawer-faq" className="mobile-nav-link">
             <Link to="/faq" onClick={closeDrawer}>
                 <QuestionCircleOutlined/> FAQ
            </Link>
        </Menu.Item>


        {/* Botão Sair (se logado) - Condicional baseado em autenticação */}
        {isAuthenticated && (
             <>
             <Menu.Divider className="mobile-drawer-divider"/>
             <Menu.Item key="drawer-logout" danger className="mobile-nav-link logout">
                 <Button
                     type="text"
                     onClick={() => { logout(); closeDrawer(); }}
                     icon={<LogoutOutlined />}
                     >
                     Sair
                 </Button>
             </Menu.Item>
             </>
        )}
    </Menu>
  );


  // Funções Drawer Carrinho (Mantido)
  const showCartDrawer = () => setCartDrawerVisible(true);
  const closeCartDrawer = () => setCartDrawerVisible(false);

  return (
    <header className="agro-header modern">
        {/* Barra Superior Principal */}
        <div className="header-main-row modern">
          {/* Logo */}
          <div className="header-logo-container">
            {/* <<< USO DA VARIÁVEL logoUrl >>> */}
            <Link to="/ecommerce">
              <img src={logoUrl} alt="Logo Talismã" className="header-logo" />
            </Link>
          </div>

          {/* Barra de Busca com AutoComplete */}
          <div className="header-search-container modern">
             <AutoComplete
                 value={searchValue}
                 options={suggestions}
                 onSearch={handleAutoCompleteSearch}
                 onSelect={handleAutoCompleteSelect}
                 onChange={handleAutoCompleteChange}
                 allowClear
                 placeholder="O que você procura em nosso campo?"
                 size="large"
                 className="header-search-input modern"
                 onKeyDown={(e) => {
                     if (e.key === 'Enter' && searchValue.trim()) {
                         e.preventDefault();
                         handleSearchOnEnter();
                     }
                 }}
             >
               

             </AutoComplete>

          </div>

          {/* Ações Unificadas (Desktop e Mobile) (Mantido) */}
          <div className="header-actions-unified modern">
            {/* Login/Conta (Dropdown no Desktop, Ícone/Link no Mobile) */}
              {isAuthenticated && user ? (
                <Dropdown menu={userMenuItems} trigger={['click']} placement="bottomRight">
                  <Button type='text' className="user-account-link">
                    <Avatar size={28} icon={<UserOutlined />} className="user-avatar"/>
                    <span className="user-greeting">Olá, {user.name || 'Usuário'}</span>
                    <DownOutlined style={{ fontSize: '0.7em', marginLeft: '4px', color: '#888'}}/>
                  </Button>
                </Dropdown>
              ) : (
                <Link to="/auth" className="user-account-link login">
                  <UserOutlined />
                  <span>Login</span>
                </Link>
              )}

              {/* Carrinho (Unificado) */}
              <Tooltip title="Carrinho">
                 <Button type="text" onClick={showCartDrawer} className="cart-link modern">
                  <Badge count={cartItemCount} size="small" offset={[-3, 3]} className="cart-badge">
                    <ShoppingCartOutlined className="cart-icon" />
                  </Badge>
                 </Button>
              </Tooltip>

             {/* Botão Menu Sanduíche (Unificado) */}
             <Tooltip title="Menu">
                <Button type="text" icon={<MenuOutlined />} onClick={showDrawer} className="mobile-menu-button" />
             </Tooltip>
          </div>
        </div>

      {/* Barra de Navegação/Categorias (Apenas Desktop via CSS) (Mantida) */}
      <nav className="header-nav-row modern">
        <div className="header-container-wrapper nav-wrapper">
          {/* Dropdowns para Categorias com Subcategorias */}
          {categories.map(category => (
              <Dropdown
                  key={category.slug}
                  menu={{
                      items: [
                          {
                              key: `${category.slug}-all`,
                              label: <Link to={`/produtos/${category.slug}`}>Ver Todos em {category.name}</Link>,
                          },
                           {
                               type: 'divider',
                           },
                          ...(category.subcategories || []).map(sub => ({
                              key: `${category.slug}-${sub.slug}`,
                              label: <Link to={`/produtos/${category.slug}?sub=${sub.slug}`}> {sub.name} </Link>,
                          })),
                      ],
                      className: 'category-dropdown-menu',
                  }}
                  trigger={['hover']}
                  placement="bottomLeft"
                  getPopupContainer={trigger => trigger.parentNode}
              >
                   <span
                       className={`header-nav-link dropdown-trigger ${isCategoryOrSubcategoryActive(category.slug) ? 'active' : ''}`}
                   >
                       {category.name} <DownOutlined style={{ fontSize: '0.7em', marginLeft: '4px' }}/>
                   </span>
               </Dropdown>
           ))}

           {/* LINKS ESPECIAIS (Mantidos) */}
            {specialLinks.map(link => (
                <NavLink
                    key={link.slug}
                    to={`/${link.slug}`}
                    className={({ isActive }) => "header-nav-link special" + (isActive ? " active" : "")}
                >
                    {link.name}
                </NavLink>
            ))}

          </div>
       </nav>

        {/* Drawer Menu Sanduíche (Unificado) (Mantido) */}
         <Drawer
             title={<Link to="/ecommerce" onClick={closeDrawer}><img src={logoUrl} alt="Logo" style={{ height: '30px' }} /></Link>} // Usa a variável logoUrl
             placement="right"
             onClose={closeDrawer}
             open={drawerVisible}
             className="mobile-menu-drawer modern"
             closable={true}
             closeIcon={<CloseOutlined style={{ color: '#555', fontSize: '1.1em'}}/>}
             width={window.innerWidth > 576 ? 300 : 250}
             styles={{
                 header: { padding: '10px 16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#ffffff'},
                 body: { padding: '0', backgroundColor: '#ffffff' }
             }}
         >
             {drawerMenu}
         </Drawer>

       {/* Drawer do Carrinho (Mantido) */}
       <ShoppingCartDrawer open={cartDrawerVisible} onClose={closeCartDrawer} />

     </header>
   );
 };

 export default HeaderAgro;