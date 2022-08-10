import "./bootstrap.min.css";
import "./layout.css";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/esm/Container";
import Nav from "react-bootstrap/Nav";
import { Outlet, Link, useNavigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import NavDropdown from "react-bootstrap/NavDropdown";

export default function Layout() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const handleSelect = (eventKey) => {
    if (eventKey == "logout") {
      console.log("logout clicked");
      setAuth({
        user: "",
        pwd: "",
        accessToken: "",
        refreshToken: "",
      });
      navigate("/login");
    } else if (eventKey == "measures") {
      navigate("/measures");
    } else if (eventKey == "visualize") {
      navigate("/visualize");
    } else if (eventKey == "users") {
      navigate("/users");
    } else if (eventKey == "register") {
      navigate("/register");
    } else if (eventKey == "login") {
      navigate("/login");
    }
  };

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Fulcrum Forecast</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" onSelect={handleSelect} activeKey={null}>
              <Nav.Link eventKey="measures">Measures</Nav.Link>
              <Nav.Link eventKey="visualize">Visualize</Nav.Link>
              <Nav.Link eventKey="users">Users</Nav.Link>
            </Nav>
            <Nav onSelect={handleSelect} activeKey={null}>
              <NavDropdown
                title={auth?.user ? auth.user : "Anon User"}
                id="nav-dropdown"
                variant="secondary"
              >
                <NavDropdown.Item eventKey="login">Login</NavDropdown.Item>
                <NavDropdown.Item eventKey="logout">Logout</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item eventKey="register">
                  Register
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </div>
  );
}
