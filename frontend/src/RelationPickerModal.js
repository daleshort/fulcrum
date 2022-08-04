import React, {
  useReducer,
  useEffect,
  useState,
  forwardRef,
  useRef,
} from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ProjectList from "./ProjectList";
import MeasureList from "./MeasureList";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function RelationPickerModal({insertCallBack}) {
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

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      selected_project_to_insert: null,
      project_title_to_insert: null,  
      selected_measure_to_insert: null,
      measure_title_to_insert: null, 
      relation_modal_target: null,
    }
  );

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

  const handleRelationModalInsert = () => {
    insertCallBack(state.selected_project_to_insert,state.project_title_to_insert, state.selected_measure_to_insert,state.measure_title_to_insert);
    setShowRelationModal(false);
  };
  return (
    
      <Button onClick={handleRelationModalShow}>Pick Related Parameter
      <Modal show={showRelationModal} onHide={handleRelationModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select Measure</Modal.Title>
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
      </Button>
  );
}
