import "./bootstrap.min.css";
import "./layout.css";
import React, { useReducer } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/esm/Container";
import Nav from "react-bootstrap/Nav";
import { Outlet, Link} from "react-router-dom";

export default function Layout() {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      page: "home",
    }
  );

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Fulcrum Forecast</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link}
              to='/login'
              >
                Login
              </Nav.Link>
              <Nav.Link as={Link}
              to='/register'
              >
                Register
              </Nav.Link>
              <Nav.Link as={Link}
                to='/measures'
              >
                Measures
              </Nav.Link>
              <Nav.Link as={Link}
                to='/visualize'
              >
                Visualize
              </Nav.Link>
              <Nav.Link as={Link}
                to='/users'
              >
                Users
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet/>
    </div>
  );
}
