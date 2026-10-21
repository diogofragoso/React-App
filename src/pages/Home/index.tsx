import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export function Home() {
    return (
        
            <Row className=' d-flex justify-content-center container-fluid align-items-center'>
                <Col className=" d-flex justify-content-around bg-dark text-white">
                    <h1>Página da Home</h1>
                    <Link to="/login" className="btn btn-light btn-sm m-2">
                        Ir para Login
                    </Link>
                </Col>
            </Row>
        
    )
}

