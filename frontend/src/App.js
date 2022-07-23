import "./App.css";
import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import "./bootstrap.min.css";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Modal from "react-bootstrap/Modal";
import Measures from "./Measures";

function App() {
  function refreshProjectList() {
    //update project list
    axios
      .get("http://127.0.0.1:8000/project/projects/")
      .then((response) => {
        console.log(response.data);
        setState({ projects: response.data, isLoadingProjectList: false });
      })
      .catch((err) => {
        console.log(err);
        alert("issue loading project list");
        setState({ isLoadingProjectList: false });
      });
  }

  const handleProjectFormSubmit = (event) => {
    event.preventDefault();
    setState({ isLoadingProjectDetail: true });
    if (state.activeProject == "new") {
      //create new project
      let copy_projectDetail = { ...state.projectDetail };
      delete copy_projectDetail.id;
      axios
        .post("http://127.0.0.1:8000/project/projects/", copy_projectDetail)
        .then((response) => {
          console.log(response.data);
          setState({
            isLoadingProjectDetail: false,
            isLoadingProjectList: true,
          });
          refreshProjectList();
        })
        .catch((err) => {
          console.log(err);
          alert("issue updating project details");
          setState({ isLoadingProjectDetail: false });
        });
    }
    //update existing project
    else {
      axios
        .put(
          "http://127.0.0.1:8000/project/projects/" +
            state.activeProject.toString() +
            "/",
          state.projectDetail
        )
        .then((response) => {
          console.log(response.data);
          setState({
            isLoadingProjectDetail: false,
            isLoadingProjectList: true,
          });
          refreshProjectList();
        })
        .catch((err) => {
          console.log(err);
          alert("issue updating project details");
          setState({ isLoadingProjectDetail: false });
        });
    }
  };

  //handles changes to project form state
  const handleProjectFormChange = (event) => {
    console.log(event);
    let copy_projectDetail = state.projectDetail;
    copy_projectDetail[event.target.name.toString()] = event.target.value;

    setState({ projectDetail: copy_projectDetail });
  };

  function renderProjectForm() {
    //this is breaking because form data isnt being set right?
    if (state.projectDetail !== null) {
      return (
        <div>
          <Form onSubmit={handleProjectFormSubmit}>
            <FloatingLabel
              controlId="floatingInput"
              label="Title"
              className="mb-3"
            >
              <Form.Control
                name="title"
                onChange={handleProjectFormChange}
                onSelect={handleProjectFormChange}
                value={state.projectDetail.title || ""}
              />
            </FloatingLabel>

            <Button type="submit">Submit</Button>
            <Button variant="danger" onClick={handleProjectModalShow}>
              Delete
            </Button>
          </Form>
          {renderDeleteModal()}
        </div>
      );
    }
  }

  const [showProjectModal, setShowProjectModal] = useState(false);

  const handleProjectModalClose = () => setShowProjectModal(false);
  const handleProjectModalShow = () => setShowProjectModal(true);
  const handleProjectModalDelete = () => {
    setState({ isLoadingProjectDetail: true });
    axios
      .delete(
        "http://127.0.0.1:8000/project/projects/" +
          state.activeProject.toString() +
          "/",
        state.projectDetail
      )
      .then((response) => {
        console.log(response.data);
        setState({
          isLoadingProjectDetail: false,
          isLoadingProjectList: true,
          activeProject: null,
          projectDetail: null,
        });
        //update project list
        axios
          .get("http://127.0.0.1:8000/project/projects/")
          .then((response) => {
            console.log(response.data);
            setState({ projects: response.data, isLoadingProjectList: false });
          })
          .catch((err) => {
            console.log(err);
            alert("issue loading project list");
            setState({ isLoadingProjectList: false });
          });
      })
      .catch((err) => {
        console.log(err);
        alert("issue updating project details");
        setState({ isLoadingProjectDetail: false });
      });
  };

  function renderDeleteModal() {
    return (
      <Modal show={showProjectModal} onHide={handleProjectModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {"Are you sure you want to delete project " +
            state.projectDetail.title +
            "?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleProjectModalClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleProjectModalDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  //general state management
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      projects: null,
      isLoadingProjectList: true,
      activeProject: null,
      isLoadingProjectDetail: false,
      projectDetail: null,
    }
  );

  //load projects list on page load
  useEffect(() => {
    refreshProjectList();
  }, []);

  useEffect(() => {
    if (state.activeProject !== null) {
      console.log("active project changed to:", state.activeProject);

      if (state.activeProject == "new") {
        console.log("new project");
        setState({
          projectDetail: { id: "new", title: "" },
        });
      } else {
        setState({ isLoadingProjectDetail: true });
        axios
          .get(
            "http://127.0.0.1:8000/project/projects/" +
              state.activeProject.toString()
          )
          .then((response) => {
            //   console.log(response.data);
            setState({
              projectDetail: response.data,
              isLoadingProjectDetail: false,
            });
          })
          .catch((err) => {
            console.log(err);
            alert("issue loading");
            setState({ isLoadingProjectDetail: false });
          });
      }
    }
  }, [state.activeProject]);

  function setCurrentProject(project_id) {
    setState({ activeProject: project_id });
  }

  function renderProjectList() {
    return (
      <Card style={{ width: "18rem" }}>
        <ListGroup>
          {state.projects
            ? state.projects.map((x, i) => {
                return (
                  <ListGroupItem
                    action
                    key={x.id}
                    active={state.activeProject == x.id}
                    onClick={() => {
                      setCurrentProject(x.id);
                    }}
                  >
                    {x.title}{" "}
                  </ListGroupItem>
                );
              })
            : null}
          <ListGroupItem
            action
            onClick={() => {
              setCurrentProject("new");
            }}
          >
            *start a new project*
          </ListGroupItem>
        </ListGroup>
      </Card>
    );
  }

  return (
    <div className="App">
      {renderProjectList()}
      {renderProjectForm()}

      <Measures activeProjectProp={state.activeProject} />
    </div>
  );
}

export default App;
