import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { // Certifique-se que esta seção existe
    port: 3000, // A porta que seu frontend roda (ajuste se for diferente)
    proxy: { // Adicione ou modifique esta seção
      // Proxy para as chamadas da API (se não configurou ainda)
      '/api': {
        target: 'http://localhost:3001', // O endereço do seu backend
        changeOrigin: true, // Necessário para hosts virtuais
        secure: false, // Use true se seu backend usa HTTPS
      },
      // Proxy para os arquivos de upload estáticos
      '/uploads': {
        target: 'http://localhost:3001', // O endereço do seu backend
        changeOrigin: true, // Necessário
        secure: false, // Use true se seu backend usa HTTPS
      }
    }
  }
})