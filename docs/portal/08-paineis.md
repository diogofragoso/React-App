# 08 · Criar os painéis de aluno e professor

[← Anterior](07-paginas-publicas.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](09-compor-aplicacao.md)

**Etapa 8 de 11.** Conclua o [capítulo 7](07-paginas-publicas.md) antes de continuar.

**Objetivo:** Construir as áreas por perfil e conectar a saída à sessão compartilhada.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Os imports ficam completos no capítulo 9. Nesta etapa, confira os arquivos; a execução integrada será feita no capítulo 10.

Crie as duas páginas. Elas leem `user` do Context e executam `logout` antes de navegar para `/login`. Os nomes e e-mails são dados da sessão; disciplinas, notas, frequência e turmas são conteúdo estático do JSX. Os botões de gestão do professor não implementam operações HTTP. Não há CRUD de clientes nessas páginas.

**Arquivo: `src/pages/Aluno/index.tsx`**

<!-- source: src/pages/Aluno/index.tsx -->
```tsx
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
```
<!-- endsource -->

**Arquivo: `src/pages/Professor/index.tsx`**

<!-- source: src/pages/Professor/index.tsx -->
```tsx
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
```
<!-- endsource -->

## Conferência antes de avançar

- [ ] As duas páginas usam o mesmo useAuth.
- [ ] Você identificou quais dados acadêmicos são estáticos.

[← Anterior](07-paginas-publicas.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](09-compor-aplicacao.md)
