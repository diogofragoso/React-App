// src/services/api.ts
import axios from 'axios';

// Obtém a URL da API a partir da variável de ambiente VITE_API_URL (ou usa localhost como fallback)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Cria uma instância do Axios com configurações dinâmicas de ambiente
export const api = axios.create({
  baseURL: API_BASE_URL,
  
  // ESSENCIAL PARA HTTP ONLY COOKIES:
  // Envia cookies automaticamente em todas as requisições
  withCredentials: true, 
});

// Interceptor de Requisição: anexa também o Bearer Token no cabeçalho se disponível
// Isso garante compatibilidade total mesmo em ambientes cross-domain (ex: Azure + Vercel / Local)
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
      console.warn('Sessão expirada ou não autorizada na API:', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);
