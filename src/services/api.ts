// src/services/api.ts
import axios from 'axios';

// Cria uma instância do Axios com configurações padrão
export const api = axios.create({
  // URL base da sua API (ajuste a porta conforme o seu back-end)
  baseURL: 'http://localhost:3000', 
  
  //  ESSENCIAL PARA HTTP ONLY COOKIES:
  // Essa configuração diz ao navegador para SEMPRE enviar os cookies guardados
  // (incluindo o nosso JWT HttpOnly) em todas as requisições para a API.
  withCredentials: true, 
});

// Exemplo de Interceptor de Resposta (Opcional, mas muito recomendado)
// Ele "escuta" todas as respostas da API globalmente. Se a API retornar erro 401 
// (Não Autorizado), sabemos que o cookie/token expirou ou é inválido.
api.interceptors.response.use(
  (response) => {
    // Se a requisição deu certo, simplesmente retorna a resposta
    return response; 
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sessão expirada ou não autorizada. Redirecionando para o login...');
      // Futuramente, podemos acionar uma função aqui para deslogar o usuário no front
    }
    return Promise.reject(error);
  }
);