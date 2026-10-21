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

