import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";

import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Modal from "react-bootstrap/Modal";
import Measures from "./Measures";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import SplitButton from "react-bootstrap/SplitButton";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { PencilFill, Calculator} from 'react-bootstrap-icons';
import OffcanvasHeader from 'react-bootstrap/OffcanvasHeader'

export default function MeasureManager() {
  function refreshProjectList() {
    //update project list
    axios
      .get("http://127.0.0.1:8000/project/projects/")
      .then((response) => {
        console.log(response.data);
        setState({
          projects: response.data,
          isLoadingProjectList: false,
          activeProject: "new",
        });
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
    if (state.projectDetail !== null) {
      return (
        <div>
          <Form onSubmit={handleProjectFormSubmit}>
            <FloatingLabel
              controlId="floatingInput"
              label="Project Title"
              className="mb-3"
              placeholder="Project Title"
            >
              <Form.Control
                name="title"
                onChange={handleProjectFormChange}
                onSelect={handleProjectFormChange}
                placeholder="Project Title"
                value={
                  state.projectDetail.title ? state.projectDetail.title : null
                }
              />
            </FloatingLabel>

            <Button type="submit">Submit</Button>{" "}
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
          activeProject: "new", //not sure if this needs to be tweaked later
          projectDetail: null,
        });
        setShowProjectModal(false);
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

    );
  }

  const [showOffCanvas, setShowOffCanvas] = useState(false);

  const handleCloseOffCanvas = () => setShowOffCanvas(false);
  const handleShowOffCanvas = () => setShowOffCanvas(true);

  function getMeasureTitle(){
    //state.projectDetail?state.projectDetail.title:"start a new project"
    if(state.projectDetail){
      if(state.projectDetail.title == ""){
        return "Click Me To Start A New Project!"
      }else
        return state.projectDetail.title
    }
  }
  return (
    <div>
      <Offcanvas
        show={showOffCanvas}
        onHide={handleCloseOffCanvas}
        key={1}
        placement={"end"}
      >
         <Offcanvas.Header closeButton>
         <Offcanvas.Title>Edit Projects</Offcanvas.Title>
         </Offcanvas.Header> <Offcanvas.Body>
        {renderProjectList()}
        <br/>
        {renderProjectForm()}
        </Offcanvas.Body>
      </Offcanvas>
      <div className="flex-container">
        <div className="flex-title">
          <div className="title-bar">
            <div>
          
          </div>
          <div>
          <Calculator  color="white" size={20}/>
            <Button
              // as={ButtonGroup}
              key={`dropdown-button-drop-start`}
              id={`dropdown-button-drop-start`}
              drop={"start"}
              title={`Project Title`}
              variant="primary"
              onClick={handleShowOffCanvas}
              size="lg"
            >
              {getMeasureTitle()}

            </Button>
            </div>
            <div className="pencil-icon" onClick={handleShowOffCanvas}>
            <PencilFill  color="white" size={20}/>
            </div>
          </div>
        </div>
        <div className="flex-item">
          <Measures activeProjectProp={state.activeProject} />
        </div>
      </div>
    </div>
  );
}
