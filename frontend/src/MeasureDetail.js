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
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Modal from "react-bootstrap/Modal";
import { useImmerReducer } from "use-immer";
import { cloneDeep } from "lodash";
import InputGroup from "react-bootstrap/InputGroup";
import Accordion from "react-bootstrap/Accordion";
import ProjectList from "./ProjectList";
import MeasureList from "./MeasureList";
import DistributionModal from "./DistributionModal";

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
      project_title_to_insert: null,
      selected_measure_to_insert: null,
      measure_title_to_insert: null,
      relation_modal_target: null,
      offset_type: "lag",
      offset_days: null,
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
          break;
        case "distributed":
          copy_measure_parameters.push({
            id: 1, //ids are required for form input management but this will be blown away by the database on submit
            parameter_float: 0,
            parameter_title: "Value",
          });
          copy_measure_parameters.push({
            id: 2,
            parameter_char: "",
            parameter_title: "Distribution",
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

  const handleSelectedProjectToInsert = (project_id, project_title) => {
    setState({
      selected_project_to_insert: project_id,
      project_title_to_insert: project_title,
    });
    console.log("project to insert", project_id);
  };

  const handleSelectedMeasureToInsert = (measure_id, measure_title) => {
    setState({
      selected_measure_to_insert: measure_id,
      measure_title_to_insert: measure_title,
    });
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
    console.log("offset days:", state.offset_days);
    console.log("offset type:", state.offset_type);
    let parameter_to_modify = copy_measure_parameters.find((value) => {
      return value.parameter_title.toLowerCase().includes("expression");
    });

    let offset_string = "l+0";
    if (state.offset_days) {
      if (state.offset_type == "lead") {
        offset_string = "l+" + state.offset_days.toString();
      } else if (state.offset_type == "lag") {
        offset_string = "l-" + state.offset_days.toString();
      }
    }

    parameter_to_modify.parameter_char =
      parameter_to_modify.parameter_char.concat(
        "{p" +
          state.selected_project_to_insert +
          "m" +
          state.selected_measure_to_insert +
          offset_string +
          "}" +
          "[" +
          state.project_title_to_insert +
          ":" +
          state.measure_title_to_insert +
          "]"
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
            <br />
            <InputGroup className="mb-3">
              <Form.Select
                value={state.offset_type ? state.offset_type : null}
                onSelect={(event) => {
                  setState({ offset_type: event.target.value });
                }}
                onChange={(event) => {
                  setState({ offset_type: event.target.value });
                }}
              >
                <option value="lag">Lag By</option>
                <option value="lead">Lead By</option>
              </Form.Select>
              <Form.Control
                placeholder="Days"
                value={state.offset_days ? state.offset_days : null}
                onChange={(event) => {
                  setState({ offset_days: event.target.value });
                }}
              />
              <InputGroup.Text id="basic-addon2">Days</InputGroup.Text>
            </InputGroup>
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

  function getParameter(name_str) {
    console.log("parameters", state.measure.parameters);
    let param_index = state.measure.parameters.findIndex((value, index) => {
      return value.parameter_title
        .toLowerCase()
        .includes(name_str.toLowerCase());
    });

    if (param_index > -1) {
      return state.measure.parameters[param_index];
    } else {
      return null;
    }
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
          //find the location of the repeat frequency parameter
          let repeat_frequency_param_index = state.measure.parameters.findIndex(
            (value, index) => {
              return value.parameter_title.toLowerCase().includes("repeat");
            }
          );
          //if it is found
          if (repeat_frequency_param_index > -1) {
            //put the value aside
            let repeat_frequency_param =
              state.measure.parameters[repeat_frequency_param_index];
            //make a copy of the parameters and slice out the repeat frequency parameter
            let other_params = state.measure.parameters.concat();
            other_params.splice(repeat_frequency_param_index, 1);
            //Make a special dropdown menu for the repeat frequency
            let repeat_elements = [renderRepeatSelect(repeat_frequency_param)];
            //autogenerate the fields for the other parameters
            let other_params_elements = other_params.map((x, i) => {
              return renderParmeterFormInput(x);
            });
            return repeat_elements.concat(other_params_elements);
          }
        } else if (state.measure.type == "distributed") {
          return state.measure.parameters
            .map((x, i) => {
              return [renderParmeterFormInput(x)];
            })
            .concat([renderDistributionModal()]);
        } else if (state.measure.type == "related_expression") {
          //note the below expression only maps over one value
          return state.measure.parameters.map((x, i) => {
            return [renderParmeterFormInput(x)].concat([renderRelationModal()]);
          });
        }
      }
    }
  }

  function handleDistributionModalInsert(value) {
    console.log("distribution value", value.toString());
    let copy_measure_parameters = cloneDeep(state.measure.parameters);
    let copy_measure = { ...state.measure };
    console.log("target is", state.relation_modal_target);
    let parameter_to_modify = copy_measure_parameters.find((value) => {
      return value.parameter_title.toLowerCase().includes("distribution");
    });
    //maybe make this a json field one day but...meh...
    parameter_to_modify.parameter_char = value.toString();

    copy_measure.parameters = copy_measure_parameters;
    setState({
      measure: copy_measure,
    });
  }

  function renderDistributionModal() {
    let start_date = getParameter("start date").parameter_date;
    let end_date = getParameter("end date").parameter_date;

    let parameter_to_modify = state.measure.parameters.find((value) => {
      return value.parameter_title.toLowerCase().includes("distribution");
    });
    //maybe make this a json field one day but...meh...
    let distribution_state = parameter_to_modify.parameter_char;

    return (
      <DistributionModal
        start_date={start_date}
        end_date={end_date}
        distribution_state={distribution_state}
        insertCallBack={handleDistributionModalInsert}
      />
    );
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
              <option value={"distributed"}>Distributed Measure</option>
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
            placeholder="New Measure"
            onChange={handleFormChange}
            onSelect={handleFormChange}
            value={state.measure ? state.measure.title : null}
          />
        </FloatingLabel>
        <FloatingLabel controlId="floatingInput" label="Units" className="mb-3">
          <Form.Control
            name="units"
            placeholder="Units"
            onChange={handleFormChange}
            onSelect={handleFormChange}
            value={state.measure ? state.measure.units : null}
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
