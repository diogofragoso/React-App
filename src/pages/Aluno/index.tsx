// src/pages/Aluno/index.tsx
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Aluno() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container className="py-5">
      {/* Cabeçalho do Aluno */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center bg-dark text-white p-4 rounded shadow-sm">
            <div>
              <h2 className="mb-1">🎓 Painel do Aluno</h2>
              <p className="text-secondary mb-0">
                Bem-vindo(a), <strong>{user?.name || user?.email}</strong>!
              </p>
            </div>
            <div className="text-end">
              <Badge bg="info" className="p-2 me-2 fs-6">
                Perfil: {user?.role?.toUpperCase()}
              </Badge>
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alerta de Isolamento de Perfil */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info" className="shadow-sm">
            <strong>🔒 Controle de Acesso Ativo (RBAC):</strong> Você está autenticado como <strong>Aluno</strong>. 
            Sua conta tem acesso exclusivo a esta área. Se tentar acessar a rota dos professores (<code>/professor</code>), 
            a segurança do sistema bloqueará sua visualização automaticamente.
          </Alert>
        </Col>
      </Row>

      {/* Conteúdo Exclusivo do Aluno */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-primary">📚 Minhas Disciplinas</Card.Title>
              <Card.Text className="text-muted">
                Cursos ativos no semestre:
              </Card.Text>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Desenvolvimento Web com React
                  <Badge bg="success">Em andamento</Badge>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Back-end com Express e Prisma
                  <Badge bg="success">Em andamento</Badge>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Banco de Dados PostgreSQL
                  <Badge bg="secondary">Concluído</Badge>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-success">📊 Minhas Notas & Desempenho</Card.Title>
              <Card.Text className="text-muted">
                Visão geral das últimas avaliações:
              </Card.Text>
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>Projeto 1 (Express API):</span>
                  <strong>10.0</strong>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>Projeto 2 (React Frontend):</span>
                  <strong>9.5</strong>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>Frequência Geral:</span>
                  <strong className="text-success">98%</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-warning">🧪 Testar Proteção de Rota</Card.Title>
              <Card.Text className="text-muted">
                Experimente clicar abaixo para navegar para a tela do professor:
              </Card.Text>
              <div className="d-grid gap-2">
                <Link to="/professor" className="btn btn-outline-warning">
                  Tentar Acessar Área do Professor
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  Voltar para a Home
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

