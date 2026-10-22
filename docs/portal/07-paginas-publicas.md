# 07 · Criar Home, login e cadastro

[← Anterior](06-rotas-protegidas.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](08-paineis.md)

**Etapa 7 de 11.** Conclua o [capítulo 6](06-rotas-protegidas.md) antes de continuar.

**Objetivo:** Implementar as telas públicas, os formulários controlados e o modal de cadastro.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Os imports ficam completos no capítulo 9. Nesta etapa, confira os arquivos; a execução integrada será feita no capítulo 10.

Crie `Home`, `Login` e `Unauthorized` nos caminhos abaixo, com exports nomeados. A Home mostra os atalhos e o estado da sessão. A página Unauthorized é pública e permite retornar à área correspondente ou trocar de conta.

**Arquivo: `src/pages/Home/index.tsx`**

<!-- source: src/pages/Home/index.tsx -->
```tsx
// src/pages/Home/index.tsx
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Home() {
  const { user, logout } = useAuth();

  return (
    <Container className="py-5">
      {/* Banner de Boas-Vindas */}
      <Row className="justify-content-center mb-4">
        <Col md={10}>
          <div className="p-5 bg-dark text-white rounded shadow-sm text-center">
            <h1 className="display-5 fw-bold mb-3">🎓 Portal Acadêmico</h1>
            <p className="lead text-secondary mb-4">
              Sistema com Controle de Acesso por Papéis (RBAC) integrado entre React e API Express.
            </p>

            {user ? (
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span>
                  Logado como: <strong>{user.name || user.email}</strong>
                </span>
                <Badge bg={user.role === 'professor' ? 'warning' : 'info'} text={user.role === 'professor' ? 'dark' : 'white'} className="fs-6">
                  {user.role?.toUpperCase()}
                </Badge>
                <Button variant="outline-danger" size="sm" onClick={logout}>
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-success btn-lg px-4">
                🔐 Fazer Login / Cadastrar
              </Link>
            )}
          </div>
        </Col>
      </Row>

      {/* Cartões de Acesso Rápido e Teste de Proteção */}
      <Row className="justify-content-center g-4">
        {/* Painel do Aluno */}
        <Col md={5}>
          <Card className="h-100 shadow-sm border-0 border-top border-4 border-info">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h4 text-info mb-0">🧑‍🎓 Área do Aluno</h3>
                  <Badge bg="info">Rota: /aluno</Badge>
                </div>
                <p className="text-muted">
                  Acesso exclusivo para contas com papel <strong>Aluno</strong>. Contém disciplinas matriculadas, notas e frequência.
                </p>
                <p className="small text-danger">
                  ⚠️ Professores são bloqueados e redirecionados para <code>/unauthorized</code>.
                </p>
              </div>
              <div className="d-grid mt-3">
                <Link to="/aluno" className="btn btn-outline-info">
                  Acessar Painel do Aluno →
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Painel do Professor */}
        <Col md={5}>
          <Card className="h-100 shadow-sm border-0 border-top border-4 border-warning">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h4 text-warning mb-0">👨‍🏫 Área do Professor</h3>
                  <Badge bg="warning" text="dark">Rota: /professor</Badge>
                </div>
                <p className="text-muted">
                  Acesso restrito para contas com papel <strong>Professor</strong>. Contém gestão de turmas e lançamento de notas.
                </p>
                <p className="small text-danger">
                  ⚠️ Alunos são bloqueados e redirecionados para <code>/unauthorized</code>.
                </p>
              </div>
              <div className="d-grid mt-3">
                <Link to="/professor" className="btn btn-outline-warning">
                  Acessar Painel do Professor →
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
```
<!-- endsource -->

**Arquivo: `src/pages/Login/index.tsx`**

