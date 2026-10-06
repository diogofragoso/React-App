// src/types/index.ts

// O formato exato dos dados que a tela de Login vai enviar para a API
export interface LoginCredentials {
  email: string;
  password: string; 
}

// O formato dos dados do Usuário que esperamos receber da API
export interface User {
  id: number; // Alterado para number (int) para bater com o banco de dados
  name: string;
  email: string;
  role?: string; // Opcional, caso o  sistema tenha níveis de acesso (Admin, User)
}

