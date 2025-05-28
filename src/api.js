// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://geral-talismaapi.r954jc.easypanel.host/api/v1', // Sua URL base da API
});

// O interceptor de requisição para adicionar o token já foi definido no AuthContext
// `api.defaults.headers.common['Authorization'] = Bearer ${token}`;

// Opcional: Adicionar um interceptor de resposta para lidar com erros 401 globalmente
api.interceptors.response.use(
  (response) => response, // Resposta bem sucedida, apenas retorna
  (error) => {
    // Se o erro for 401 (Unauthorized) e não for a rota de login em si
    if (error.response && error.response.status === 401 && !error.config.url.endsWith('/auth/login')) {
      console.error('Requisição não autorizada (401). Deslogando...');
      // Desloga o usuário (chama a função logout do AuthContext)
      // ATENÇÃO: Chamar useContext(AuthContext).logout() diretamente aqui pode causar problemas
      // porque interceptors não são componentes React. Uma forma é emitir um evento
      // ou passar a função logout para cá. Uma solução mais simples para este exemplo
      // é apenas limpar o storage, o useEffect no AuthContext vai reagir a isso na próxima carga.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      // Opcional: redirecionar para login. Isso geralmente é feito no componente principal
      // ou em um handler global que escuta este evento/erro.
    }
    return Promise.reject(error); // Repropaga o erro
  }
);

export default api;