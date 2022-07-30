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
      server_data_fetched: false,
      fetch_status: null,
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
    let copy_visualDetail = { ...state.visualDetail };
    let copy_measurevisuals = cloneDeep(
      state.visualDetail.measurevisuals
    ).filter((m) => {
      return m.id == measurevisual_id;
    });

    copy_measurevisuals[0][event.target.name] = event.target.value;
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

  function setParameterForId(id, parameter_name, value_to_set) {
    let copy_visualDetail = { ...state.visualDetail };
    let copy_measurevisuals = cloneDeep(state.visualDetail.measurevisuals);
    let filtered_measurevisuals = copy_measurevisuals.filter((value) => {
      return value.id == id;
    });
    let copy_measurevisual_to_set = filtered_measurevisuals[0];
    copy_measurevisual_to_set[parameter_name] = value_to_set;
    copy_visualDetail.measurevisuals = copy_measurevisuals;
    setState({ visualDetail: copy_visualDetail });
  }

  function getParameterForId(id, parameter_name) {
    console.log("state visual detail:", state.visualDetail);
    let filtered_measurevisuals = state.visualDetail.measurevisuals.filter(
      (value) => {
        return value.id == id;
      }
    );
    console.log("filtered visuals:", filtered_measurevisuals);
    const copy_measurevisual_to_get = filtered_measurevisuals[0];
    console.log("copy of measure selected", copy_measurevisual_to_get);
    const parameter_value = copy_measurevisual_to_get[parameter_name];

    return parameter_value;
  }

  function doesIdHaveParameter(id, parameter_name) {
    let filtered_measurevisuals = state.visualDetail.measurevisuals.filter(
      (value) => {
        return value.id == id;
      }
    );
    const copy_measurevisual_to_get = filtered_measurevisuals[0];
    return copy_measurevisual_to_get.hasOwnProperty(parameter_name);
  }

  function setFetchParameter(id, parameter_name, value_to_set) {
    let copy_fetch_status = cloneDeep(state.fetch_status);
    console.log("copy fetch status", copy_fetch_status);
    let fetch_to_modify = copy_fetch_status.filter((value) => {
      return value.id == id;
    })[0];
    fetch_to_modify[parameter_name] = value_to_set;
    setState({ fetch_status: copy_fetch_status });
  }

  function getResultData(id_to_get) {
    let base_url = "http://127.0.0.1:8000/project/results/";
    const measure = getParameterForId(id_to_get, "measure");
    base_url = base_url + "?measure=" + measure;
    console.log(base_url);

    // let copy_fetch_status = cloneDeep(state.fetch_status);
    // let fetch_to_modify = copy_fetch_status.filter((value) => {
    //   return value.id == fetch.id;
    // })[0];
    // fetch_to_modify["is_loading"] = true;
    // fetch_to_modify["needs_update"] = false;
    //setState({ fetch_status: copy_fetch_status });
    axios
      .get(base_url)
      .then((response) => {
        console.log("response data", response.data);
        //see if state has a server_data_id for the object
        //if so, copy the object and set it's data to the response data
        //if not create one

        const server_id_name = "server_data_" + id_to_get.toString();

        let state_to_set = { server_data_fetched: !state.server_data_fetched };

        const data_payload = {
          id: id_to_get,
          data: response.data,
        };
        console.log("data payload", data_payload);
        state_to_set[server_id_name] = data_payload
        
        console.log("state to set", state_to_set);
        setState(state_to_set);

        // let copy_server_data = cloneDeep(state.server_data);
        // let filtered_data = copy_server_data.filter((value) => {
        //   return value.id == id_to_get;
        // });
        // console.log("filtered data", filtered_data)
        // if (filtered_data.length>0) {
        //   filtered_data[0].data = response.data;
        // } else {
        //   copy_server_data.push({
        //     id: id_to_get,
        //     data: response.data,
        //   });
        // }

        // let valid_ids = state.visualDetail.measurevisuals.map((value)=>{return value.id})
        // console.log("valid IDs", valid_ids)
        // copy_server_data = copy_server_data.filter((value)=>{ return valid_ids.includes(value.id) })

        // //add line in here to remove any server datas with ids that don't correspond to
        // // measurevisual id's that are in the current visualdetail
        // setState({meow:"meow"})
        // setState({ server_data: copy_server_data });
      })
      .catch((err) => {
        console.log(err);
        alert("issue loading result data", fetch.id);
      });
  }

  useEffect(() => {
    if (state.visualDetail) {
      console.log("here in loop");
      let valid_ids = state.visualDetail.measurevisuals.map((value) => {
        return value.id;
      });
      valid_ids = valid_ids.filter((value) => {
        return value !== "new";
      });
      console.log("valid ids", valid_ids);
      valid_ids.map((id) => {
        console.log(
          "server data" + id.toString(),
          state["server_data_" + id.toString()]
        );
      });
    }
  }, [state.server_data_fetched]);

  // useEffect(() => {
  //   console.log("fetch status", state.fetch_status);
  //   if (state.fetch_status != null) {
  //     state.fetch_status.map((value) => {
  //       if (value.needs_update == true) {
  //         getResultData(value);
  //       }
  //     });
  //   }
  // }, [state.fetch_status]);

  useEffect(() => {
    //if a valid visual detail state is set
    // set this in state
    //state.fetch_status: [{
    //  id: 1
    //  data: [big mess of data]
    //  is_loading: true
    //  needs_update: true
    // },
    //{
    //  id: 1
    //  data: [big mess of data]
    //  is_loading: true
    //   needs_update: true
    // }]
    // then something watches this
    // for each thing that needs an update it sets off an axios get
    // and it sets need update to false
    // and it sets is loading to true
    // when data comes back it sets is loading to false
    // and it sets the data to the data field

    //if the fetch status has been set up and nothing is loading or needs an update
    //then render a chart using the data in fetch status

    if (state.visualDetail) {
      // let copy_fetch_status = Array();
      // state.visualDetail.measurevisuals.map((mv) => {
      //   if (mv.measure != null) {
      //     copy_fetch_status.push({
      //       id: mv.id,
      //       data: null,
      //       is_loading: true,
      //       needs_update: true,
      //     });
      //   }
      // });

      // setState({ fetch_status: copy_fetch_status });

      state.visualDetail.measurevisuals.map((value) => {
        if (value.measure) {
          getResultData(value.id);
        }
      });
    }

    const data1 = [
      {
        id: 556,
        project: 32,
        measure: 87,
        measure_result: 100.0,
        date: "2022-07-28",
      },
      {
        id: 557,
        project: 32,
        measure: 87,
        measure_result: 150.0,
        date: "2022-07-29",
      },
    ];

    const data2 = [
      {
        id: 556,
        project: 32,
        measure: 87,
        measure_result: 200.0,
        date: "2022-07-28",
      },
      {
        id: 557,
        project: 32,
        measure: 87,
        measure_result: 250.0,
        date: "2022-07-29",
      },
    ];

    const data = {
      datasets: [
        {
          label: "Dataset 1",
          data: data1,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Dataset 2",
          data: data2,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    };
    // setState({ data: data });
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
      parsing: {
        xAxisKey: "date",
        yAxisKey: "measure_result",
      },
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
