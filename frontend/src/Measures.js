import React, { useReducer, useEffect, useState, useRef } from "react";
import axios from "axios";
import "./bootstrap.min.css";
import Accordion from "react-bootstrap/Accordion";
import "./Measures.css";
import MeasureDetail from "./MeasureDetail";
import Card from "react-bootstrap/Card";

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
    console.log("load new measures", activeProjectProp);

    if (activeProjectProp != "new") {
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
    }
  };

  useEffect(() => {
    setState({ activeProject: activeProjectProp });
    //some delay in state.active project so use activeProjectProp directly
    if (activeProjectProp !== null) {
      loadMeasures();
    }
  }, [activeProjectProp]);

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

  function renderAddNewMeasure() {
    const new_measure = {
      id: "new",
      title: null,
      units: null,
      type: "test123",
      parameters: [],
    };
    if (activeProjectProp != "new") {
      return (
        <Card>
          <Accordion.Item key="new" eventKey="0" ref={accordElem}>
            <Accordion.Header
              onClick={() => {
                handleClickToggle("0");
              }}
            >
              *New Measure*
            </Accordion.Header>
            <Accordion.Body>
              <MeasureDetail
                measure={new_measure}
                activeProjectProp={activeProjectProp}
                refreshMeasureList={loadMeasures}
              />
            </Accordion.Body>
          </Accordion.Item>
        </Card>
      );
    }
  }

  function renderAccordion() {
    if (state.projectMeasures !== null) {
      if (state.projectMeasures !== [] && activeProjectProp !== "new") {
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
            {renderAddNewMeasure()}
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
