const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // Prefixo da API para salvamento
    createProxyMiddleware({
      target: 'http://localhost:5000', // URL do servidor Flask
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove o prefixo /api ao encaminhar a solicitação
      },
    })
  );
};
