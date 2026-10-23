// src/pages/Login/index.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card, Modal } from 'react-bootstrap';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { LoginCredentials, CreateUserInput } from '../../types';

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redireciona automaticamente se já estiver autenticado
  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      if (role === 'professor') {
        navigate('/professor');
      } else if (role === 'aluno') {
        navigate('/aluno');
      }
    }
  }, [user, navigate]);

  // 1. Estados da tela de login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2. Estados do modal de cadastro de usuário
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUserTypeCode, setRegUserTypeCode] = useState<CreateUserInput['userTypeCode']>('1');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Função para abrir o modal limpando estados anteriores
  const handleOpenRegister = () => {
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegUserTypeCode('1');
    setRegError(null);
    setRegSuccess(null);
    setRegLoading(false);
    setShowRegisterModal(true);
  };

  // Função para fechar o modal
  const handleCloseRegister = () => {
    if (!regLoading) {
      setShowRegisterModal(false);
    }
  };

  // 3. Submissão do formulário de login
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const credentials: LoginCredentials = { email, password };

    try {
      const loggedUser = await login(credentials);
      const role = loggedUser.role?.toLowerCase();

      // Redirecionamento baseado no perfil recebido do JWT/API
      if (role === 'professor') {
        navigate('/professor');
      } else if (role === 'aluno') {
        navigate('/aluno');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || 'E-mail ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Submissão do formulário de cadastro (Aluno ou Professor)
  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);
    setRegLoading(true);

    const payload: CreateUserInput = {
      name: regName.trim() || undefined,
      email: regEmail.trim(),
      password: regPassword,
      userTypeCode: regUserTypeCode,
    };

    try {
      await api.post('/users', payload);
      setRegSuccess('Conta criada com sucesso! Você já pode fazer login.');
      
      // Preenche o e-mail no formulário principal de login para conveniência do usuário
      setEmail(regEmail);

      // Fecha o modal após 1.5 segundos para o usuário ver a confirmação
      setTimeout(() => {
        setShowRegisterModal(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors?.length) {
        setRegError(err.response.data.errors.map((e: { message: string }) => e.message).join('; '));
      } else if (err.response?.data?.error) {
        setRegError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setRegError(err.response.data.message);
      } else {
        setRegError('Erro ao realizar cadastro. Verifique os dados e tente novamente.');
      }
    } finally {
      setRegLoading(false);
    }
  };

  // 5. Interface
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-sm bg-dark text-white rounded p-4">
            <Card.Body className="p-3">
              <h2 className="text-center mb-4">🔐 Entrar no Sistema</h2>

              {/* Alerta de erro de login */}
              {error && <Alert variant="danger">{error}</Alert>}

              {/* Formulário de Login */}
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

                <div className="d-grid gap-2">
                  <Button variant="success" type="submit" size="lg" disabled={loading}>
                    {loading ? 'Entrando...' : 'Fazer Login'}
                  </Button>
                  <Link to="/" className="btn btn-outline-secondary btn-sm">
                    Voltar para a Home
                  </Link>
                </div>
              </Form>

              <hr className="my-4 border-secondary" />

              {/* Botão para abrir o modal de cadastro */}
              <div className="text-center">
                <span className="text-secondary me-2">Não tem uma conta?</span>
                <Button 
                  variant="outline-info" 
                  size="sm" 
                  onClick={handleOpenRegister}
                >
                  Cadastre-se como Aluno ou Professor
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de Cadastro de Usuário (Aluno / Professor) */}
      <Modal 
        show={showRegisterModal} 
        onHide={handleCloseRegister} 
        centered
        backdrop="static"
      >
        <Form onSubmit={handleRegisterSubmit}>
          <Modal.Header closeButton={!regLoading}>
            <Modal.Title>📝 Cadastrar Nova Conta</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {regError && <Alert variant="danger">{regError}</Alert>}
            {regSuccess && <Alert variant="success">{regSuccess}</Alert>}

            <Form.Group className="mb-3" controlId="modalRegName">
              <Form.Label>Nome Completo (Opcional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Maria Silva"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                disabled={regLoading || !!regSuccess}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="modalRegEmail">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="seu.email@exemplo.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                disabled={regLoading || !!regSuccess}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="modalRegPassword">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                minLength={8}
                required
                disabled={regLoading || !!regSuccess}
              />
              <Form.Text className="text-muted">
                A senha deve ter no mínimo 8 caracteres.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="modalRegUserType">
              <Form.Label>Tipo de Perfil</Form.Label>
              <Form.Select
                value={regUserTypeCode}
                onChange={(e) => setRegUserTypeCode(e.target.value as CreateUserInput['userTypeCode'])}
                disabled={regLoading || !!regSuccess}
              >
                <option value="1">Aluno</option>
                <option value="2">Professor</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Alunos e Professores possuem áreas e permissões isoladas.
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={handleCloseRegister}
              disabled={regLoading}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={regLoading || !!regSuccess}
            >
              {regLoading ? 'Cadastrando...' : 'Confirmar Cadastro'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
