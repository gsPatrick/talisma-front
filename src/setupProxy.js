const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy para as chamadas da API
  app.use(
    '/api', // Caminho a ser interceptado (requisições que começam com /api)
    createProxyMiddleware({
      target: 'https://geral-talismaapi.r954jc.easypanel.host/', // O endereço do seu backend
      changeOrigin: true,
      secure: false, // Use true se seu backend usa HTTPS
    })
  );

  // Proxy para os arquivos de upload estáticos
  app.use(
    '/uploads', // Caminho a ser interceptado (requisições que começam com /uploads)
    createProxyMiddleware({
      target: 'https://geral-talismaapi.r954jc.easypanel.host/', // O endereço do seu backend
      changeOrigin: true,
      secure: false, // Use true se seu backend usa HTTPS
    })
  );
};