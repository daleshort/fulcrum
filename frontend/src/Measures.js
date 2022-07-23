import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";
import "./bootstrap.min.css";
import Accordion from "react-bootstrap/Accordion";

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

  useEffect(() => {
    setState({ activeProject: activeProjectProp, isLoadingMeasures: true });
    //some delay in state.active project so use activeProjectProp directly
    if (activeProjectProp !== null) {
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
    }
  }, [activeProjectProp]);

  function renderAccordion() {
    if (state.projectMeasures !== null) {
      if (state.projectMeasures !== []) {
        return (
          //   <Accordion>
          //     <Accordion.Item eventKey="0">
          //       <Accordion.Header>Accordion Item #1</Accordion.Header>
          //       <Accordion.Body>
          //         Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          //       </Accordion.Body>
          //     </Accordion.Item>
          //     <Accordion.Item eventKey="1">
          //       <Accordion.Header>Accordion Item #2</Accordion.Header>
          //       <Accordion.Body>
          //         pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          //         culpa qui officia deserunt mollit anim id est laborum.
          //       </Accordion.Body>
          //     </Accordion.Item>
          //   </Accordion>

          <Accordion>
            {state.projectMeasures.map((x, i) => {
              return (
                <Accordion.Item eventKey={x.id}>
                  <Accordion.Header> {x.title} </Accordion.Header>
                  <Accordion.Body> blah </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        );
      }
    } else {
    }
    return;
  }

  return (
    <div>
      <div>Measures for ID: {activeProjectProp} </div>
      <div>{renderAccordion()}</div>
    </div>
  );
}
