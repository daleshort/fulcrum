import "./bootstrap.min.css";
import "./layout.css";
import React, { useReducer } from "react";
import MeasureManager from "./MeasureManager";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/esm/Container";
import Nav from "react-bootstrap/Nav";
import Visualize from "./Visualize";
import Home from "./Home";
import About from "./About";
import { Outlet } from "react-router-dom";

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
              <Nav.Link
              href='/login'
              >
                Login
              </Nav.Link>
              <Nav.Link
              href='/register'
              >
                Register
              </Nav.Link>
              <Nav.Link
                href='/measures'
              >
                Measures
              </Nav.Link>
              <Nav.Link
                href='/visualize'
              >
                Visualize
              </Nav.Link>
              <Nav.Link
                href='/users'
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
