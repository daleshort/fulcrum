import "./bootstrap.min.css";
import "./AppView.css";
import React, { useReducer } from "react";
import MeasureManager from "./MeasureManager";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/esm/Container";
import Nav from "react-bootstrap/Nav";
import Visualize from "./Visualize";

export default function AppView() {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      page: "visualize",
    }
  );

  function renderContents() {
    if (state.page == "measure manager") {
      return <MeasureManager />;
    } else if (state.page == "visualize"){
        return <Visualize/>
    }
  }

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Fulcrum Forecast</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                onClick={() => {
                  setState({ page: "measure manager" });
                }}
              >
                Measures
              </Nav.Link>
              <Nav.Link
                onClick={() => {
                  setState({ page: "visualize" });
                }}
              >
                Visualize
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {renderContents()}
    </div>
  );
}
