import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <Container className="mt-5">
      <Row className="d-flex justify-content-center align-items-center">
        <Col className="d-flex justify-content-around align-items-center bg-dark text-white p-4 rounded shadow-sm">
          <h1 className="h3 mb-0">Página da Home</h1>
          <Link to="/login" className="btn btn-outline-light btn-sm">
            Ir para Login
          </Link>
        </Col>
      </Row>
    </Container>
  );
}
