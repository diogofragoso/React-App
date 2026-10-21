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
