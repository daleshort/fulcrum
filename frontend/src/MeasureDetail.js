import React, {
  useReducer,
  useEffect,
  useState,
  forwardRef,
  useRef,
} from "react";
import axios from "axios";
import "./bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Modal from "react-bootstrap/Modal";
import { useImmerReducer } from "use-immer";
import { cloneDeep } from "lodash";
import InputGroup from "react-bootstrap/InputGroup";
import Accordion from "react-bootstrap/Accordion";
import ProjectList from "./ProjectList";
import MeasureList from "./MeasureList";

export default function MeasureDetail({
  measure,
  activeProjectProp,
  refreshMeasureList,
}) {
  const [state, setState] = useImmerReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      measure: null,
      isLoading: false,
      parameters_need_intializing: false,
      selected_project_to_insert: null,
      selected_measure_to_insert: null,
      relation_modal_target: null,
    }
  );

  useEffect(() => {
    setState({ measure: measure });
  }, [measure]);

  const handleFormChange = (event) => {
    let copy_measure_parameters = cloneDeep(state.measure.parameters);
    let copy_measure = { ...state.measure };
    let is_parameter_flag = false;

    if (copy_measure_parameters) {
      copy_measure_parameters = copy_measure_parameters.map(
        (element, index) => {
          if (element.id == event.target.name) {
            element[getNotNullParameterValue(element)] = event.target.value;
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

    if (event.target.name == "type" && state.measure.id == "new") {
      setState({ measure: copy_measure, parameters_need_intializing: true });
      handleClickToggle("0");
    } else {
      setState({ measure: copy_measure });
    }
  };

  //generates a seemingly pointless put request to force a newly added measure
  //signal to be generated and processed on the backend.
  function forceRefreshOfMeasureBackend(measure_id, project_id) {
    axios
      .patch(
        "http://127.0.0.1:8000/project/projects/" +
          project_id +
          "/measures/" +
          measure_id +
          "/",
        {}
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
        alert("issue updating measure details");
      });
  }

  const handleFormSubmit = (event) => {
    setState({ isLoading: true });
    event.preventDefault();

    if (state.measure.id == "new") {
      let copy_measure = { ...state.measure };
      delete copy_measure.id;
      console.log("post request", copy_measure);
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
          forceRefreshOfMeasureBackend(
            response.data.id,
            activeProjectProp.toString()
          );
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
            measure.id + //not sure if this should be state.measure
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
    if (state.parameters_need_intializing == true) {
      let copy_measure_parameters = [];
      let copy_measure = { ...state.measure };

      switch (state.measure.type) {
        case "fixed_value_at_date":
          copy_measure_parameters.push({
            id: 1, //ids are required for form input management but this will be blown away by the database on submit
            parameter_float: 0,
            parameter_title: "Value",
          });
          copy_measure_parameters.push({
            id: 2,
            parameter_date: "0000-00-00",
            parameter_title: "Date",
          });
          break;
        case "fixed_value":
          copy_measure_parameters.push({
            id: 1, //ids are required for form input management but this will be blown away by the database on submit
            parameter_float: 0,
            parameter_title: "Value",
          });
          break;
        case "repeated":
          copy_measure_parameters.push({
            id: 1, //ids are required for form input management but this will be blown away by the database on submit
            parameter_float: 0,
            parameter_title: "Value",
          });
          copy_measure_parameters.push({
            id: 2,
            parameter_char: "daily",
            parameter_title: "Repeat Frequency",
          });
          copy_measure_parameters.push({
            id: 3,
            parameter_date: "0000-00-00",
            parameter_title: "Start Date",
          });
          copy_measure_parameters.push({
            id: 4,
            parameter_date: "0000-00-00",
            parameter_title: "End Date",
          });
          break;
        case "related_expression":
          copy_measure_parameters.push({
            id: 1,
            parameter_char: "",
            parameter_title: "Expression",
          });
        default:
          break;
      }
      copy_measure.parameters = copy_measure_parameters;
      setState({ measure: copy_measure, parameters_need_intializing: false });
    }
  }, [state.parameters_need_intializing]);

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

  function getNotNullParameterValue(parameter) {
    const { id, measure_id, parameter_title, ...parameterValues } = parameter;
    for (var key in parameterValues) {
      if (parameterValues.hasOwnProperty(key)) {
        if (parameterValues[key] != null) {
          return key;
        }
      }
    }
  }

  const handleSelectedProjectToInsert = (project_id) => {
    setState({ selected_project_to_insert: project_id });
    console.log("project to insert", project_id);
  };

  const handleSelectedMeasureToInsert = (measure_id) => {
    setState({ selected_measure_to_insert: measure_id });
    console.log("measure to insert", measure_id);
  };

  const [showRelationModal, setShowRelationModal] = useState(false);
  const handleRelationModalClose = () => {
    setShowRelationModal(false);
    setState({
      selected_project_to_insert: null,
      selected_measure_to_insert: null,
    });
  };
  const handleRelationModalShow = () => setShowRelationModal(true);
  useEffect(handleRelationModalClose, []);

  const handleRelationModalInsert = () => {
    setShowRelationModal(false);
    let copy_measure_parameters = cloneDeep(state.measure.parameters);
    let copy_measure = { ...state.measure };
    console.log("target is", state.relation_modal_target);
    let parameter_to_modify = copy_measure_parameters.find((value) => {
      return value.parameter_title.toLowerCase().includes("expression");
    });

    parameter_to_modify.parameter_char =
      parameter_to_modify.parameter_char.concat(
        "{p" +
          state.selected_project_to_insert +
          "m" +
          state.selected_measure_to_insert +
          "}"
      );

    copy_measure.parameters = copy_measure_parameters;
    setState({
      measure: copy_measure,
      selected_measure_to_insert: null,
      selected_project_to_insert: null,
    });
  };

  function renderRelationModal() {
    return (
      <div>
        <Button onClick={handleRelationModalShow}>
          Pick Related Parameter
        </Button>
        <Modal show={showRelationModal} onHide={handleRelationModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Select Related Parameter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col>
                  Project
                  <ProjectList
                    returnSelectedProject={handleSelectedProjectToInsert}
                  />
                </Col>
                <Col>
                  Measure
                  <MeasureList
                    returnSelectedMeasure={handleSelectedMeasureToInsert}
                    project_id={state.selected_project_to_insert}
                  />
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleRelationModalClose}>
              Cancel
            </Button>
            <Button onClick={handleRelationModalInsert}>Insert</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  function renderRepeatSelect(parameter) {
    return (
      <FloatingLabel
        controlId="floatingInput"
        label={parameter.parameter_title}
        className="mb-3"
        key={parameter.id}
      >
        <Form.Select
          name={parameter.id}
          onChange={handleFormChange}
          onSelect={handleFormChange}
          value={parameter[getNotNullParameterValue(parameter)]}
        >
          <option value={"daily"}>Daily</option>
          <option value={"weekly"}>Weekly</option>
          <option value={"monthly"}>monthly</option>
        </Form.Select>
      </FloatingLabel>
    );
  }

  function renderParmeterFormInput(parameter) {
    return (
      <FloatingLabel
        controlId="floatingInput"
        label={parameter.parameter_title}
        className="mb-3"
        key={parameter.id}
      >
        <Form.Control
          name={parameter.id}
          onChange={handleFormChange}
          onSelect={handleFormChange}
          value={parameter[getNotNullParameterValue(parameter)]}
          type={
            parameter.parameter_title.toLowerCase().includes("date")
              ? "date"
              : ""
          }
        />
      </FloatingLabel>
    );
  }

  function renderParameters() {
    if (state.measure) {
      if (typeof state.measure.parameters !== "undefined") {
        if (state.measure.type == "fixed_value_at_date") {
          return state.measure.parameters.map((x, i) => {
            return renderParmeterFormInput(x);
          });
        } else if (state.measure.type == "fixed_value") {
          return state.measure.parameters.map((x, i) => {
            return renderParmeterFormInput(x);
          });
        } else if (state.measure.type == "repeated") {
          let repeat_frequency_param_index = state.measure.parameters.findIndex(
            (value, index) => {
              return value.parameter_title.toLowerCase().includes("repeat");
            }
          );
          if (repeat_frequency_param_index > -1) {
            let repeat_frequency_param =
              state.measure.parameters[repeat_frequency_param_index];

            let other_params = state.measure.parameters.concat();
            other_params.splice(repeat_frequency_param_index, 1);

            let repeat_elements = [renderRepeatSelect(repeat_frequency_param)];
            let other_params_elements = other_params.map((x, i) => {
              return renderParmeterFormInput(x);
            });
            return repeat_elements.concat(other_params_elements);
          }
        } else if (state.measure.type == "related_expression") {

          return state.measure.parameters.map((x, i) => {
            return [renderParmeterFormInput(x)].concat([renderRelationModal()]);
          });
        }
      }
    }
  }

  function renderFormSelectType() {
    if (state.measure) {
      if (state.measure.id == "new") {
        return (
          <div>
            <Form.Select
              name="type"
              onChange={handleFormChange}
              onSelect={handleFormChange}
              value={state.measure ? state.measure.type : "Select Type2"}
            >
              <option>Select Type</option>
              <option value={"fixed_value"}>Fixed value</option>
              <option value={"fixed_value_at_date"}>
                Fixed value at a date
              </option>
              <option value={"repeated"}>Repeated Measure</option>
              <option value={"related_expression"}>Related Expression</option>
            </Form.Select>
            <br />
          </div>
        );
      } else {
        return (
          <FloatingLabel
            controlId="floatingInput"
            label="Type"
            className="mb-3"
          >
            <Form.Control
              disabled
              value={state.measure ? state.measure.type : "Select Type2"}
            />
          </FloatingLabel>
        );
      }
    }
  }

  //https://stackoverflow.com/questions/71254371/react-bootstrap-scroll-down-to-content-after-accordion-is-opened
  const [activeEventKey, setActiveEventKey] = useState("");
  const accordElem = useRef(null);

  const handleClickToggle = (eventKey) => {
    if (eventKey === activeEventKey) {
      setActiveEventKey("");
    } else {
      setActiveEventKey(eventKey);
      //Handle Scroll here when opening
      setTimeout(() => {
        accordElem.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 400);
    }
  };

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

        <div>{renderFormSelectType()}</div>

        <Accordion defaultActiveKey="0">
          <Accordion.Item
            eventKey="0"
            ref={accordElem}
            onClick={() => {
              handleClickToggle("0");
            }}
          >
            <Accordion.Header>Parameters</Accordion.Header>
            <Accordion.Body>
              <div>{renderParameters()}</div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <br />
        <Button type="submit">Submit</Button>
        {renderDeleteButton()}
      </Form>
      {renderDeleteModal()}
    </div>
  );
}
