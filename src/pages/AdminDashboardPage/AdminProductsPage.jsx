// src/pages/AdminDashboardPage/AdminProductsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select, Typography,
  Card, Upload, message, Popconfirm, Spin, Alert, Tag,
  Row, Col, // <<< ADICIONADO: Importa Row e Col >>>
  Empty // <<< ADICIONADO: Importa o componente Empty (Corrigindo ReferenceError) >>>
} from 'antd'; // Importados componentes do Ant Design

import {
  EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined,
  LoadingOutlined, TagOutlined, StockOutlined, DollarOutlined,
  MinusCircleOutlined, PlusCircleOutlined // Para lista dinâmica (opcional)
} from '@ant-design/icons'; // Importados ícones

import { useAuth } from '../../context/AuthContext'; // Importado useAuth para obter user, isAuthenticated, logout, token
import debounce from 'lodash.debounce'; // Importado debounce


import './AdminProductsPage.css'; // Estilos específicos da página de Produtos

const { Title, Text } = Typography;
const { Option } = Select;
const { Item, List: FormList } = Form; // Desestruturado Item e List do Form
// const { TextArea } = Input; // Descomentar se precisar de descrição longa

// <<< URL BASE DA SUA API BACKEND >>>
const API_BASE_URL = 'http://localhost:3001/api/v1'; // Ajuste a URL base da sua API


// Helper para formatar preço
const formatPrice = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string' || value === null || value === undefined) { return 'R$ --'; }
   const numValue = parseFloat(value);
   if (isNaN(numValue)) return 'R$ --';
  return numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


// --- Estrutura de Categorias e Subcategorias (AINDA MOCKADA no frontend) ---
// Idealmente, isto viria de um endpoint da API, ex: /api/v1/categories
const categoryStructure = {
    "Medicamentos": { id: 1, slug: 'medicamentos', subs: [{ name: "Antibióticos", id: 101, slug: 'antibioticos' }, { name: "Anti-inflamatórios", id: 102, slug: 'anti-inflamatorios' }, { name: "Vermífugos", id: 103, slug: 'vermiFugos' }, { name: "Demais Medicamentos", id: 104, slug: 'demais-medicamentos' }, { name: "Mosquicidas e Carrapaticidas", id: 105, slug: 'mosquicidas-e-carrapaticidas' }, { name: "Mata Bicheira", id: 106, slug: 'mata-bicheira' }, { name: "Terapêuticos", id: 107, slug: 'terapeuticos' }, { name: "IATF", id: 108, slug: 'iatf' }, { name: "Outros", id: 109, slug: 'outros' }] },
    "Fertilizantes": { id: 2, slug: 'fertilizantes', subs: [{ name: "NPK", id: 201, slug: 'npk' }, { name: "Orgânicos", id: 202, slug: 'organicos' }, { name: "Foliares", id: 203, slug: 'foliares' }, { name: "Outros", id: 204, slug: 'outros' }] },
    "Defensivos": { id: 3, slug: 'defensivos', subs: [{ name: "Herbicidas", id: 301, slug: 'herbicidas' }, { name: "Inseticidas", id: 302, slug: 'inseticidas' }, { name: "Fungicidas", id: 303, slug: 'fungicidas' }, { name: "Outros", id: 304, slug: 'outros' }] },
    "Sementes": { id: 4, slug: 'sementes', subs: [{ name: "Milho", id: 401, slug: 'milho' }, { name: "Soja", id: 402, slug: 'soja' }, { name: "Hortaliças", id: 403, slug: 'hortalicas' }, { name: "Outros", id: 404, slug: 'outros' }] },
    "Equipamentos": { id: 5, slug: 'equipamentos', subs: [{ name: "Pulverizadores", id: 501, slug: 'pulverizadores' }, { name: "Ferramentas", id: 502, slug: 'ferramentas' }, { name: "Botas", id: 503, slug: 'botas' }, { name: "Outros", id: 504, slug: 'outros' }] },
    "Saúde Animal": { id: 6, slug: 'saude-animal', subs: [{ name: "Vermífugos", id: 601, slug: 'vermiFugos' }, { name: "Vacinas", id: 602, slug: 'vacinas' }, { name: "Acessórios", id: 603, slug: 'acessorios' }, { name: "Outros", id: 604, slug: 'outros' }] },
    "Fazenda": { id: 7, slug: 'fazenda', subs: [{ name: "Arames", id: 701, slug: 'arames' }, { name: "Cercas", id: 702, slug: 'cercas' }, { name: "Comedouros", id: 703, slug: 'comedouros' }, { name: "Alimentadores", id: 704, slug: 'alimentadores' }, { name: "Outros", id: 705, slug: 'outros' }] },
    "Pets": { id: 8, slug: 'pet', subs: [{ name: "Brinquedos", id: 801, slug: 'brinquedos' }, { name: "Coleiras", id: 802, slug: 'coleiras' }, { name: "Higiene", id: 803, slug: 'higiene' }, { name: "Outros", id: 804, slug: 'outros' }] },
     "Vestuário": { id: 9, slug: 'vestuario', subs: [{ name: 'Acessórios', id: 901, slug: 'acessorios' }, { name: 'Bonés', id: 902, slug: 'bones' }, { name: 'Botas', id: 903, slug: 'botas' }, { name: 'Botinas', id: 904, slug: 'botinas' }, { name: 'Carteira', id: 905, slug: 'carteira' }, { name: 'Chapéu', id: 906, slug: 'chapeu' }, { name: 'Cinto', id: 907, slug: 'cinto' }, { name: 'Outros', id: 908, slug: 'outros' }] },
      "Higienização e limpeza": { id: 10, slug: 'higienizacao-e-limpeza', subs: [{ name: 'Desinfetantes', id: 1001, slug: 'desinfetantes' }, { name: 'Detergentes', id: 1002, slug: 'detergentes' }, { name: 'Outros Químicos', id: 1003, slug: 'outros-quimicos' }] },
       "Ferragista": { id: 11, slug: 'ferragista', subs: [{ name: 'Acessórios para Ferramentas', id: 1101, slug: 'acessorios-para-ferramentas' }, { name: 'Bombas de Água', id: 1102, slug: 'bombas-de-agua' }, { name: 'Cabos Elétricos', id: 1103, slug: 'cabos-eletricos' }, { name: 'Carrinho de Mão', id: 1104, slug: 'carrinho-de-mao' }, { name: 'Canos e Tubos', id: 1105, slug: 'canos-e-tubos' }, { name: 'Conexões de Água', id: 1106, slug: 'conexoes-de-agua' }, { name: 'Conexões de Esgoto', id: 1107, slug: 'conexoes-de-esgoto' }, { name: 'Ferramentas a Bateria', id: 1108, slug: 'ferramentas-a-bateria' }, { name: 'Ferramentas Elétricas', id: 1109, slug: 'ferramentas-eletricas' }, { name: 'Ferramentas Manuais', id: 1110, slug: 'ferramentas-manuais' }, { name: 'Ralos e Sifões', id: 1111, slug: 'ralos-e-sifoes' }, { name: 'Registros', id: 1112, slug: 'registros' }, { name: 'Outros', id: 1113, slug: 'outros' }] },
        "Suplementos": { id: 12, slug: 'suplementos', subs: [{ name: 'Aves', id: 1201, slug: 'aves' }, { name: 'Bovinos', id: 1202, slug: 'bovinos' }, { name: 'Equinos', id: 1203, slug: 'equinos' }, { name: 'Suínos', id: 1204, slug: 'suinos' }, { name: 'Outros', id: 1205, slug: 'outros' }] },
};

