import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";

import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";

import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Modal from "react-bootstrap/Modal";
import MeasureVisuals from "./MeasureVisuals";
import Offcanvas from "react-bootstrap/Offcanvas";
import { PencilFill, FileBarGraph } from "react-bootstrap-icons";

export default function Visualize() {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      visuals: null,
      isLoadingVisualList: false,
      isLoadingVisualDetail: false,
      activeVisual: "new",
      visualDetail: null,
    }
  );

  useEffect(() => {
    if (state.activeVisual !== null) {
      if (state.activeVisual == "new") {
        setState({
          visualDetail: {
            id: "new",
            title: "",
            type: "line",
            measurevisuals: Array(),
          },
        });
      } else {
        setState({ isLoadingVisualDetail: true });
        axios
          .get(
            "http://127.0.0.1:8000/project/visuals/" +
              state.activeVisual.toString()
          )
          .then((response) => {
            //   console.log(response.data);
            setState({
              visualDetail: response.data,
              isLoadingVisualDetail: false,
            });
          })
          .catch((err) => {
            console.log(err);
            alert("issue loading");
            setState({ isLoadingVisualDetail: false });
          });
      }
    }
  }, [state.activeVisual]);

  useEffect(() => {
    refreshVisualList();
  }, []);

  function refreshVisualList() {
    axios
      .get("http://127.0.0.1:8000/project/visuals/")
      .then((response) => {
        console.log(response.data);
        setState({
          visuals: response.data,
          isLoadingVisualList: false,
          activeVisual: "new",
        });
      })
      .catch((err) => {
        console.log(err);
        alert("issue loading visual list");
        setState({ isLoadingVisualList: false });
      });
  }

  function setCurrentVisual(visual_id) {
    setState({ activeVisual: visual_id });
  }

  const handleVisualFormSubmit = (event) => {
    event.preventDefault();
    setState({ isLoadingVisualDetail: true });
    if (state.activeVisual == "new") {
      //create new project
      let copy_visualDetail = { ...state.visualDetail };
      delete copy_visualDetail.id;
      axios
        .post("http://127.0.0.1:8000/project/visuals/", copy_visualDetail)
        .then((response) => {
          console.log(response.data);
          setState({
            isLoadingVisualDetail: false,
            isLoadingVisualList: true,
          });
          refreshVisualList();
        })
        .catch((err) => {
          console.log(err);
          alert("issue updating visual details");
          setState({ isLoadingVisualDetail: false });
        });
    }
    //update existing project
    else {
      let copy_visualDetail = { ...state.visualDetail };
      delete copy_visualDetail.measurevisuals;
      //need to not write measureVisuals at this level
      axios
        .patch(
          "http://127.0.0.1:8000/project/visuals/" +
            state.activeVisual.toString() +
            "/",
          copy_visualDetail
        )
        .then((response) => {
          console.log(response.data);
          setState({
            isLoadingVisualDetail: false,
            isLoadingVisualList: true,
          });
          refreshVisualList();
        })
        .catch((err) => {
          console.log(err);
          alert("issue updating visual details");
          setState({ isLoadingProjectDetail: false });
        });
    }
  };

  const handleVisualFormChange = (event) => {
    console.log(event);
    let copy_visualDetail = state.visualDetail;
    copy_visualDetail[event.target.name.toString()] = event.target.value;

    setState({ visualDetail: copy_visualDetail });
  };

  const [showVisualModal, setShowVisualModal] = useState(false);

  const handleVisualModalClose = () => setShowVisualModal(false);
  const handleVisualModalShow = () => setShowVisualModal(true);
  const handleVisualModalDelete = () => {
    setState({ isLoadingVisualDetail: true });
    axios
      .delete(
        "http://127.0.0.1:8000/project/visuals/" +
          state.activeVisual.toString() +
          "/",
        state.visualDetail
      )
      .then((response) => {
        console.log(response.data);
        setState({
          isLoadingVisualDetail: false,
          isLoadingVisualList: true,
          activeVisual: "new", //not sure if this needs to be tweaked later
          visualDetail: null,
        });
        setShowVisualModal(false);
        //update project list
        axios
          .get("http://127.0.0.1:8000/project/visuals/")
          .then((response) => {
            console.log(response.data);
            setState({ visuals: response.data, isLoadingVisualList: false });
          })
          .catch((err) => {
            console.log(err);
            alert("issue loading visual list");
            setState({ isLoadingVisualList: false });
          });
      })
      .catch((err) => {
        console.log(err);
        alert("issue updating visual details");
        setState({ isLoadingVisualDetail: false });
      });
  };

  function renderDeleteModal() {
    return (
      <Modal show={showVisualModal} onHide={handleVisualModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Visual</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {"Are you sure you want to delete visual " +
            state.visualDetail.title +
            "?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleVisualModalClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleVisualModalDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function renderVisualForm() {
    if (state.visualDetail !== null) {
      return (
        <div>
          <Form onSubmit={handleVisualFormSubmit}>
            <FloatingLabel
              controlId="floatingInput"
              label="Title"
              className="mb-3"
            >
              <Form.Control
                name="title"
                placeholder="Title"
                onChange={handleVisualFormChange}
                onSelect={handleVisualFormChange}
                value={state.visualDetail.title}
              />
            </FloatingLabel>
            <Form.Select
              name={"type"}
              onChange={handleVisualFormChange}
              onSelect={handleVisualFormChange}
              value={state.visualDetail.type}
            >
              <option value={"line"}>Line Chart</option>
              <option value={"bar"}>Bar Chart</option>
              <option value={"doughnut_sum"}>Doughnut Chart (Sum)</option>
              <option value={"doughnut_avg"}>Doughnut Chart (Average)</option>
            </Form.Select>
            <br />
            <Button type="submit">Update Visual</Button>
            <Button variant="danger" onClick={handleVisualModalShow}>
              Delete
            </Button>
          </Form>
          {renderDeleteModal()}
        </div>
      );
    }
  }

  function renderMeasureVisuals() {
    console.log(state.visualDetail);
    if (state.visualDetail != null) {
      return <MeasureVisuals visual_id={state.activeVisual} />;
    }
  }

  function renderVisualList() {
    return (

        <ListGroup>
          {state.visuals
            ? state.visuals.map((x, i) => {
                return (
                  <ListGroupItem
                    action
                    key={x.id}
                    active={state.activeVisual == x.id}
                    onClick={() => {
                      setCurrentVisual(x.id);
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
              setCurrentVisual("new");
            }}
          >
            *start a new visual*
          </ListGroupItem>
        </ListGroup>

    );
  }

  const [showOffCanvas, setShowOffCanvas] = useState(false);

  const handleCloseOffCanvas = () => setShowOffCanvas(false);
  const handleShowOffCanvas = () => setShowOffCanvas(true);

  function getVisualTitle(){
    if(state.visualDetail){
      if(state.visualDetail.title==''){
        return "Click Me To Add a Visual!"
      }else{
        return state.visualDetail.title
      }

    }
  }
  return (
    <div>
      <Offcanvas
        show={showOffCanvas}
        onHide={handleCloseOffCanvas}
        key={10}
        placement={"end"}
      >
        <Offcanvas.Header closeButton>Edit Visuals</Offcanvas.Header>
        <Offcanvas.Body>
          {renderVisualList()}
          <br />
          {renderVisualForm()}
        </Offcanvas.Body>
      </Offcanvas>
      <div className="flex-container">
        <div className="flex-title">
          <div className="title-bar">
            <div></div>
            <div>
              <FileBarGraph  color="white" size={20}/>
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
                {getVisualTitle()}
              </Button>
            </div>
            <div className="pencil-icon" onClick={handleShowOffCanvas}>
              <PencilFill color="white" size={20} />
            </div>
          </div>
        </div>
        <div className="flex-item">
        {renderMeasureVisuals()}
        </div>
        <div className="bottom-padding"/>
      </div>


    </div>
  );
}
