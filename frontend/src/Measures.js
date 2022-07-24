import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";
import "./bootstrap.min.css";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Modal from "react-bootstrap/Modal";
import { useImmerReducer } from "use-immer";
import { cloneDeep } from "lodash";

export default function Measures({ activeProjectProp = null }) {
  //general state management
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      activeProject: 2,
      projectMeasures: null,
      isLoadingMeasures: false,
    }
  );

  const loadMeasures = () => {
    console.log("load new measures");
    setState({ isLoadingMeasures: true });
    let path =
      "http://127.0.0.1:8000/project/projects/" +
      activeProjectProp +
      "/measures/";
    axios
      .get(path)
      .then((response) => {
        console.log(response.data);
        setState({
          projectMeasures: response.data,
          isLoadingMeasures: false,
        });
      })
      .catch((err) => {
        console.log(err);
        alert("issue loading");
        setState({ isLoadingMeasures: false });
      });
  };

  useEffect(() => {
    setState({ activeProject: activeProjectProp });
    //some delay in state.active project so use activeProjectProp directly
    if (activeProjectProp !== null) {
      loadMeasures();
    }
  }, [activeProjectProp]);

  function renderAccordion() {
    if (state.projectMeasures !== null) {
      if (state.projectMeasures !== []) {
        const new_measure = {
          id: "new",
          title: "New Measure",
          units: "test",
          parameters: [],
        };
        return (
          <Accordion>
            {state.projectMeasures.map((x, i) => {
              return (
                <Accordion.Item key={x.id} eventKey={x.id}>
                  <Accordion.Header> {x.title} </Accordion.Header>
                  <Accordion.Body>
                    <MeasureDetail
                      measure={x}
                      activeProjectProp={activeProjectProp}
                      refreshMeasureList={loadMeasures}
                    />
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
            <Accordion.Item key="new" eventKey="new">
              <Accordion.Header>*New Measure*</Accordion.Header>
              <Accordion.Body>
                <MeasureDetail
                  measure={new_measure}
                  activeProjectProp={activeProjectProp}
                  refreshMeasureList={loadMeasures}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        );
      }
    } else {
    }
    return;
  }

  return (
    <div>
      <div>Measures for project ID: {activeProjectProp} </div>
      <div>{renderAccordion()}</div>
    </div>
  );
}

function MeasureDetail({ measure, activeProjectProp, refreshMeasureList }) {
  const [state, setState] = useImmerReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      measure: null,
      isLoading: false,
    }
  );

  const handleFormChange = (event) => {
    let copy_measure_parameters = cloneDeep(state.measure.parameters);
    let copy_measure = { ...state.measure };
    let is_parameter_flag = false;
    if (copy_measure_parameters) {
      copy_measure_parameters = copy_measure_parameters.map(
        (element, index) => {
          if (element.id == event.target.name) {
            element.parameter = event.target.value;
            is_parameter_flag = true;
            return element;
          } else {
            return element;
          }
        }
      );
    }
    if (is_parameter_flag == false) {
      copy_measure[event.target.name.toString()] = event.target.value;
    }

    copy_measure.parameters = copy_measure_parameters;
    setState({ measure: copy_measure });
  };

  const handleFormSubmit = (event) => {
    setState({ isLoading: true });
    event.preventDefault();

    if (state.measure.id == "new") {
      let copy_measure = { ...state.measure };
      delete copy_measure.id;
      axios
        .post(
          "http://127.0.0.1:8000/project/projects/" +
            activeProjectProp.toString() +
            "/measures/",
          copy_measure
        )
        .then((response) => {
          console.log(response.data);
          setState({ isLoading: false });
          refreshMeasureList();
        })
        .catch((err) => {
          console.log(err);
          alert("issue updating measure details");
          setState({ isLoading: false });
        });
    } else {
      axios
        .put(
          "http://127.0.0.1:8000/project/projects/" +
            activeProjectProp.toString() +
            "/measures/" +
            measure.id +
            "/",
          state.measure
        )
        .then((response) => {
          console.log(response.data);
          setState({ isLoading: false });
          refreshMeasureList();
        })
        .catch((err) => {
          console.log(err);
          alert("issue updating measure details");
          setState({ isLoading: false });
        });
    }
  };

  useEffect(() => {
    setState({ measure: measure });
  }, [measure]);

  const [showModal, setShowModal] = useState(false);
  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);
  const handleModalDelete = () => {
    axios
      .delete(
        "http://127.0.0.1:8000/project/projects/" +
          activeProjectProp.toString() +
          "/measures/" +
          measure.id +
          "/"
      )
      .then((response) => {
        console.log(response.data);
        refreshMeasureList();
      })
      .catch((err) => {
        console.log(err);
        alert("issue updating project details");
        setState({ isLoadingProjectDetail: false });
      });
  };

  function renderDeleteButton() {
    if (state.measure) {
      console.log("state of measure id", state.measure.id);
      if (state.measure.id != "new") {
        return (
            <Button variant="danger" onClick={handleModalShow}>
            Delete
          </Button>
        );
      }
    }
  }
  function renderDeleteModal() {
    return (
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Measure</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {"Are you sure you want to delete measure: " + measure.title}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleModalDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function renderParameters() {
    if (state.measure) {
      if (state.measure.parameters) {
        return state.measure.parameters.map((x, i) => {
          return (
            <FloatingLabel
              controlId="floatingInput"
              label={x.parameter_title}
              className="mb-3"
            >
              <Form.Control
                name={x.id}
                onChange={handleFormChange}
                onSelect={handleFormChange}
                value={x.parameter ? x.parameter : ""}
              />
            </FloatingLabel>
          );
        });
      }
    }
  }
  return (
    <div>
      <Form onSubmit={handleFormSubmit}>
        <FloatingLabel controlId="floatingInput" label="Title" className="mb-3">
          <Form.Control
            name="title"
            onChange={handleFormChange}
            onSelect={handleFormChange}
            value={state.measure ? state.measure.title : ""}
          />
        </FloatingLabel>
        <FloatingLabel controlId="floatingInput" label="Units" className="mb-3">
          <Form.Control
            name="units"
            onChange={handleFormChange}
            onSelect={handleFormChange}
            value={state.measure ? state.measure.units : ""}
          />
        </FloatingLabel>
        {renderParameters()}
        <Button type="submit">Submit</Button>
        {renderDeleteButton()}
      </Form>
      {renderDeleteModal()}
    </div>
  );
}