// Mapeamentos de ID para Nome para categorias e subcategorias (para renderizar na tabela)
const categoryIdToName = Object.keys(categoryStructure).reduce((acc, name) => { acc[categoryStructure[name].id] = name; return acc; }, {});
const subcategoryIdToName = Object.values(categoryStructure).reduce((acc, cat) => { cat.subs.forEach(sub => { acc[sub.id] = sub.name; }); return acc; }, {});


// REMOVIDOS DADOS MOCKADOS DE PRODUTOS LOCAIS E FUNÇÃO SIMULATEFETCHADMINPRODUCTS LOCAIS


const AdminProductsPage = () => {
  // <<< OBTEM user, isAuthenticated, logout E TOKEN DO AUTHCONTEXT >>>
  const { user, isAuthenticated, logout, token } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Loading para a TABELA
  const [error, setError] = useState(null); // Erro para a TABELA

  // Estados para Paginação, Ordenação e Filtros (controlados no frontend e enviados para a API)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorter, setSorter] = useState({ field: 'created_at', order: 'descend' }); // Default sorting para admin: mais recentes
  // Estados para filtros específicos da página Admin (ex: status inativo, texto de busca)
  const [filterStatus, setFilterStatus] = useState('all'); // 'active', 'inactive', 'all'
  const [searchText, setSearchText] = useState('');

  // Estados para Modal de Adicionar/Editar Produto
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null para adicionar, objeto para editar
  const [isEditingModal, setIsEditingModal] = useState(false); // Loading específico do Modal
  const [form] = Form.useForm(); // Instância do Form Ant Design
  const [selectedCategoryInModal, setSelectedCategoryInModal] = useState(null); // Estado para o select de categoria no form


  // --- FUNÇÃO PRINCIPAL DE BUSCA DE PRODUTOS DA API (PARA TABELA) ---
  const fetchProducts = useCallback(async () => {
    setLoading(true); // Inicia loading da tabela
    setError(null);
    // Não limpa products aqui para evitar flash de tela entre páginas/filtros
    // setProducts([]); setPagination(prev => ({ ...prev, total: 0 }));

    // Prepara os query parameters para a chamada API
    const queryParams = new URLSearchParams();
    queryParams.append('page', pagination.current);
    queryParams.append('pageSize', pagination.pageSize);

    // Adiciona ordenação (convertendo o formato do AntD para o da API)
    if (sorter.field && sorter.order) {
      queryParams.append('sortBy', sorter.field);
      queryParams.append('order', sorter.order === 'ascend' ? 'asc' : 'desc');
    } else {
       // Se nenhum sorter válido estiver ativo, pode usar um default da API (ex: created_at desc)
       // ou não enviar.
    }

    // Adiciona filtros específicos do Admin
    if (filterStatus !== 'all') {
         // A API real espera ?is_active=true ou ?is_active=false
        queryParams.append('is_active', filterStatus === 'active' ? 'true' : 'false');
    }
    if (searchText) {
        queryParams.append('q', searchText); // Adiciona busca por texto
    }
    // TODO: Adicionar outros filtros (ex: por ID de categoria/subcategoria, se a tabela tiver filtros de coluna)

    const url = `${API_BASE_URL}/products?${queryParams.toString()}`; // Use o endpoint de listar com filtros/paginação
    console.log("Buscando produtos para Admin Tabela:", url);

    try {
      const response = await fetch(url, {
        headers: {
          // Inclui o token JWT, pois este endpoint pode ser protegido ou retornar mais dados (inativos) apenas para admin
          'Authorization': `Bearer ${token}` // <<<< USO DO TOKEN >>>>
        }
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
          const errorData = contentType && contentType.includes("application/json") ? await response.json() : { message: response.statusText };
          console.error("Erro API ao buscar produtos (Admin Tabela):", response.status, errorData.message);
           if (response.status === 401 || response.status === 403) {
                message.error("Sessão expirada ou inválida. Faça login novamente.");
                logout(); // <<<< USO DO LOGOUT >>>>
                return;
           }
           // Outros erros da API
           setError(errorData.message || `Erro ${response.status}: Falha ao carregar produtos.`);
           setProducts([]);
           setPagination(prev => ({ ...prev, total: 0 }));
           return;
      }
       if (!contentType || !contentType.includes("application/json")) {
         const errorText = await response.text();
         console.error("Resposta da API não é JSON válida para produtos (Admin Tabela):", response.status, errorText);
         setError('Resposta da API não é JSON válida.');
         setProducts([]);
         setPagination(prev => ({ ...prev, total: 0 }));
         return;
      }

      const data = await response.json(); // Assume { data: [...produtos], total: total_filtrado }

      if (Array.isArray(data.data) && typeof data.total === 'number') {
        setProducts(data.data);
        setPagination(prev => ({ ...prev, total: data.total }));
        console.log(`Produtos (Admin Tabela) recebidos: ${data.data.length}, Total filtrado: ${data.total}`);
      } else {
        console.error("Formato de resposta da API para produtos (Admin Tabela) inesperado:", data);
        setError("Formato de resposta inesperado da API.");
        setProducts([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }

    } catch (err) {
      console.error("Erro na comunicação com a API de produtos (Admin Tabela):", err);
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
           setError('Não foi possível conectar ao servidor backend.');
       } else {
           setError(err?.message || 'Erro inesperado ao buscar produtos.');
       }
      setProducts([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, sorter.field, sorter.order, filterStatus, searchText, token, API_BASE_URL, logout]); // Dependências: estados que afetam a busca E token/logout/API_BASE_URL


   // Efeito para carregar produtos na montagem inicial e quando parâmetros de busca mudam
   useEffect(() => {
       fetchProducts();
   }, [fetchProducts]); // Dependência: fetchProducts (função useCallback)


  // --- Handlers da Tabela e Filtros ---

   // Handler para mudanças na paginação, ordenação e filtros da tabela Ant Design (Mantido)
   const handleTableChange = (paginationAntD, filtersAntD, sorterAntD) => {
       console.log('Parâmetros da Tabela AntD:', paginationAntD, filtersAntD, sorterAntD);

       // 1. Paginação: Atualiza current e pageSize. O total vem da API.
       if (pagination.current !== paginationAntD.current || pagination.pageSize !== paginationAntD.pageSize) {
            setPagination(prev => ({
               ...prev,
               current: paginationAntD.current,
               pageSize: paginationAntD.pageSize
            }));
       }

       // 2. Ordenação: Atualiza field e order.
       let newSorter = { ...sorter };
       if (sorterAntD && sorterAntD.field) {
           if (sorter.field !== sorterAntD.field || sorter.order !== sorterAntD.order) {
               newSorter = { field: sorterAntD.field, order: sorterAntD.order };
           }
       } else {
           if (sorter.field !== 'created_at' || sorter.order !== 'descend') {
                newSorter = { field: 'created_at', order: 'descend' };
           } else {
              newSorter = { field: null, order: null };
           }
       }
       if (newSorter && (sorter.field !== newSorter.field || sorter.order !== newSorter.order)) {
            setSorter(newSorter);
       } else if (!newSorter && sorter !== null) {
            setSorter(null);
       }

       // 3. Filtros (se implementados na coluna AntD) - TODO
   };

   // Handler para o Select de filtro de status (separado da tabela por UI) (Mantido)
   const handleStatusFilterChange = useCallback((value) => {
       setFilterStatus(value);
       setPagination(prev => ({ ...prev, current: 1 })); // Resetar paginação
   }, []);

    // Handler para o Input de busca de texto (separado da tabela por UI) (Mantido)
   const handleSearch = useCallback(debounce((value) => {
       setSearchText(value);
       setPagination(prev => ({ ...prev, current: 1 })); // Resetar paginação
   }, 500), []);

   const handleSearchInputChange = (e) => {
       const value = e.target.value;
       setSearchText(value);
       handleSearch(value);
   };


  // --- Handlers do Modal e Formulário (Adicionar/Editar/Deletar) ---

   // DEFINIDA A FUNÇÃO handleModalCancel (Mantido)
   const handleModalCancel = () => {
     console.log("Modal cancelado.");
     setIsModalVisible(false);
     setEditingProduct(null);
     form.resetFields();
     setSelectedCategoryInModal(null);
     setIsEditingModal(false);
   };


   // Abre o modal para adicionar novo produto (Mantido)
  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setSelectedCategoryInModal(null);
    form.setFieldsValue({ is_active: true, stock: 0, price: 0, original_price: null, images: [], specs: [{}] });
    setIsModalVisible(true);
  };

   // Abre o modal para editar produto existente (Mantido)
  const handleEdit = (record) => {
    setEditingProduct(record);
    // Preenche o formulário com os dados do produto para edição
    form.setFieldsValue({
        ...record,
        price: parseFloat(record.price) || 0,
        original_price: record.original_price ? parseFloat(record.original_price) : null,
        stock: parseInt(record.stock, 10) || 0,
        specs: record.specs ? Object.entries(record.specs).map(([key, value]) => ({ key: key, value: value })) : [{}],
        images: Array.isArray(record.images) ? record.images.map((url, index) => ({
             uid: url || index.toString(),
             name: url ? url.substring(url.lastIndexOf('/') + 1) : 'imagem.jpg',
             status: 'done',
             url: url,
         })).filter(item => item.url)
         : (record.image_url ? [{ uid: record.image_url, name: record.image_url.substring(record.image_url.lastIndexOf('/') + 1), status: 'done', url: record.image_url }] : []),
    });
    setSelectedCategoryInModal(record.category_id || null);
    setIsModalVisible(true);
  };

   // Handler para o Select de Categoria no formulário do modal (Mantido)
  const handleCategorySelectChangeInModal = (value) => {
      setSelectedCategoryInModal(value);
       form.setFieldsValue({ subcategory_id: undefined });
  };

   // <<< FUNÇÃO REAL DE UPLOAD DE IMAGEM PARA A API (Mantido) >>>
   // NOTE: Ant Design Upload component expects a `customRequest` function
   // with specific parameters ({ file, onSuccess, onError, onProgress }).
   // Your existing `handleImageUpload` is written correctly for this purpose.
   // We just need to pass it to the Upload component's `customRequest` prop.
   const dummyRequest = ({ file, onSuccess }) => {
        // In a real scenario, you would handle the upload here.
        // For demonstration, we just call onSuccess quickly.
        // You can replace this with your actual API call function.
        // Example:
        // setTimeout(() => {
        //   onSuccess("ok");
        // }, 0);
         handleImageUpload({ file, onSuccess, onError: (err) => console.error("Upload failed:", err), onProgress: (event) => console.log("Upload progress:", event) });
    };

   const handleImageUpload = async ({ file, onSuccess, onError, onProgress }) => {
       console.log("Chamando API para upload de arquivo:", file.name);

       const formData = new FormData();
       formData.append('productImageFile', file);

       const url = `${API_BASE_URL}/products/upload-image`;

       try {
           const response = await fetch(url, {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${token}`
               },
               body: formData,
           });

            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                const errorData = contentType && contentType.includes("application/json") ? await response.json() : { message: response.statusText };
                 console.error("Erro API Upload:", response.status, errorData.message);
                 if (response.status === 400 && errorData.message && errorData.message.includes('Tipo de arquivo inválido')) {
                     message.error(errorData.message, 3);
                 } else if (response.status === 400 && errorData.message && errorData.message.includes('File too large')) {
                      message.error('Arquivo muito grande. Tamanho máximo permitido é 5MB.', 3);
                 } else if (response.status === 401 || response.status === 403) {
                     message.error("Sessão expirada ou inválida para upload. Faça login novamente.", 3);
                     logout(); // <<< USO DO LOGOUT >>>>
                     return onError(new Error("Unauthorized"));
                 }
                 else {
                    message.error(errorData.message || `Erro ${response.status}: Falha no upload do arquivo.`, 3);
                 }
                 return onError(new Error(errorData.message || 'Upload failed'));
            }

            if (!contentType || !contentType.includes("application/json")) {
               const errorText = await response.text();
               console.error("Resposta da API de upload não é JSON válida:", response.status, errorText);
               message.error('Resposta inválida do servidor de upload.');
               return onError(new Error("Invalid response format"));
            }

           const data = await response.json();

           if (data && data.url) {
               // The onSuccess function from AntD expects a response object.
               // We pass the URL back in the response.
               onSuccess({ url: data.url }, file);
               console.log("Upload bem-sucedido, URL retornada:", data.url);
           } else {
               console.error("API Upload: Resposta de sucesso, mas sem URL esperada:", data);
               message.error('Upload bem-sucedido, mas URL não retornada pelo servidor.');
               onError(new Error("URL not returned"));
           }

       } catch (err) {
           console.error("Erro na comunicação com o endpoint de upload:", err);
           if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                message.error('Não foi possível conectar ao servidor backend para upload.');
           } else {
               message.error(err?.message || 'Erro inesperado durante o upload.');
           }
           onError(err);
       }
   };


  // Handler de submit do modal (Adicionar ou Editar) (Mantido)
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsEditingModal(true);

      console.log('Valores do formulário para submit:', values);

      const specsObject = (values.specs || []).reduce((obj, item) => {
           if(item && item.key && item.value !== undefined && item.value !== null) {
                obj[item.key] = item.value;
           }
           return obj;
      }, {});

       const imageUrls = Array.isArray(values.images) ? values.images
           .map(fileInfo => {
               // If the file was successfully uploaded via customRequest,
               // its response will contain the URL.
               // If it was a pre-filled image (for editing), its url property exists.
               return fileInfo?.response?.url || fileInfo?.url;
           })
           .filter(url => url && typeof url === 'string' && url !== 'undefined')
           : [];


      const productData = {
          name: values.name,
          // Only include slug if creating or if it's explicitly changeable (usually not)
          // For PUT, the slug might not be in the payload, or it might be ignored by backend
          ...(editingProduct ? {} : { slug: values.slug }),
          description: values.description,
          price: values.price,
          original_price: values.original_price,
          stock: values.stock,
          sku: values.sku,
          // Decide how to handle image_url vs images array based on API
          // Assuming API uses `images` as an array and maybe `image_url` for the main one
          image_url: imageUrls.length > 0 ? imageUrls[0] : null,
          images: imageUrls.length > 0 ? imageUrls : null,
          category_id: selectedCategoryInModal, // Use the state, as form value might be outdated or different
          subcategory_id: values.subcategory_id || null,
          specs: specsObject,
          is_active: values.is_active,
      };

       console.log('Dados enviados para API:', productData);


      let url = `${API_BASE_URL}/products`;
      let method = 'POST';
      let successMessage = 'Produto adicionado com sucesso!';

      if (editingProduct) {
        url = `${API_BASE_URL}/products/${editingProduct.product_id}`;
        method = 'PUT';
        successMessage = 'Produto atualizado com sucesso!';
      }

      // <<< CHAMADA API PARA CRIAR OU EDITAR PRODUTO >>>
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envia o token JWT
        },
        body: JSON.stringify(productData),
      });

       const contentType = response.headers.get("content-type");
       if (!response.ok) {
           const errorData = contentType && contentType.includes("application/json") ? await response.json() : { message: response.statusText };
           console.error(`Erro API ${method} /products${editingProduct ? '/' + editingProduct.product_id : ''}:`, response.status, errorData.message);
           if (response.status === 401 || response.status === 403) {
                message.error("Sessão expirada ou inválida. Faça login novamente.");
                logout();
                return;
           }
           throw new Error(errorData.message || `Erro ${response.status}: Falha na operação.`);
       }
       if (!contentType || !contentType.includes("application/json")) {
           const errorText = await response.text();
           console.error("Resposta da API não é JSON válida:", response.status, errorText);
           throw new TypeError("Resposta da API não é JSON válida.");
       }

      const data = await response.json();

      message.success(successMessage, 2);

      setIsModalVisible(false);
      setEditingProduct(null);
      form.resetFields();
      setSelectedCategoryInModal(null);
      fetchProducts(); // Recarrega a lista

    } catch (info) {
      console.error('Validação ou Submissão do Modal falhou:', info);
       if (info && info.errorFields) {
           message.error('Por favor, corrija os erros no formulário.');
       } else if (info instanceof TypeError && info.message.includes('Failed to fetch')) {
           message.error('Não foi possível conectar ao servidor backend para salvar.');
       } else {
           message.error(info.message || 'Erro inesperado ao salvar dados.');
       }

    } finally {
      setIsEditingModal(false);
    }
  };

   // Handler para exclusão de produto (Mantido)
   const handleDelete = async (productId) => {
        if (!token) {
            message.error("Você não está autenticado.");
            logout();
            return;
        }
        setLoading(true); // Pode adicionar um loading mais granular se preferir
        try {
            const url = `${API_BASE_URL}/products/${productId}`;
            console.log(`Tentando deletar produto: ${url}`);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                const errorData = contentType && contentType.includes("application/json") ? await response.json() : { message: response.statusText };
                console.error("Erro API DELETE /products:", response.status, errorData.message);
                 if (response.status === 401 || response.status === 403) {
                     message.error("Sessão expirada ou inválida para deletar. Faça login novamente.");
                     logout();
                     return;
                 }
                throw new Error(errorData.message || `Erro ${response.status}: Falha ao deletar o produto.`);
            }

            // Assuming the API returns success 200/204 (No Content)
            message.success("Produto deletado com sucesso!", 2);
            fetchProducts(); // Recarrega a lista após a exclusão

        } catch (err) {
            console.error("Erro ao deletar produto:", err);
             if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                message.error('Não foi possível conectar ao servidor backend para deletar.');
            } else {
                message.error(err?.message || 'Erro inesperado ao deletar produto.');
            }
        } finally {
            setLoading(false);
        }
   };


  // --- Colunas da Tabela (Mantidas, ajustando dataIndex e render) ---
  const columns = [
    {
      title: 'ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 80,
      render: text => <Text copyable>{text}</Text>,
    },
    {
      title: 'Imagem',
      dataIndex: 'image_url', // Could also use 'images' if API provides array
      key: 'image_url',
      width: 80,
       render: (imageUrl, record) => {
            // Use the first image from the images array if available, otherwise fallback to image_url, then placeholder
           const src = (Array.isArray(record.images) && record.images.length > 0 && record.images[0]) || imageUrl || 'https://via.placeholder.com/50/f5f5f5/005C40?text=Img';
           return <img src={src} alt={record.name || 'Produto'} style={{ width: 50, height: 50, objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee' }} />;
        },
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
       sorter: true,
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Categoria',
      dataIndex: 'category_id',
      key: 'category_id',
       render: categoryId => categoryIdToName[categoryId] || 'N/I',
       sorter: false, // Disable frontend sorting if backend handles it
      width: 120,
    },
     {
       title: 'Subcategoria',
       dataIndex: 'subcategory_id',
       key: 'subcategory_id',
        render: subcategoryId => subcategoryIdToName[subcategoryId] || 'N/I',
        sorter: false, // Disable frontend sorting if backend handles it
       width: 120,
     },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
       sorter: true,
      width: 120,
      render: price => formatPrice(price),
    },
     {
       title: 'Preço Original',
       dataIndex: 'original_price',
       key: 'original_price',
        render: original_price => original_price ? formatPrice(original_price) : '-',
        width: 120,
        sorter: true,
     },
    {
      title: 'Estoque',
      dataIndex: 'stock',
      key: 'stock',
       sorter: true,
       width: 100,
      render: stock => (
          <Text type={stock > 10 ? 'success' : (stock !== undefined && stock !== null && stock > 0 ? 'warning' : 'danger')} strong>
               {stock !== undefined && stock !== null ? stock : 'N/I'}
          </Text>
       ),
    },
     {
       title: 'Status',
       dataIndex: 'is_active',
       key: 'is_active',
        render: is_active => is_active ? <Tag color="success">Ativo</Tag> : <Tag color="default">Inativo</Tag>,
        sorter: true,
        width: 100,
     },
      {
        title: 'Criado Em',
        dataIndex: 'created_at',
        key: 'created_at',
         render: dateString => {
             try {
                  if (!dateString) return 'N/I';
                 const date = new Date(dateString);
                 if (isNaN(date.getTime())) return 'Data Inválida';
                 return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
             } catch (e) { return dateString; }
         },
         sorter: true,
         width: 150,
      },
    {
      title: 'Ações',
      key: 'actions',
       width: 120,
      render: (text, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} aria-label="Editar" disabled={isEditingModal || loading}/>
          <Popconfirm
            title={`Tem certeza que quer deletar "${record.name || 'este produto'}"?`}
            onConfirm={() => handleDelete(record.product_id || record.id)} // Use product_id from API response
            okText="Sim"
            cancelText="Não"
            placement="topRight"
            disabled={isEditingModal || loading}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small" aria-label="Remover" disabled={isEditingModal || loading}/>
          </Popconfirm>
        </Space>
      ),
    },
  ];


    // Filter subs based on selected category in modal form (UI logic for form select) (Mantido)
    const availableSubcategoriesForModal = selectedCategoryInModal ?
        (Object.values(categoryStructure).find(cat => cat.id === selectedCategoryInModal)?.subs || [])
        : [];


  // --- Renderização ---
  return (
    <div className="admin-products-page">
      <Title level={3} className="admin-section-title"><TagOutlined/> Gerenciar Produtos</Title>

      {/* Barra de Busca, Filtros e Botão Adicionar */}
      <Row gutter={[16, 16]} justify="space-between" style={{ marginBottom: '20px' }}>
          {/* Busca por Texto */}
           <Col xs={24} sm={12} md={8}>
               <Input.Search
                   placeholder="Buscar por nome, descrição..."
                   value={searchText}
                   onChange={handleSearchInputChange}
                   onSearch={value => handleSearch(value)}
                   enterButton
               />
           </Col>
           {/* Filtro de Status */}
            <Col xs={24} sm={12} md={4}>
                <Space>
                    <Text strong>Status:</Text>
                     <Select value={filterStatus} onChange={handleStatusFilterChange} style={{ width: 120 }}>
                         <Option value="all">Todos</Option>
                         <Option value="active">Ativos</Option>
                         <Option value="inactive">Inativos</Option>
                     </Select>
                </Space>
            </Col>
           {/* Botão Adicionar Produto */}
           <Col xs={24} md={6} style={{ textAlign: 'right' }}>
               <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={isEditingModal || loading}>Adicionar Novo Produto</Button>
           </Col>
      </Row>


      {/* Tabela de Produtos */}
      {/* Exibe Alert de erro se houver erro (e não estiver carregando) */}
      {error && !loading ? (
          <div style={{ padding: '20px' }}>
              <Alert message="Erro ao carregar produtos" description={error} type="error" showIcon />
          </div>
      ) : (
           // Renderiza a tabela SE HOUVER produtos OU SE ESTIVER CARREGANDO (para mostrar o loading integrado da tabela)
           products.length > 0 || loading ? (
               <Table
                 dataSource={products}
                 columns={columns}
                 rowKey="product_id"
                 pagination={{
                     ...pagination,
                     showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} itens`,
                     showSizeChanger: true,
                     pageSizeOptions: ['10', '20', '30', '50'],
                     position: ['bottomCenter']
                 }}
                 sorter={sorter} // Keep sorter prop to enable sorting UI, but backend does the actual sorting
                 onChange={handleTableChange} // Pass handleTableChange to manage pagination/sorting changes
                 scroll={{ x: 1200 }}
                 className="admin-products-table"
                 loading={loading}
               />
           ) : (
                // Se a lista de produtos está vazia E não está carregando E não deu erro
               !loading && !error && (
                   <Card bordered={false} style={{textAlign: 'center', padding: '40px 20px', boxShadow: 'none', border: '1px dashed #d9d9d9'}}>
                       {/* CORRECTED: Empty component is now imported */}
                       <Empty description={<Text type="secondary">Nenhum produto encontrado.</Text>}>
                           <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={isEditingModal || loading}> Adicionar Primeiro Produto </Button>
                       </Empty>
                   </Card>
               )
           )
       )}


      {/* Modal de Adicionar/Editar Produto */}
      <Modal
        title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        okText={editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
        cancelText="Cancelar"
        confirmLoading={isEditingModal}
        destroyOnClose={true} // Important to reset form state when closed
        className="admin-product-modal"
         width={800} // Adjust modal width if needed for more fields
      >
        <Spin spinning={isEditingModal} tip={editingProduct ? "Salvando..." : "Adicionando..."}>
           <Form
             form={form}
             layout="vertical"
             name="product_form"
           >
             <Item
               name="name"
               label="Nome do Produto"
               rules={[{ required: true, message: 'Por favor, insira o nome do produto!' }]}
             >
               <Input placeholder="Ex: Adubo Orgânico" />
             </Item>

              {/* Slug input only for adding, disabled for editing */}
              {!editingProduct && (
                  <Item
                   name="slug"
                   label="Slug"
                   rules={[{ required: true, message: 'Por favor, insira o slug!' }]}
                 >
                   <Input placeholder="Ex: adubo-organico" />
                 </Item>
              )}


              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="category_id"
                    label="Categoria"
                    rules={[{ required: true, message: 'Selecione a categoria!' }]}
                  >
                    <Select placeholder="Selecione uma categoria" onChange={handleCategorySelectChangeInModal} value={selectedCategoryInModal}>
                      {/* Use Object.entries to get both key (name) and value (object) */}
                      {Object.entries(categoryStructure).map(([name, cat]) => (
                          <Option key={cat.id} value={cat.id}>{name}</Option>
                       ))}
                    </Select>
                  </Item>
                </Col>
                 <Col span={12}>
                   <Item
                     name="subcategory_id"
                     label="Subcategoria"
                      // Make subcategory required only if there are available options
                     rules={availableSubcategoriesForModal.length > 0 ? [{ required: true, message: 'Selecione a subcategoria!' }] : []}
                   >
                     <Select placeholder="Selecione a subcategoria" disabled={!selectedCategoryInModal || availableSubcategoriesForModal.length === 0}>
                       {availableSubcategoriesForModal.map(sub => (
                           <Option key={sub.id} value={sub.id}>{sub.name}</Option>
                       ))}
                     </Select>
                   </Item>
                 </Col>
              </Row>

             <Row gutter={16}>
                <Col span={12}>
                   <Item
                     name="price"
                     label="Preço (R$)"
                      rules={[{ required: true, message: 'Insira o preço!' }, { type: 'number', min: 0, message: 'Preço deve ser um número positivo!' }]}
                      // InputNumber value is number, parser/formatter are for display
                      getValueFromEvent={e => parseFloat(e.target.value.replace('R$ ', '').replace(/,/g, '')) || 0}
                   >
                     <InputNumber
                         min={0}
                         step={0.01}
                         formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                         parser={value => value.replace('R$ ', '').replace(/,*/g, '')}
                         style={{ width: '100%' }}
                         // Ensure initial value is treated as number
                          onChange={value => form.setFieldsValue({ price: value })}
                     />
                   </Item>
                </Col>
                 <Col span={12}>
                   <Item
                     name="original_price"
                     label="Preço Original (R$)"
                      rules={[{ type: 'number', min: 0, message: 'Preço original deve ser um número positivo!' }]}
                       getValueFromEvent={e => parseFloat(e.target.value.replace('R$ ', '').replace(/,/g, '')) || null}
                   >
                     <InputNumber
                        min={0}
                        step={0.01}
                        formatter={value => value ? `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                        parser={value => value.replace('R$ ', '').replace(/,*/g, '')}
                        style={{ width: '100%' }}
                         onChange={value => form.setFieldsValue({ original_price: value })}
                     />
                   </Item>
                 </Col>
             </Row>

              <Item
                 name="stock"
                 label="Estoque"
                 rules={[{ required: true, message: 'Informe a quantidade em estoque!' }, { type: 'integer', min: 0, message: 'Estoque deve ser um número inteiro positivo ou zero!' }]}
                 getValueFromEvent={e => parseInt(e.target.value, 10) || 0}
              >
                 <InputNumber min={0} precision={0} style={{ width: '100%' }} onChange={value => form.setFieldsValue({ stock: value })}/>
              </Item>

              {/* SKU is often important for products */}
              <Item
                 name="sku"
                 label="SKU"
              >
                 <Input placeholder="Ex: PROD-XYZ-123" />
              </Item>


               <Item
                   name="is_active"
                   label="Status"
                   valuePropName="value" // Use value prop for Select
                   rules={[{ required: true, message: 'Selecione o status!' }]}
               >
                    <Select>
                         <Option value={true}>Ativo</Option>
                         <Option value={false}>Inativo</Option>
                     </Select>
                </Item>


               <Item
                   name="images"
                   label="Imagens do Produto"
                   valuePropName="fileList" // Standard AntD prop for Upload
                   getValueFromEvent={(e) => {
                       // This function is called when file list changes
                       if (Array.isArray(e)) {
                           return e; // Handle initial value or manual setting
                       }
                       return e && e.fileList; // Handle events from Upload
                   }}
                >
                   <Upload
                       listType="picture-card"
                       customRequest={handleImageUpload} // Use the actual upload function
                       maxCount={4} // Limit the number of images
                        // Add `onRemove` if needed to delete images on the backend when removed from modal
                        // onRemove={file => console.log('Removing file:', file)}
                   >
                        { (form.getFieldValue('images') || []).length < 4 && <Button icon={<UploadOutlined />}>Upload</Button> }
                   </Upload>
                </Item>


               <Item
                 name="description"
                 label="Descrição Completa"
               >
                 <Input.TextArea rows={4} placeholder="Detalhes sobre o produto..." />
               </Item>

                 <FormList name="specs">
                     {(fields, { add, remove }) => (
                         <>
                            {fields.map(({ key, name, fieldKey, ...restField }) => (
                                 <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }} align="baseline">
                                    <Item
                                       {...restField}
                                       name={[name, 'key']}
                                       fieldKey={[fieldKey, 'key']}
                                       rules={[{ required: true, message: 'Chave é obrigatória.' }]}
                                       style={{marginBottom: 0}}
                                    >
                                       <Input placeholder="Ex: Material" style={{ width: 120 }}/>
                                    </Item>
                                     <Item
                                        {...restField}
                                        name={[name, 'value']}
                                        fieldKey={[fieldKey, 'value']}
                                        rules={[{ required: true, message: 'Valor é obrigatório.' }]}
                                        style={{marginBottom: 0, flexGrow: 1}}
                                     >
                                        <Input placeholder="Ex: Couro" />
                                     </Item>
                                     <MinusCircleOutlined onClick={() => remove(name)} />
                                 </Space>
                             ))}
                            <Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                                    Adicionar Especificação Técnica
                                </Button>
                            </Item>
                         </>
                     )}
                 </FormList>


           </Form>
         </Spin>
      </Modal>
    </div>
  );
};


export default AdminProductsPage;