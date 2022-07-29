import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { cloneDeep } from "lodash";

import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Modal from "react-bootstrap/Modal";
import RelationPickerModal from "./RelationPickerModal";

export default function MeasureVisuals({ visual_id = null }) {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      visualDetail: null,
      data: null,
    }
  );

  function refreshVisualList() {
    if (visual_id !== "new") {
      axios
        .get("http://127.0.0.1:8000/project/visuals/" + visual_id.toString())
        .then((response) => {
          //   console.log(response.data);
          response.data = addNewMeasureVisualToResponse(response.data);
          setState({
            visualDetail: response.data,
          });
        })
        .catch((err) => {
          console.log(err);
          alert("issue loading");
        });
    }
  }

  function addNewMeasureVisualToResponse(response_data) {
    response_data.measurevisuals.push({
      id: "new",
      project: null,
      measure: null,
      visual: visual_id,
      start_date: null,
      end_date: null,
      collect: null,
      style_color: null,
    });
    return response_data;
  }

  useEffect(() => {
    if (visual_id !== "new") {
      axios
        .get("http://127.0.0.1:8000/project/visuals/" + visual_id.toString())
        .then((response) => {
          //   console.log(response.data);
          response.data = addNewMeasureVisualToResponse(response.data);

          setState({
            visualDetail: response.data,
          });
        })
        .catch((err) => {
          console.log(err);
          alert("issue loading");
        });
    }
  }, [visual_id]);

  function handleFormChange(event, measurevisual_id) {
    console.log("value:", event.target.value);
    console.log("name", event.target.name);
    let copy_visualDetail = { ...state.visualDetail };
    let copy_measurevisuals = cloneDeep(
      state.visualDetail.measurevisuals
    ).filter((m) => {
      return m.id == measurevisual_id;
    });

    copy_measurevisuals[0][event.target.name] = event.target.value;
    console.log("copy measure visuals", copy_measurevisuals);
    copy_visualDetail.measurevisuals = copy_measurevisuals;
    setState({ visualDetail: copy_visualDetail });
  }

  function checkForDeactivated(key) {
    if (key.toLowerCase() == "id") {
      return true;
    } else if (key.toLowerCase() == "project") {
      return true;
    } else if (key.toLowerCase() == "measure") {
      return true;
    } else if (key.toLowerCase() == "visual") {
      return true;
    }

    return false;
  }
  function renderInputForm(key, value) {
    return (
      <FloatingLabel
        controlId="floatingInput"
        label={key}
        className="mb-3"
        key={key}
      >
        <Form.Control
          name={key}
          onChange={(event) => {
            handleFormChange(event, value.id);
          }}
          onSelect={(event) => {
            handleFormChange(event, value.id);
          }}
          value={value[key] == null ? "" : value[key]}
          disabled={checkForDeactivated(key)}
          type={key.toLowerCase().includes("date") ? "date" : ""}
        />
      </FloatingLabel>
    );
    // return (<ul>{ key + ":" + value[key]}</ul>);
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    //update existing measurevisuals of current visual
    let copy_visualDetail = { ...state.visualDetail };
    let copy_measurevisuals = cloneDeep(state.visualDetail.measurevisuals);
    //need to not write title and type at this level
    delete copy_visualDetail.title;
    delete copy_visualDetail.type;

    let new_measurevisual = copy_measurevisuals.filter((value) => {
      return value.id == "new";
    })[0];

    if (new_measurevisual.project == null) {
      //need to make sure that new list isn't patched into list if it hasn't been changed
      copy_visualDetail.measurevisuals = copy_measurevisuals.filter((value) => {
        return value.id !== "new";
      });
    } else {
      delete new_measurevisual.id; //delete ID in preparation to patch
      copy_visualDetail.measurevisuals = copy_measurevisuals;
    }

    //any measure details with an existing id will be updated
    //any with no id given will be created
    //any that aren't part of the patch will be deleted
    axios
      .patch(
        "http://127.0.0.1:8000/project/visuals/" + visual_id.toString() + "/",
        copy_visualDetail
      )
      .then((response) => {
        console.log(response.data);
        refreshVisualList();
      })
      .catch((err) => {
        console.log(err);
        alert("issue updating visual details");
      });
  }

  function renderAccordionHeaderText(value) {
    if (value.project && value.measure) {
      return value.project + ":" + value.measure;
    } else if (value.id == "new") {
      return "*Add New Measurement*";
    }
  }
  function handleInsertCallBack(project, measure, id) {
    console.log("callback from value id:", id);
    let copy_visualDetail = { ...state.visualDetail };
    let copy_measurevisuals = cloneDeep(state.visualDetail.measurevisuals);
    let filtered_measurevisuals = copy_measurevisuals.filter((value) => {
      return value.id == id;
    });
    let copy_measurevisual_to_set = filtered_measurevisuals[0];
    copy_measurevisual_to_set.project = project;
    copy_measurevisual_to_set.measure = measure;

    copy_visualDetail.measurevisuals = copy_measurevisuals;
    setState({ visualDetail: copy_visualDetail });
  }

  function renderMeasureVisualList() {
    if (state.visualDetail) {
      return (
        <div>
          <Form onSubmit={handleFormSubmit}>
            <Accordion>
              <br />
              {state.visualDetail.measurevisuals.map((value) => {
                return (
                  <Accordion.Item key={value.id} eventKey={value.id}>
                    <Accordion.Header>
                      {renderAccordionHeaderText(value)}{" "}
                    </Accordion.Header>
                    <Accordion.Body>
                      {Object.keys(value).map((key, index) => {
                        return renderInputForm(key, value);
                      })}
                      <RelationPickerModal
                        insertCallBack={(project, measure) => {
                          handleInsertCallBack(project, measure, value.id);
                        }}
                      />
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
              <br />
              <Button type="submit">Submit</Button>
            </Accordion>
          </Form>
        </div>
      );
    }
  }

  useEffect(() => {
    const labels = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
    ];

    const data = {
      labels,
      datasets: [
        {
          label: "Dataset 1",
          data: labels.map(() =>
            faker.datatype.number({ min: -1000, max: 1000 })
          ),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Dataset 2",
          data: labels.map(() =>
            faker.datatype.number({ min: -1000, max: 1000 })
          ),
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    };
    setState({ data: data });
  }, [state.visualDetail]);

  function renderChartJS() {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          // position: 'top' as const,
        },
        title: {
          display: true,
          text: "Chart.js Line Chart",
        },
      },
    };

    if (state.data) {
      return <Line options={options} data={state.data} />;
    }
  }

  return (
    <div>
      {renderMeasureVisualList()}
      {renderChartJS()}
    </div>
  );
}
