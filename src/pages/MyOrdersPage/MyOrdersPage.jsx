// src/pages/MyOrdersPage/MyOrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import { Layout, Typography, Card, Row, Col, Spin, Button, Space, Table, Tag, message, Empty, Alert, Select } from 'antd'; // Adicionado Select para filtro de status
import { ShoppingCartOutlined, LoadingOutlined, ProfileOutlined, DollarCircleOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import HeaderAgro from '../../componentsAgro/HeaderAgro/HeaderAgro';
 import FooterLP from '../../componentsAgro/FooterAgro/FooterAgro';
import { useAuth } from '../../context/AuthContext';
import './MyOrdersPage.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select; // Adicionado Option


// <<< URL BASE DA SUA API BACKEND >>>
const API_BASE_URL =  'https://geral-talismaapi.r954jc.easypanel.host/api/v1'; // Ajuste a URL base da sua API


// Helper para formatar preço (reutilizado)
const formatPrice = (value) => {
  if (typeof value !== 'number' || isNaN(value)) { return 'R$ --'; }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Helper para obter Tag e Ícone do Status (Mantido)
const getStatusTag = (status) => {
  switch (status) {
    case 'pending_payment': return <Tag icon={<LoadingOutlined />} color="warning">Pagamento Pendente</Tag>; // Ajustado para warning
    case 'paid': return <Tag icon={<CheckCircleOutlined />} color="processing">Pago</Tag>; // Ajustado para processing
    case 'processing': return <Tag icon={<LoadingOutlined />} color="processing">Processando</Tag>;
    case 'shipped': return <Tag icon={<ShoppingCartOutlined />} color="default">Enviado</Tag>;
    case 'delivered': return <Tag icon={<CheckCircleOutlined />} color="success">Entregue</Tag>;
    case 'cancelled': return <Tag icon={<CloseCircleOutlined />} color="error">Cancelado</Tag>;
    case 'refunded': return <Tag color="default">Reembolsado</Tag>; // Adicionado
    default: return <Tag>{status || 'Desconhecido'}</Tag>; // Trata status nulo/indefinido
  }
};

// Status de Pedido disponíveis para filtro (deve corresponder ao ENUM no backend)
const orderStatuses = [
    { label: 'Todos', value: 'all' },
    { label: 'Pagamento Pendente', value: 'pending_payment' },
    { label: 'Pago', value: 'paid' },
    { label: 'Processando', value: 'processing' },
    { label: 'Enviado', value: 'shipped' },
    { label: 'Entregue', value: 'delivered' },
    { label: 'Cancelado', value: 'cancelled' },
    { label: 'Reembolsado', value: 'refunded' },
];


const MyOrdersPage = () => {
  const navigate = useNavigate();
  // Obtém user (do token), isAuthenticated, loading (inicial do context), e token do AuthContext
  const { user: authenticatedUser, isAuthenticated, loading: authLoading, token } = useAuth();

  // <<< ESTADOS PARA PEDIDOS, LOADING ESPECÍFICO, PAGINAÇÃO, ORDENAÇÃO E FILTROS >>>
  const [orders, setOrders] = useState([]); // Lista de pedidos da página atual
  const [ordersLoading, setOrdersLoading] = useState(true); // Loading específico da busca de pedidos
  const [errorOrders, setErrorOrders] = useState(null); // Estado para erro na busca de pedidos

  // Estados para Paginação (controlados pelo frontend e enviados para a API)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Estados para Ordenação (controlados pelo frontend e enviados para a API)
  const [sorter, setSorter] = useState({ field: 'created_at', order: 'descend' }); // Default: mais recentes

  // Estados para Filtros (controlados pelo frontend e enviados para a API)
  const [filterStatus, setFilterStatus] = useState('all'); // Default: Todos os status
  // TODO: Adicionar outros estados de filtro se necessário


  // --- Efeito para verificar autenticação E carregar pedidos da API ---
  // Dispara quando a autenticação/usuário muda para um estado válido OU
  // quando os estados de paginação, ordenação ou filtros mudam.
  useEffect(() => {
    // Se NÃO está autenticado e o loading inicial do AuthContext terminou, redireciona
    if (!isAuthenticated && !authLoading) {
      message.warning("Você precisa fazer login para ver seus pedidos.", 3);
      navigate('/auth'); // Redireciona para a página de login
      return; // Sai do useEffect
    }

    // Se ESTÁ autenticado E user existe (user != null), procede para buscar os pedidos.
    // A busca só deve ocorrer se estiver autenticado E se user for um objeto válido (após o loading inicial).
    // O estado `ordersLoading` será usado para controlar o spinner.
    if (isAuthenticated && authenticatedUser) {
        const fetchOrders = async () => {
            setOrdersLoading(true); // Inicia loading da busca de pedidos
            setErrorOrders(null);
            setOrders([]); // Limpa a lista enquanto carrega (opcional, mas bom para feedback visual)

            // Prepara os query parameters para a chamada API
            const queryParams = new URLSearchParams();
            queryParams.append('page', pagination.current);
            queryParams.append('pageSize', pagination.pageSize);
             // A API espera 'asc'/'desc', o sorter do AntD usa 'ascend'/'descend'
            if (sorter.field && sorter.order) {
                queryParams.append('sortBy', sorter.field);
                queryParams.append('order', sorter.order === 'ascend' ? 'asc' : 'desc');
            } else {
                // Defaults se nenhum sorter válido estiver ativo (ex: 'relevance')
                 queryParams.append('sortBy', 'created_at');
                 queryParams.append('order', 'desc');
            }
            // Adiciona filtro de status se não for 'all'
            if (filterStatus !== 'all') {
                 queryParams.append('status', filterStatus);
            }
            // TODO: Adicionar outros filtros aos query params


            try {
                // <<< CHAMADA API PARA OBTER PEDIDOS DO USUÁRIO LOGADO >>>
                // Endpoint: GET /api/v1/me/orders
                // A API precisa saber o ID do usuário, mas o middleware já pega de `req.user`.
                const url = `${API_BASE_URL}/me/orders?${queryParams.toString()}`;
                console.log("Chamando API:", url);

                const response = await fetch(url, {
                    headers: {
                        // Inclui o token JWT no cabeçalho Authorization
                        'Authorization': `Bearer ${token}` // token do AuthContext
                    }
                });

                 // Verifica se a resposta é JSON válida
                 const contentType = response.headers.get("content-type");
                  if (!contentType || !contentType.includes("application/json")) {
                     const errorText = await response.text();
                     console.error("Resposta da API não é JSON válida para pedidos:", response.status, errorText);
                     throw new TypeError("Resposta da API não é JSON válida para pedidos.");
                  }

                const data = await response.json(); // Assume que a API retorna { data: [...pedidos], total: total_filtrado }

                if (response.ok) {
                    // API real deve retornar { data: [...], total: ... }
                    // Verifica se data.data é um array e se data.total é um número
                    if (Array.isArray(data.data) && typeof data.total === 'number') {
                        setOrders(data.data); // Define a lista de pedidos da página atual
                        // Atualiza a paginação com o total retornado pela API
                        setPagination(prev => ({ ...prev, total: data.total }));
                        console.log(`Pedidos recebidos: ${data.data.length}, Total filtrado: ${data.total}`);
                    } else {
                        console.error("Formato de resposta da API para pedidos inesperado:", data);
                        throw new TypeError("Formato de resposta da API para pedidos inesperado.");
                    }

                } else {
                    // Erro da API (4xx, 5xx)
                    console.error("Erro da API ao buscar pedidos:", data.message || response.statusText);
                    setErrorOrders(data.message || `Erro ${response.status}: Falha ao carregar pedidos.`);
                     // Limpa a lista de pedidos em caso de erro
                    setOrders([]);
                    setPagination(prev => ({ ...prev, total: 0 })); // Reseta o total
                }

            } catch (err) {
                console.error("Erro na comunicação com a API de pedidos:", err);
                 if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                      setErrorOrders('Não foi possível conectar ao servidor backend.');
                 } else {
                     setErrorOrders('Erro inesperado ao buscar pedidos.');
                 }
                 setOrders([]);
                 setPagination(prev => ({ ...prev, total: 0 }));
            } finally {
                setOrdersLoading(false); // Finaliza loading da busca de pedidos
            }
        };

        // Dispara a busca apenas se a autenticação estiver completa e o user estiver disponível
        fetchOrders();
    }

    // Dependências: isAuthenticated, authenticatedUser (para ter certeza que o user está no context),
    // token (necessário para o header Auth), e os estados de paginação, ordenação e filtro que afetam a chamada API.
  }, [isAuthenticated, authenticatedUser, token, pagination.current, pagination.pageSize, sorter.field, sorter.order, filterStatus, navigate]); // Adicionado filterStatus e navigate


  // --- Lógica de Loading e Redirecionamento ---
  // Mostra um spinner enquanto o AuthContext está verificando OU
  // se o AuthContext já terminou (está autenticado) MAS ainda estamos buscando os pedidos pela API.
  if (authLoading || (isAuthenticated && !authenticatedUser) || (isAuthenticated && authenticatedUser && ordersLoading)) {
       console.log("Renderizando loading:", {authLoading, isAuthenticated, authenticatedUser, ordersLoading});
      return (
        <div className="ecommerce-loading-page">
           <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} size="large" tip={authLoading ? "Verificando acesso..." : "Carregando seus pedidos..."}>
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
           </Spin>
        </div>
      );
   }

  // Se loading do AuthContext terminou E NÃO está autenticado, redireciona (já tratado pelo useEffect)
   if (!isAuthenticated && !authLoading) {
       console.log("AuthContext terminou, não autenticado, redirecionando...");
       return null;
   }
   // Se loading do AuthContext terminou E está autenticado, MAS deu erro ao buscar pedidos
   if (isAuthenticated && authenticatedUser && errorOrders && !ordersLoading) {
        console.error("Erro ao carregar pedidos após autenticação:", errorOrders);
         return (
            <Layout className="ecommerce-layout my-orders-layout">
               <HeaderAgro/>
               <Content className="ecommerce-main-content my-orders-content" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
                 <Alert message="Erro ao carregar seus pedidos" description={errorOrders} type="error" showIcon />
               </Content>
               {/* Footer opcional */}
            </Layout>
          );
    }

   // Se chegou aqui: !authLoading, isAuthenticated, authenticatedUser, !errorOrders, !ordersLoading
   // Podemos renderizar a página com os dados (orders pode estar vazio)


  // --- Handlers da Tabela e Filtros ---

   // Handler para mudanças na paginação, ordenação e filtros da tabela
   const handleTableChange = (paginationAntD, filtersAntD, sorterAntD) => {
       console.log('Parâmetros da Tabela AntD:', paginationAntD, filtersAntD, sorterAntD);

       // Atualiza os estados de paginação e ordenação com os valores da tabela Ant Design
       // A mudança nesses estados disparará o useEffect para buscar os dados.
       setPagination({
           current: paginationAntD.current,
           pageSize: paginationAntD.pageSize,
           total: pagination.total // Mantém o total vindo da API
       });

       // O sorter do AntD é um objeto { field, order } ou um array se múltiplas colunas permitidas
       // Nosso estado sorter é { field, order }, com order 'ascend'/'descend'
       if (sorterAntD && sorterAntD.field) {
           setSorter({
               field: sorterAntD.field,
               order: sorterAntD.order // 'ascend' ou 'descend'
           });
       } else {
            // Se a ordenação for limpa ou voltar para default, resetamos
            setSorter({ field: 'created_at', order: 'descend' }); // Default da API/nossa lógica
       }

       // TODO: Se você adicionar filtros na tabela AntD (coluna.filters),
       // eles virão no objeto filtersAntD aqui e você precisará atualizar
       // os estados de filtro correspondentes e passá-los para a API.
        // Exemplo: if (filtersAntD.status && filtersAntD.status.length > 0) { setFilterStatus(filtersAntD.status[0]); }

   };

   // Handler para o Select de filtro de status
   const handleStatusFilterChange = (value) => {
       setFilterStatus(value); // Atualiza o estado do filtro de status
        // Opcional: Voltar para a primeira página ao mudar filtro
        // setPagination(prev => ({ ...prev, current: 1 }));
   };


  // Colunas da Tabela de Pedidos
  const columns = [
    {
      title: 'Número do Pedido',
      dataIndex: 'order_id', // Use order_id do backend
      key: 'order_id',
      render: text => <Text strong>{text}</Text>,
      width: 150,
       sorter: true, // Habilita sorting nesta coluna (Ant Design cuida da UI, nós tratamos no handleTableChange)
    },
    {
      title: 'Data',
      dataIndex: 'created_at', // Use created_at do backend
      key: 'created_at',
      render: dateString => {
          try {
               // Formata a data que vem da API (string ISO) para DD/MM/AAAA
               if (!dateString) return 'N/I';
               // A data pode vir como string ISO ou objeto Date se o Sequelize fizer o parse
               const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
               if (isNaN(date.getTime())) return 'Data Inválida';
              return date.toLocaleDateString('pt-BR');
          } catch (e) {
              console.error("Erro ao formatar data:", dateString, e);
              return dateString; // Retorna o valor original se falhar
          }
      },
       width: 120,
       sorter: true, // Habilita sorting
    },
    {
      title: 'Status',
      dataIndex: 'status', // Use status do backend
      key: 'status',
      render: status => getStatusTag(status), // Usa o helper
       width: 150, // Aumentado largura para caber tags maiores
       sorter: true, // Habilita sorting
       // TODO: Adicionar filtros na coluna da tabela se quiser
       // filters: orderStatuses.filter(s => s.value !== 'all'), // Exclui 'Todos' do filtro da tabela
       // onFilter: (value, record) => record.status === value, // Lógica de filtro (AntD filter UI, nós tratamos no estado/API)
    },
     {
       title: 'Total',
       dataIndex: 'total_amount', // Use total_amount do backend
       key: 'total_amount',
       render: total => formatPrice(parseFloat(total)), // Converte de string para número antes de formatar
       width: 120,
       sorter: true, // Habilita sorting
     },
    {
      title: 'Itens (Placeholder)', // Exibe alguns itens aqui na lista principal
      dataIndex: 'items', // Usa a propriedade 'items' incluída pela API
      key: 'itemsSummary',
      render: items => (
          <Space size={4} wrap>
             {/* Itera sobre os itens do pedido (objetos OrderItem incluídos) */}
             {Array.isArray(items) && items.map((item, index) => (
                 // Assumimos que item OrderItem tem product_name_at_time e quantity
                 <Text key={item.order_item_id || index} type="secondary" style={{fontSize: '0.9em'}} ellipsis={{tooltip: `${item.quantity}x ${item.product_name_at_time || item.product?.name || 'Item'}`}}> {/* Usa product_name_at_time ou product.name */}
                     {item.quantity || 1}x {item.product_name_at_time || item.product?.name || 'Item'} {/* Exibe quantidade e nome */}
                 </Text>
             ))}
              {!Array.isArray(items) || items.length === 0 && <Text type="secondary" italic>Nenhum item listado.</Text>} {/* Mensagem se não houver itens incluídos */}
          </Space>
       ),
        // Não definir largura para ocupar espaço restante
       // width: 200,
    },
    {
      title: 'Ações',
      key: 'actions',
       width: 120,
      render: (text, record) => (
        // <<< LINK PARA DETALHES DO PEDIDO >>>
        // Assume que a rota é /meus-pedidos-agro/:orderId
        // Usa record.order_id do backend
        <Button type="link" size="small" onClick={() => navigate(`/meus-pedidos-agro/${record.order_id}`)}>Ver Detalhes</Button>
      ),
       // Fixed: 'right' // Opcional: Fixa a coluna de ações
    },
  ];


  // Renderização Principal
  return (
    <Layout className="ecommerce-layout my-orders-layout">
      <HeaderAgro />

      <Content className="ecommerce-main-content my-orders-content">
        <Title level={2} className="my-orders-title">Meus Pedidos</Title>
        <Paragraph type="secondary" className="my-orders-subtitle">Acompanhe o status das suas compras recentes.</Paragraph>

        <Card
          title={<Space><ProfileOutlined /> Histórico de Pedidos</Space>}
          bordered={false}
          className="my-orders-card orders-table-card"
        >
            {/* Barra de filtros acima da tabela (Select de Status) */}
             <Row gutter={[16, 16]} justify="end" style={{marginBottom: '16px'}}>
                 <Col>
                     <Space>
                         <Text strong>Status:</Text>
                         <Select
                             value={filterStatus}
                             onChange={handleStatusFilterChange}
                             style={{ width: 150 }}
                             options={orderStatuses} // Usa as opções definidas
                         />
                     </Space>
                 </Col>
                  {/* TODO: Adicionar outros filtros (ex: Período) */}
             </Row>

            {/* O spinner de carregamento já está no IF global antes do return */}
            {/* Se não estiver carregando E deu erro */}
            {!ordersLoading && errorOrders ? (
                 <div style={{ padding: '20px' }}>
                    <Alert message="Erro ao carregar seus pedidos" description={errorOrders} type="error" showIcon />
                 </div>
             ) : (
                 // Se não estiver carregando E não deu erro
                 orders.length > 0 ? (
                     <Table
                       dataSource={orders}
                       columns={columns}
                       rowKey="order_id" // Usa o ID do pedido como chave única (order_id do backend)
                        // Passa os estados de paginação e ordenação para a tabela Ant Design
                       pagination={pagination}
                       sorter={sorter} // Passa o estado do sorter
                       onChange={handleTableChange} // Lida com eventos da tabela (paginação, ordenação, filtro)
                        // Adiciona scroll horizontal se a tabela for mais larga que o contêiner
                        // A largura total das colunas fixas é 150+120+150+120 = 540px + col de itens + 120 (ações) = 660px + itens
                        // Definir scroll X um pouco maior, ex: 800px
                       scroll={{ x: 800 }}
                       className="my-orders-table"
                       loading={ordersLoading} // Mostra loading integrado na tabela
                     />
                 ) : (
                      // Se a lista de pedidos está vazia E não está carregando
                      // (errorOrders já foi tratado acima)
                      !ordersLoading && (
                          <Empty
                             image={Empty.PRESENTED_IMAGE_SIMPLE}
                             description={<Text type="secondary">Você ainda não fez nenhum pedido.</Text>}
                             style={{marginTop: '40px', padding: '20px'}}
                          >
                             <Button type="primary" size="large" onClick={() => navigate('/produtos')}>Explore Nossos Produtos</Button>
                          </Empty>
                      )
                 )
             )}
        </Card>


      </Content>

      {/* Renderiza Footer (ajuste conforme seu componente) */}
       <FooterLP />

    </Layout>
  );
};

export default MyOrdersPage;