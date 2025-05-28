// src/pages/ProductListPage/ProductListPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Card, Select, Pagination, Spin, Alert, Typography, Empty, Checkbox, Space, Menu, Slider, InputNumber, Divider, Input } from 'antd';
import {
  LoadingOutlined, AppstoreOutlined, DollarOutlined, SortAscendingOutlined, SortDescendingOutlined, FilterOutlined, TagsOutlined,
  SearchOutlined
} from '@ant-design/icons';
import HeaderAgro from '../../componentsAgro/HeaderAgro/HeaderAgro';
import ProductCard from '../../componentsAgro/ProductCard/ProductCard';
 import FooterLP from '../../componentsAgro/FooterAgro/FooterAgro';
import debounce from 'lodash.debounce';
import './ProductListPage.css';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { SubMenu } = Menu;
const { Search } = Input;


// <<< URL BASE DA SUA API BACKEND >>>
// Use process.env.REACT_APP_API_URL como primário, com fallback para localhost:3000
const API_BASE_URL = 'https://geral-talismaapi.r954jc.easypanel.host/api/v1'; // Ajuste a URL base da sua API


// Helper para formatar preço (Mantida)
const formatPrice = (value) => {
  if (typeof value !== 'number' || isNaN(value)) { return 'R$ --'; }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
const allCategories = Object.keys(categoryStructure);
const categorySlugToName = Object.keys(categoryStructure).reduce((acc, name) => {
    acc[categoryStructure[name].slug] = name;
    return acc;
}, {});

const subcategoryNameToInfo = Object.values(categoryStructure).reduce((acc, cat) => {
     cat.subs.forEach(sub => {
         acc[sub.name] = { id: sub.id, slug: sub.slug };
     });
     return acc;
}, {});
const subcategorySlugToName = Object.values(categoryStructure).reduce((acc, cat) => {
     cat.subs.forEach(sub => {
         acc[sub.slug] = sub.name;
     });
     return acc;
}, {});
// --- Fim Estrutura Mock ---


// <<< REMOVIDOS TODOS OS DADOS MOCKADOS DE PRODUTOS LOCAIS >>>
// <<< REMOVIDA A SIMULAÇÃO simulateFetchAdminProducts >>>


const ProductListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams(); // Pega parâmetros da URL como :categoriaSlug

  // --- Estados ---
  // products agora conterá APENAS os produtos da PÁGINA ATUAL, vindos da API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Estados para Filtros (Sincronizados com URL e Sidebar) ---
  const [urlCategorySlug, setUrlCategorySlug] = useState(params.categoria || null);
  const [selectedSubcategoryNames, setSelectedSubcategoryNames] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]); // Ajuste Máximo mockado
  const [searchText, setSearchText] = useState('');

  // Estados para Paginação (AGORA ENVIADOS PARA A API)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0); // Total de produtos FILTRADOS (da API)

  // Estado para Ordenação (AGORA ENVIADO PARA A API)
  const [sortOrder, setSortOrder] = useState('relevance'); // Ex: 'relevance', 'price-asc', 'price-desc', 'name-asc', 'rating-desc'

  // Estado para controle do menu lateral (UI)
  const [openSubmenuKeys, setOpenSubmenuKeys] = useState([]);


  // --- Efeito para SINCRONIZAR estados com a URL (params e query params) ---
  // Este efeito NÃO DISPARA a busca de produtos. Ele APENAS atualiza os estados
  // do componente para refletir o que está na URL.
  // A busca de produtos é disparada pelo próximo useEffect, que depende desses estados.
  useEffect(() => {
      console.log("URL mudou, sincronizando estados:", location.pathname, location.search);
      // 1. Sincronizar categoria da URL (params.categoria)
      const currentCategorySlug = params.categoria || null;
      setUrlCategorySlug(currentCategorySlug);
      const currentCategoryNameFromSlug = categorySlugToName[currentCategorySlug] || null;
      setOpenSubmenuKeys(currentCategoryNameFromSlug ? [currentCategoryNameFromSlug] : []);


      // 2. Sincronizar subcategorias do Query Parameter (?sub=...)
      const queryParams = new URLSearchParams(location.search);
      const subQuery = queryParams.get('sub');
      let subcategoryNamesFromUrl = [];
      if (subQuery) {
          const subSlugsFromUrl = subQuery.split(',').map(slug => slug.trim()).filter(slug => slug);
           subcategoryNamesFromUrl = subSlugsFromUrl.map(slug => subcategorySlugToName[slug])
           .filter(name => name);
      }
      setSelectedSubcategoryNames(subcategoryNamesFromUrl);


      // 3. Sincronizar outros filtros da URL (preço, busca, ordenação, paginação)
      const minPriceQuery = queryParams.get('minPrice');
      const maxPriceQuery = queryParams.get('maxPrice');
      const searchQuery = queryParams.get('q');
      const sortQuery = queryParams.get('sortBy');
      const orderQuery = queryParams.get('order'); // << Ler ordem da URL
      const pageQuery = queryParams.get('page'); // << Ler página da URL
      const pageSizeQuery = queryParams.get('pageSize'); // << Ler tamanho da página da URL


      const initialMinPrice = minPriceQuery !== null ? parseFloat(minPriceQuery) : 0;
      const initialMaxPrice = maxPriceQuery !== null ? parseFloat(maxPriceQuery) : 1000;
      const initialSearchText = searchQuery || '';
      const initialSortBy = sortQuery || 'created_at'; // Default sorting para 'created_at'
      const initialOrder = orderQuery || 'desc'; // Default order para 'desc'

      // Combina sortBy e order em um único estado de ordenação para simplificar o useEffect de fetch
      const initialSortOrder = initialSortBy === 'relevance' ? 'relevance' : `${initialSortBy}-${initialOrder}`;


       // Atualiza estados locais se eles mudaram
      if (!isNaN(initialMinPrice) || !isNaN(initialMaxPrice)) {
          const min = isNaN(initialMinPrice) ? 0 : Math.max(0, initialMinPrice);
          const max = isNaN(initialMaxPrice) ? 1000 : Math.min(1000, initialMaxPrice);
          // Atualiza APENAS se o valor for diferente do estado atual para evitar loop infinito
          if (priceRange[0] !== min || priceRange[1] !== max) setPriceRange([min, max]);
      } else {
           if (priceRange[0] !== 0 || priceRange[1] !== 1000) setPriceRange([0, 1000]);
      }

       // Atualiza APENAS se o valor for diferente
       if (searchText !== initialSearchText) setSearchText(initialSearchText);
       if (sortOrder !== initialSortOrder) setSortOrder(initialSortOrder);


      // Paginação: Ler da URL
      const initialPage = pageQuery !== null ? parseInt(pageQuery, 10) : 1;
      const initialPageSize = pageSizeQuery !== null ? parseInt(pageSizeQuery, 10) : 12; // Default 12

       // Atualiza APENAS se o valor for diferente
      if (!isNaN(initialPage) && initialPage > 0 && currentPage !== initialPage) setCurrentPage(initialPage);
      if (!isNaN(initialPageSize) && initialPageSize > 0 && pageSize !== initialPageSize) setPageSize(initialPageSize);

      // NOTA: O reset de paginação para a pág 1 ao mudar filtros é tratado nos handlers (updateUrlWith...)
      // Quando a URL muda por filtro, o `useEffect` de sincronização atualiza os estados,
      // incluindo o `currentPage` para 1.

      // Dependências: location (para query params) e params.categoria (para path param)
      // Este effect só deve depender da URL
  }, [location.search, params.categoria]); // Dispara este efeito APENAS quando a URL muda


  // --- Efeito para carregar produtos da API (DISPARA BASEADO NOS ESTADOS SINCRONIZADOS) ---
  // Dispara quando QUALQUER estado de filtro, busca, paginação ou ordenação muda (que foram setados pelo effect anterior ou por handlers)
  useEffect(() => {
      // Prepara os query parameters para a chamada API
      const queryParams = new URLSearchParams();

      // Mapeia o slug da categoria da URL para o ID (mockado) para enviar à API
      if (urlCategorySlug) {
           const categoryName = categorySlugToName[urlCategorySlug];
           const categoryId = categoryStructure[categoryName]?.id;
           if (categoryId !== undefined) queryParams.append('categoryIds', categoryId); // API espera comma-separated, mas aqui é só um ID
      }

      // Mapeia nomes de subcategoria selecionadas para IDs (mockados) para enviar à API
      if (selectedSubcategoryNames.length > 0) {
          const subcategoryIds = selectedSubcategoryNames
             .map(subName => subcategoryNameToInfo[subName]?.id)
             .filter(id => id !== undefined);
          if (subcategoryIds.length > 0) {
              queryParams.append('subcategoryIds', subcategoryIds.join(',')); // API espera comma-separated
          }
      }

       // Adiciona filtros de preço se não estiverem nos valores default
       if (priceRange[0] > 0) queryParams.append('minPrice', priceRange[0]);
       if (priceRange[1] < 1000) queryParams.append('maxPrice', priceRange[1]); // Ajuste 1000

       // Adiciona busca por texto
       if (searchText) queryParams.append('q', searchText);

       // Adiciona paginação
       queryParams.append('page', currentPage);
       queryParams.append('pageSize', pageSize);

       // Adiciona ordenação
       if (sortOrder && sortOrder !== 'relevance') {
           const [sortByField, sortOrderDirection] = sortOrder.split('-');
           queryParams.append('sortBy', sortByField); // Ex: 'price', 'name', 'rating'
           queryParams.append('order', sortOrderDirection); // Ex: 'asc', 'desc'
       } else {
           // Se for 'relevance' ou nenhum sortBy selecionado, use o default da API (espera-se que a API tenha um default)
           // Se o default da API for 'created_at desc', não precisa adicionar params aqui.
           // Se a API não tiver default, pode adicionar aqui:
           // queryParams.append('sortBy', 'created_at'); queryParams.append('order', 'desc');
       }


      const fetchProducts = async () => {
          setLoading(true);
          setError(null);
          // Não limpa products e totalProducts aqui para evitar que a lista desapareça antes de carregar a nova página
          // setProducts([]);
          // setTotalProducts(0);

          // >>> CHAMADA API REAL <<<
          try {
              const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
              console.log("Buscando produtos da API:", url);

              const response = await fetch(url);

              const contentType = response.headers.get("content-type");
               // Verifica se a resposta é JSON válida antes de tentar parsear
              if (!contentType || !contentType.includes("application/json")) {
                 const errorText = await response.text();
                 console.error("Resposta da API não é JSON válida:", response.status, errorText);
                 throw new TypeError("Resposta da API não é JSON válida.");
              }

              const data = await response.json(); // Assume que a API retorna { data: [...], total: ... }

              if (response.ok) {
                 // API real deve retornar { data: [...], total: ... }
                 // Verifica se data.data é um array e se data.total é um número
                 if (Array.isArray(data.data) && typeof data.total === 'number') {
                     setProducts(data.data); // Define os produtos da página atual
                     setTotalProducts(data.total); // Define o total de produtos filtrados
                 } else {
                     console.error("Formato de resposta da API inesperado:", data);
                     throw new TypeError("Formato de resposta da API inesperado.");
                 }

              } else {
                 // Erro da API (4xx, 5xx)
                 console.error("Erro da API:", data.message || response.statusText);
                 setError(data.message || `Erro ${response.status}: Falha ao carregar produtos.`);
                 // Não limpa products/totalProducts aqui para manter a lista anterior visível com a mensagem de erro
                 // setProducts([]); setTotalProducts(0);
              }

          } catch (err) {
              console.error("Erro na comunicação com a API:", err);
               // Erro de rede/CORS ('Failed to fetch') ou TypeErrors
               if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                   setError('Não foi possível conectar ao servidor backend. Verifique se ele está rodando.');
               } else {
                   setError('Erro inesperado ao carregar produtos.');
               }
               // Não limpa products/totalProducts aqui
               // setProducts([]); setTotalProducts(0);
          } finally {
              setLoading(false);
          }
      };

      // Dispara a busca sempre que os estados que afetam a URL ou a requisição mudam
      fetchProducts();


      // Dependências: Todos os estados que representam os critérios de busca/filtragem/paginação/ordenação
      // Quando QUALQUER UM DESSES MUDA, uma NOVA BUSCA é disparada.
      // O useEffect de sincronização com a URL garante que esses estados estejam atualizados antes que este rode.
  }, [urlCategorySlug, selectedSubcategoryNames, priceRange, searchText, currentPage, pageSize, sortOrder]);


  // --- Handlers ---
  // Handles para filtros e paginação agora ATUALIZAM A URL
  // O useEffect de sincronização URL -> Estados reage à mudança na URL
  // O useEffect de Estados -> API reage à mudança nos estados sincronizados e dispara a busca

  const handleCategorySelect = (categoryKey) => {
    // Constrói o novo slug da categoria
    const newCategorySlug = categoryKey === 'all' ? '' : categoryStructure[categoryKey]?.slug || categoryKey; // Usa o slug da estrutura mock
    const newPathBase = `/produtos${newCategorySlug ? '/' + newCategorySlug : ''}`;

     // Mantém os query params existentes, mas remove 'sub', 'page' e 'pageSize' ao mudar categoria principal
    const queryParams = new URLSearchParams(location.search);
     queryParams.delete('sub');
     queryParams.delete('page'); // Volta para a primeira página
     queryParams.delete('pageSize'); // Volta para o tamanho padrão (ou remove o param)
     // Opcional: remover outros filtros de preço/busca ao mudar categoria principal? Decisão de UX.
     // queryParams.delete('minPrice'); queryParams.delete('maxPrice'); queryParams.delete('q');


     // Constrói a URL final com os query params restantes
     const finalPath = `${newPathBase}?${queryParams.toString()}`;

     // Navega apenas se a URL final for diferente para evitar re-render desnecessário
     if(location.pathname + location.search !== finalPath) {
        navigate(finalPath);
     }
    // O useEffect de sincronização com a URL vai atualizar os estados após a navegação
  };

   const handleSubcategoryChange = (subcategoryName) => {
       // Encontra o slug da subcategoria clicada
       const subcategoryInfo = subcategoryNameToInfo[subcategoryName];
       if (!subcategoryInfo) return;

       const subcategorySlug = subcategoryInfo.slug;

       const queryParams = new URLSearchParams(location.search);
       const currentSubSlugs = queryParams.get('sub') ? queryParams.get('sub').split(',').map(s => s.trim()).filter(s => s) : [];

       const isCurrentlySelected = currentSubSlugs.includes(subcategorySlug);
       const newSelectedSubSlugs = isCurrentlySelected
           ? currentSubSlugs.filter(slug => slug !== subcategorySlug)
           : [...currentSubSlugs, subcategorySlug];

       if (newSelectedSubSlugs.length > 0) {
           queryParams.set('sub', newSelectedSubSlugs.join(','));
       } else {
           queryParams.delete('sub');
       }

        // Resetar paginação ao mudar filtro
       queryParams.delete('page');
       queryParams.delete('pageSize');

        // Mantém o path atual (categoria principal ou /produtos) e adiciona/atualiza os query params
       const newPath = `${location.pathname}?${queryParams.toString()}`;

       if(location.pathname + location.search !== newPath) {
           navigate(newPath);
       }
  };

   const handlePriceChange = (value) => {
       setPriceRange(value); // Atualiza estado local imediatamente para feedback visual

       const updateUrlWithPrice = (range) => {
           const queryParams = new URLSearchParams(location.search);
           const min = range[0];
           const max = range[1];
           if (min > 0) queryParams.set('minPrice', min); else queryParams.delete('minPrice');
           if (max < 1000) queryParams.set('maxPrice', max); else queryParams.delete('maxPrice');

           // Resetar paginação ao mudar filtro de preço
           queryParams.delete('page');
           queryParams.delete('pageSize');

           const newPath = `${location.pathname}?${queryParams.toString()}`;
            if(location.pathname + location.search !== newPath) {
                navigate(newPath);
            }
       };
       debouncedPriceChange(value);
   };
   const debouncedPriceChange = useCallback(debounce((range) => {
        const queryParams = new URLSearchParams(location.search);
        const min = range[0];
        const max = range[1];
        if (min > 0) queryParams.set('minPrice', min); else queryParams.delete('minPrice');
        if (max < 1000) queryParams.set('maxPrice', max); else queryParams.delete('maxPrice');
        queryParams.delete('page');
        queryParams.delete('pageSize');
        const newPath = `${location.pathname}?${queryParams.toString()}`;
         if(location.pathname + location.search !== newPath) {
             navigate(newPath);
         }
   }, 300), [location.search, location.pathname, navigate]);


    const handleSearch = useCallback((value) => {
        const queryParams = new URLSearchParams(location.search);
        if (value) queryParams.set('q', value); else queryParams.delete('q');

         // Resetar paginação ao mudar busca
        queryParams.delete('page');
        queryParams.delete('pageSize');

        const newPath = `${location.pathname}?${queryParams.toString()}`;
        if(location.pathname + location.search !== newPath) {
            navigate(newPath);
        }
         // O estado searchText é atualizado pelo onChange do Input.Search para feedback visual
    }, [location.search, location.pathname, navigate]);


  const handleSortChange = (value) => {
       const queryParams = new URLSearchParams(location.search);
       if (value && value !== 'relevance') {
           const [sortByField, sortOrderDirection] = value.split('-');
           queryParams.set('sortBy', sortByField);
           queryParams.set('order', sortOrderDirection);
       } else {
           queryParams.delete('sortBy');
           queryParams.delete('order'); // Remover ambos se for 'relevance'
       }

        // Resetar paginação ao mudar ordenação
       queryParams.delete('page');
       queryParams.delete('pageSize');

       const newPath = `${location.pathname}?${queryParams.toString()}`;
       if(location.pathname + location.search !== newPath) {
            navigate(newPath);
       }
  };

  const handlePageChange = (page, pageSizeValue) => {
       // Atualiza a paginação NA URL
       const queryParams = new URLSearchParams(location.search);
       queryParams.set('page', page);
       queryParams.set('pageSize', pageSizeValue);

       const newPath = `${location.pathname}?${queryParams.toString()}`;
       if(location.pathname + location.search !== newPath) {
            navigate(newPath);
       }
       // Os estados currentPage e pageSize são atualizados pelo useEffect de sincronização
       // ao detectar a mudança na URL.
  };

  // handleSubmenuOpenChange (Mantida)
  const handleSubmenuOpenChange = (keys) => {
     const latestOpenKey = keys.find(key => !openSubmenuKeys.includes(key));
     if (allCategories.includes(latestOpenKey)) {
       setOpenSubmenuKeys(latestOpenKey ? [latestOpenKey] : []);
     } else {
       setOpenSubmenuKeys(keys);
     }
      console.log("Submenu keys:", keys, "latestOpenKey:", latestOpenKey);
  };


   // Obtém o nome completo da categoria principal (para exibir no menu)
   const currentCategoryName = categorySlugToName[urlCategorySlug] || null;
    // Obtém as subcategorias disponíveis para a categoria principal selecionada (para o menu e checkboxes)
   const availableSubcategoriesForMenu = currentCategoryName ? (categoryStructure[currentCategoryName]?.subs || []) : [];


  // --- Renderização ---
  return (
    <Layout className="ecommerce-layout product-list-layout">
      <HeaderAgro />

       <Layout className='product-list-inner-layout'>
             {/* Barra Lateral de Filtros (Sider) */}
             <Sider width={260} className="product-list-sider" breakpoint="lg" collapsedWidth="0">
                  <div className="filter-section">
                    <Title level={5} className="filter-title"><FilterOutlined /> Filtrar Por</Title>
                    {/* Menu de Categorias */}
                    <Menu
                        mode="inline"
                        selectedKeys={urlCategorySlug ? [currentCategoryName] : ['all']}
                        openKeys={openSubmenuKeys}
                        onOpenChange={handleSubmenuOpenChange}
                        onClick={({ key }) => {
                             if (key === 'all' || allCategories.includes(key)) {
                                 handleCategorySelect(key);
                             }
                         }}
                        className="category-filter-menu"
                    >
                       {/* Item "Todas as Categorias" - Navega para /produtos */}
                        <Menu.Item key="all" icon={<AppstoreOutlined />} className={urlCategorySlug === null ? 'ant-menu-item-selected' : ''}>Todas as Categorias</Menu.Item>

                       <Menu.Divider/>
                        {allCategories.map(catName => {
                            const categoryInfo = categoryStructure[catName];
                             if (!categoryInfo) return null;

                            const subcategoriesForThisMenu = categoryInfo.subs || [];

                            return (
                                <SubMenu key={catName} title={catName} icon={<TagsOutlined/>}>
                                   {/* Link "Ver Todos em [Categoria]" dentro do submenu - Navega para /produtos/:categorySlug */}
                                    <Menu.Item key={`${catName}-all`} className="mobile-nav-link sub-link all">
                                        <Link to={`/produtos/${categoryInfo.slug}`}>Ver Todos em {catName}</Link>
                                    </Menu.Item>
                                    {subcategoriesForThisMenu.length > 0 && <Menu.Divider className="mobile-drawer-divider-submenu"/>}


                                   {/* Subcategorias como Checkboxes dentro dos Menu.Items */}
                                    {subcategoriesForThisMenu.map(sub => (
                                        <Menu.Item key={`${catName}-${sub.slug}`} className="subcategory-item" onClick={(e) => e.domEvent.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedSubcategoryNames.includes(sub.name)}
                                                onChange={() => handleSubcategoryChange(sub.name)}
                                             >
                                                {sub.name}
                                            </Checkbox>
                                        </Menu.Item>
                                    ))}
                                 </SubMenu>
                             );
                        })}
                    </Menu>
                  </div>
                   <Divider className="filter-divider" />
                   {/* Filtro de Preço */}
                   <div className="filter-section">
                       <Title level={5} className="filter-title"><DollarOutlined /> Faixa de Preço</Title>
                       <div style={{ padding: '0 16px' }}>
                           <Slider
                                range={{ draggableTrack: true }}
                                value={priceRange}
                                max={1000} // Ajuste Máximo mockado
                                onChange={handlePriceChange} // Usa o handler que chama o debounced E atualiza estado local
                                tooltip={{ formatter: formatPrice }}
                                step={10}
                                className="price-slider"
                            />
                             <div className='price-range-display'>
                                 <Text>{formatPrice(priceRange[0])}</Text>
                                 <Text>-</Text>
                                 <Text>{formatPrice(priceRange[1])}</Text>
                             </div>
                       </div>
                   </div>
                    {/* Filtro de Busca por Texto */}
                     <Divider className="filter-divider" />
                      <div className="filter-section">
                          <Title level={5} className="filter-title"><SearchOutlined /> Buscar Texto</Title>
                           <div style={{ padding: '0 16px' }}>
                                <Search // Usado o componente Search desestruturado do Input
                                    placeholder="Buscar por nome ou descrição..." // Atualizado placeholder
                                     value={searchText}
                                     onChange={(e) => setSearchText(e.target.value)} // Atualiza estado local
                                    onSearch={handleSearch} // Usa o handler debounced
                                    enterButton
                                />
                           </div>
                       </div>


             </Sider>

             {/* Conteúdo Principal */}
             <Content className="ecommerce-main-content product-list-items-content">
                 {/* Barra superior de Ordenação e Total */}
                 <Row justify="space-between" align="middle" style={{ marginBottom: '1.5rem' }}>
                     <Col xs={24} sm={12}>
                          <Text strong>Total de Produtos:</Text> <Text>{totalProducts}</Text>
                     </Col>
                    <Col xs={24} sm={12} style={{textAlign: 'right'}}>
                         <Space align="center">
                             <Text strong>Ordenar por:</Text>
                             <Select value={sortOrder} onChange={handleSortChange} style={{ width: 180 }}>
                                <Option value="relevance">Relevância</Option>
                                <Option value="price-asc"><SortAscendingOutlined /> Menor Preço</Option>
                                <Option value="price-desc"><SortDescendingOutlined /> Maior Preço</Option>
                                <Option value="name-asc">Nome (A-Z)</Option>
                                <Option value="name-desc">Nome (Z-A)</Option>
                                <Option value="rating-desc">Melhor Avaliação</Option>
                                 <Option value="rating-asc">Pior Avaliação</Option>
                                  <Option value="created_at-desc">Mais Recentes</Option> {/* Adicionado ordenação por data */}
                                   <Option value="created_at-asc">Mais Antigos</Option> {/* Adicionado ordenação por data */}
                             </Select>
                         </Space>
                    </Col>
                 </Row>

                 {/* Erro */}
                 {error && !loading && ( <Alert message="Erro ao carregar produtos" description={error} type="error" showIcon style={{ marginBottom: 24 }}/> )}

                 {/* Grid de Produtos */}
                 {/* Spinner global ou Empty State */ }
                 <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} size="large">
                    {/* <<< USA products QUE É A LISTA DA PÁGINA ATUAL VINDA DA API >>> */}
                    {products.length > 0 ? ( // Agora usa products diretamente
                        <Row gutter={[16, 24]} className="product-grid">
                        {products.map(product => ( // Itera sobre products
                            <Col key={product.id || product.product_id} xs={12} sm={12} md={8} lg={6} xl={6}>
                            {/* Passa os dados do produto recebidos da API */}
                            {/* Mapeia campos da API para as props do ProductCard (similar à HomePage) */}
                             <ProductCard product={{
                                 id: product.id || product.product_id,
                                 name: product.name,
                                 imageUrl: product.image_url || (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) || 'https://via.placeholder.com/300x300/f5f5f5/005C40?text=Sem+Imagem',
                                 images: product.images,
                                 price: parseFloat(product.price),
                                 originalPrice: product.original_price ? parseFloat(product.original_price) : null,
                                 rating: product.rating ? parseFloat(product.rating) : null,
                                 stock: product.stock !== undefined && product.stock !== null ? parseInt(product.stock, 10) : undefined,
                                 description: product.description,
                                 specs: product.specs,
                                 category: product.category, // Pode ser null se a API não incluir
                                 subcategory: product.subcategory, // Pode ser null se a API não incluir
                             }} />
                            </Col>
                        ))}
                        </Row>
                    ) : (
                        !loading && !error && (
                           <Empty description={<Text type="secondary">Nenhum produto encontrado para os filtros selecionados.</Text>} style={{marginTop: '40px'}} image={Empty.PRESENTED_IMAGE_IMAGE}/>
                        )
                    )}
                 </Spin>

                {/* Paginação */}
                 {/* Exibe paginação apenas se não estiver carregando E houver produtos para paginar (totalProducts da API) */}
                {!loading && totalProducts > 0 && ( // Verifica totalProducts > 0, não totalProducts > pageSize
                    <Pagination
                        current={currentPage} pageSize={pageSize} total={totalProducts}
                        onChange={handlePageChange} onShowSizeChange={handlePageChange}
                        showSizeChanger={true} pageSizeOptions={[12, 24, 36, 48]}
                        style={{ marginTop: 32, textAlign: 'center' }}
                        showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} produtos`}
                    />
                )}
             </Content>
        </Layout>

      {/* Renderiza Footer (ajuste conforme seu componente) */}
        <FooterLP/>
    </Layout>
  );
};

export default ProductListPage;