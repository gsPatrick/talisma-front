// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

// <<< URL BASE DA SUA API BACKEND >>>
const API_BASE_URL = 'http://localhost:3001/api/v1'; // Ajuste a URL base da sua API

// Chave para armazenar os dados de autenticação no localStorage
const AUTH_STORAGE_KEY = 'agro_auth_data'; // Nome da chave no localStorage

// 1. Criação do Contexto com valor padrão NULL
const AuthContext = createContext(null);

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null || context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// 2. Criação do Provider
export const AuthProvider = ({ children }) => {
  // Estado para armazenar o usuário logado e o token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Adicionado estado para o token JWT
  const [loading, setLoading] = useState(true); // Estado para verificar login inicial
  const navigate = useNavigate(); // Embora não usado diretamente aqui, é útil em alguns Providers

  // --- Efeito para carregar dados de autenticação do localStorage (Ao montar o Provider) ---
  useEffect(() => {
    console.log("[AuthContext] Verificando localStorage para dados de autenticação...");
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedData) {
        const { user: storedUser, token: storedToken } = JSON.parse(storedData);
        // Opcional: Em um sistema real, você validaria o token com o backend aqui
        // para garantir que ele ainda é válido e não expirou.
        // Por enquanto, apenas carrega os dados se existirem
        setUser(storedUser || null);
        setToken(storedToken || null);
        console.log("[AuthContext] Dados de autenticação encontrados no localStorage.", storedUser);
      } else {
        console.log("[AuthContext] Nenhum dado de autenticação encontrado no localStorage.");
      }
    } catch (error) {
      console.error("[AuthContext] Erro ao carregar dados de autenticação do localStorage:", error);
      // Limpa localStorage se houver erro (dados corrompidos, etc.)
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setToken(null);
    } finally {
      // Define loading como false APENAS após a verificação inicial do localStorage
      setLoading(false);
      console.log("[AuthContext] Fim da verificação inicial de autenticação.");
    }

  }, []); // Array vazio: executa apenas uma vez ao montar o componente AuthProvider


  // --- Efeito para salvar/remover dados de autenticação no localStorage (Quando user/token mudam) ---
  useEffect(() => {
      // Este efeito só deve rodar DEPOIS que a verificação inicial do localStorage terminar.
      // O estado `loading` indica se a verificação inicial ainda está acontecendo.
      if (!loading) { // Executa apenas se o loading inicial já terminou
          if (user && token) {
              console.log("[AuthContext] Salvando dados de autenticação no localStorage...");
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
          } else {
              // Se user ou token é null/undefined, removemos os dados
              console.log("[AuthContext] Removendo dados de autenticação do localStorage.");
              localStorage.removeItem(AUTH_STORAGE_KEY);
          }
      }
      // Dependências: user e token. Quando user ou token mudam (ex: login/logout), salva.
      // Incluir 'loading' aqui é importante para que ele não remova logo de cara se user/token são nulls iniciais.
  }, [user, token, loading]);


  // --- Função de Login (Integração com API) ---
  // Recebe email e password, chama a API, atualiza estado e localStorage
  const login = async (email, password) => {
    // Removido setLoading(true) aqui para não interferir com o loading inicial do Provider.
    // O loading durante a chamada API é melhor gerenciado no componente que chama `login` (AuthPage).
    console.log(`[AuthContext] Tentando login com API: ${email}`);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Assume que a API retorna JSON

      if (response.ok) {
        // Login bem-sucedido: API retornou 2xx e dados do usuário/token
        if (data.user && data.token) {
            setUser(data.user); // Atualiza estado do usuário
            setToken(data.token); // Atualiza estado do token
            // O useEffect cuidará de salvar no localStorage

            // Exibe mensagem de sucesso (opcional, pode ser na página chamadora)
            message.success(`Bem-vindo(a), ${data.user.name || 'Usuário'}!`, 2);
            console.log("[AuthContext] Login API bem-sucedido.", data.user);

            // Retorna o objeto do usuário logado para a página chamadora
            return data.user;
        } else {
             // API retornou 2xx mas sem user/token esperados
             console.error("[AuthContext] Login API bem-sucedido, mas resposta inesperada:", data);
             message.error('Resposta inesperada do servidor após login.');
             setUser(null);
             setToken(null);
             // Lança um erro para indicar falha na página chamadora
             throw new Error('Resposta inválida do servidor.');
        }

      } else {
        // Login falhou: API retornou 4xx ou 5xx
        console.error("[AuthContext] Login API falhou:", data.message || response.statusText);
        message.error(data.message || 'Credenciais inválidas.'); // Exibe mensagem de erro do backend
        setUser(null); // Garante que o estado está limpo
        setToken(null);
        // Lança um erro para que a página chamadora possa capturá-lo
         const error = new Error(data.message || 'Login falhou.');
         error.status = response.status; // Adiciona status HTTP ao erro
         throw error;
      }

    } catch (error) {
      // Erro na comunicação (rede, CORS, etc.)
      console.error("[AuthContext] Erro durante a chamada de login API:", error);
      //message.error('Erro na comunicação com o servidor.'); // Pode ser duplicado se a página também tratar
      setUser(null);
      setToken(null);
      throw error; // Relança o erro para a página chamadora
    }
     // Removido finally: loading é gerenciado na AuthPage
  };

  // --- Função de Logout ---
   // Limpa o estado e aciona o efeito para remover do localStorage
   const logout = () => {
     console.log("[AuthContext] Realizando logout.");
     setUser(null); // Limpa estado do usuário
     setToken(null); // Limpa estado do token
     // O useEffect cuidará de remover do localStorage

     // Exibe mensagem de logout (opcional, pode ser na página chamadora)
     message.info('Você saiu da sua conta.');

     // Opcional: Redirecionar automaticamente para a tela de login após logout
     // navigate('/auth'); // Descomente se quiser redirecionar aqui
   };


  // Deriva o estado isAuthenticated e isAdmin usando useMemo
  const isAuthenticated = useMemo(() => user != null && token != null, [user, token]); // É autenticado se user E token existem
  const isAdmin = useMemo(() => user?.role === 'admin', [user]); // É admin se user existe e role é 'admin'

  // Valor fornecido pelo contexto
  // UseMemo para otimizar e garantir que o objeto 'value' só mude quando suas dependências mudarem
  const value = useMemo(() => ({
    user, // Objeto do usuário logado ou null
    token, // Token JWT ou null
    login, // Função para login (agora API)
    logout, // Função para logout
    isAuthenticated, // Booleano: true se logado e com token
    isAdmin, // Booleano: true se for admin
    loading, // Booleano: true APENAS durante a verificação inicial do localStorage
    // Adicione 'loading' durante as chamadas API se quiser, mas é melhor na página
  }), [user, token, login, logout, isAuthenticated, isAdmin, loading]); // Dependências atualizadas para useMemo

  // Renderiza os filhos envolvidos pelo Provider
  // A página que usa useAuth é responsável por mostrar um spinner baseado no estado `loading`.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};