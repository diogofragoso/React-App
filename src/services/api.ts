// src/services/api.ts
import axios from 'axios';

// Obtém a URL da API a partir da variável de ambiente VITE_API_URL (ou usa localhost como fallback)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Cria uma instância do Axios com configurações dinâmicas de ambiente
export const api = axios.create({
  baseURL: API_BASE_URL,
  
  // ESSENCIAL PARA HTTP-ONLY COOKIES:
  // Envia cookies automaticamente (incluindo o JWT HttpOnly) em todas as requisições
  // tanto em ambiente local quanto em requisições cross-domain no Azure.
  withCredentials: true,
  timeout: 10000,
});

// Interceptor de Resposta: captura erros 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sessão expirada ou não autorizada na API:', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);