<!-- source: src/pages/Login/index.tsx -->
```tsx
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
  const [regUserTypeId, setRegUserTypeId] = useState<number>(2); // 2 = Aluno (padrão), 3 = Professor
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Função para abrir o modal limpando estados anteriores
  const handleOpenRegister = () => {
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegUserTypeId(2);
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
      userTypeId: Number(regUserTypeId),
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
                value={regUserTypeId}
                onChange={(e) => setRegUserTypeId(Number(e.target.value))}
                disabled={regLoading || !!regSuccess}
              >
                <option value={2}>Aluno</option>
                <option value={3}>Professor</option>
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
```
<!-- endsource -->

No login, `useState` controla e-mail, senha, erros e envio; `onSubmit` impede o reload e aguarda `login`. Tanto o submit quanto o efeito que observa `user` podem solicitar navegação. `professor` vai para `/professor`, `aluno` para `/aluno` e outros perfis vão para `/` no submit. Uma conta admin não tem painel próprio nem acesso automático aos dois painéis.

O modal envia `POST /users` com nome opcional, e-mail sem espaços nas extremidades, senha e `userTypeId` numérico (`2` aluno, `3` professor). Não consulta catálogo de perfis na API. O HTML exige senha de oito caracteres; o backend ainda valida limites e duplicidade. Cadastro bem-sucedido exibe confirmação, preenche o e-mail do login e agenda fechamento em 1,5 segundo; não autentica automaticamente.

**Controle de estado no modal:** o bloco `finally` de `handleRegisterSubmit` (assim como `handleOpenRegister`) chama `setRegLoading(false)`, liberando os campos e os botões após o envio para permitir corrigir dados em caso de erro (como e-mail duplicado) ou realizar um novo cadastro. Após alterar exemplos de código, sincronize os blocos conforme o [guia de manutenção](../MANUTENCAO.md).

**Arquivo: `src/pages/Unauthorized/index.tsx`**

<!-- source: src/pages/Unauthorized/index.tsx -->
```tsx
// src/pages/Unauthorized/index.tsx
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAluno = user?.role?.toLowerCase() === 'aluno';
  const isProfessor = user?.role?.toLowerCase() === 'professor';

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-lg border-danger">
            <Card.Header className="bg-danger text-white py-3">
              <h3 className="mb-0">⛔ 403 - Acesso Negado</h3>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-3 fs-1">🛡️</div>
              <Card.Title className="text-danger fs-4 mb-3">
                Você não possui permissão para acessar esta página!
              </Card.Title>

              {user ? (
                <div className="alert alert-light border mb-4">
                  <p className="mb-1">
                    Você está autenticado como <strong>{user.name || user.email}</strong>.
                  </p>
                  <p className="mb-0">
                    Seu perfil atual é: <Badge bg="primary">{user.role?.toUpperCase()}</Badge>
                  </p>
                </div>
              ) : (
                <p className="text-muted">Você precisa estar logado para acessar recursos protegidos.</p>
              )}

              <p className="text-muted mb-4">
                Nosso sistema utiliza <strong>Controle de Acesso por Papel (RBAC)</strong>: 
                Alunos não podem visualizar a área restrita dos professores, e Professores não possuem acesso ao painel individual de alunos.
              </p>

              <div className="d-grid gap-2">
                {isAluno && (
                  <Link to="/aluno" className="btn btn-primary btn-lg">
                    Ir para Minha Área (Aluno)
                  </Link>
                )}

                {isProfessor && (
                  <Link to="/professor" className="btn btn-warning btn-lg">
                    Ir para Minha Área (Professor)
                  </Link>
                )}

                <Link to="/" className="btn btn-outline-secondary">
                  Ir para a Página Inicial
                </Link>

                <Button variant="outline-danger" size="sm" onClick={handleLogout} className="mt-2">
                  Trocar de Conta (Logout)
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
```
<!-- endsource -->

## Conferência antes de avançar

- [ ] Home, Login e Unauthorized têm exports nomeados.
- [ ] Você leu a limitação de loading do cadastro antes de testá-lo.

[← Anterior](06-rotas-protegidas.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](08-paineis.md)
