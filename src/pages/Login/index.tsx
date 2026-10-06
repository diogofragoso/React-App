// src/pages/Login/index.tsx
import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { api } from '../../services/api';
import type { LoginCredentials } from '../../types';

export function Login() {
  // 1. Estados da nossa tela
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Para travar o botão enquanto carrega

  // Ferramenta do React Router para mudar de página via código
  const navigate = useNavigate();

  // 2. Função disparada ao submeter o formulário
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita que a página recarregue ao dar submit
    setError(null);
    setLoading(true);

    const credentials: LoginCredentials = { email, password };

    try {
      // Fazendo a requisição de login para a API (ajuste a rota se a sua for diferente)
      await api.post('/login', credentials);
      
      // Se a linha acima não der erro, significa que recebemos 200 OK.
      // O navegador já salvou o cookie HttpOnly automaticamente!
      
      // Redireciona o usuário para a página Home
      navigate('/');
      
    } catch (err: any) {
      // Se a API retornar erro (ex: 401 Credenciais Inválidas)
      console.error(err);
      setError(err.response?.data?.message || 'E-mail ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // 3. A parte Visual (Interface)
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">🔐 Entrar no Sistema</h2>

              {/* Se a variável error estiver preenchida, mostra este alerta vermelho */}
              {error && <Alert variant="danger">{error}</Alert>}

              {/* Formulário atrelado à nossa função handleSubmit */}
              <Form onSubmit={handleSubmit}>
                
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Endereço de E-mail</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Digite seu e-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Sua senha secreta" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg" disabled={loading}>
                    {loading ? 'Entrando...' : 'Fazer Login'}
                  </Button>
                </div>

              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}