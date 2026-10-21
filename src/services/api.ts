// src/services/api.ts
import axios from 'axios';

// Cria uma instância do Axios com configurações padrão
export const api = axios.create({
  baseURL: 'http://localhost:3000', 
  
  // ESSENCIAL PARA HTTP ONLY COOKIES:
  // Envia cookies automaticamente (incluindo o JWT HttpOnly) em todas as requisições
  withCredentials: true, 
});

// Interceptor de Requisição: anexa também o Bearer Token no cabeçalho se disponível
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: monitora erros de autenticação globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sessão expirada ou não autorizada.');
    }
    return Promise.reject(error);
  }
);
