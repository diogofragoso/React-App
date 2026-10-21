// src/pages/Professor/index.tsx
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Professor() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container className="py-5">
      {/* Cabeçalho do Professor */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center bg-dark text-white p-4 rounded shadow-sm">
            <div>
              <h2 className="mb-1">👨‍🏫 Painel do Professor</h2>
              <p className="text-secondary mb-0">
                Docente: <strong>{user?.name || user?.email}</strong>
              </p>
            </div>
            <div className="text-end">
              <Badge bg="warning" text="dark" className="p-2 me-2 fs-6">
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
          <Alert variant="warning" className="shadow-sm">
            <strong>🔒 Controle de Acesso Ativo (RBAC):</strong> Você está autenticado como <strong>Professor</strong>. 
            Esta área é restrita para gestão pedagógica e notas. Se você tentar acessar a área dos alunos (<code>/aluno</code>), 
            o guardião de rota impedirá sua entrada.
          </Alert>
        </Col>
      </Row>

      {/* Conteúdo Exclusivo do Professor */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-primary">📋 Minhas Turmas</Card.Title>
              <Card.Text className="text-muted">
                Turmas sob sua coordenação pedagógica:
              </Card.Text>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Turma de Desenvolvimento Fullstack
                  <Badge bg="primary" pill>32 alunos</Badge>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Turma de React Avançado
                  <Badge bg="primary" pill>28 alunos</Badge>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Turma de APIs REST
                  <Badge bg="secondary" pill>Encerrada</Badge>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-success">📝 Gestão de Aulas & Notas</Card.Title>
              <Card.Text className="text-muted">
                Ações rápidas de lançamento:
              </Card.Text>
              <div className="d-grid gap-2">
                <Button variant="outline-success" size="sm">
                  + Registrar Chamada de Hoje
                </Button>
                <Button variant="outline-primary" size="sm">
                  + Lançar Notas do Projeto Express
                </Button>
                <Button variant="outline-info" size="sm">
                  + Publicar Material de Apoio
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-warning">🧪 Testar Proteção de Rota</Card.Title>
              <Card.Text className="text-muted">
                Experimente clicar abaixo para navegar para a tela do aluno:
              </Card.Text>
              <div className="d-grid gap-2">
                <Link to="/aluno" className="btn btn-outline-warning">
                  Tentar Acessar Área do Aluno
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

