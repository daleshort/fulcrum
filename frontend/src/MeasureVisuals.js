import React, { useReducer, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { cloneDeep } from "lodash";

import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import RelationPickerModal from "./RelationPickerModal";

import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

let xlsx = require("json-as-xlsx");

export default function MeasureVisuals({ visual_id = null }) {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      visualDetail: null,
      visualDetail_for_chart: null,
      data: null,
      server_data_fetched: false,
      color_index_offset: Math.floor(Math.random() * 10),
    }
  );

  function refreshVisualList() {
    if (visual_id !== "new") {
      axios
        .get("http://127.0.0.1:8000/project/visuals/" + visual_id.toString())
        .then((response) => {
          response.data.measurevisuals = addNewMeasureVisualToResponse(
            response.data.measurevisuals
          );
          setState({
            visualDetail: response.data,
            visualDetail_for_chart: response.data,
          });
        })
        .catch((err) => {
          console.log(err);
          alert("issue loading");
        });
    }
  }

  //add a blank measurevisual to the end of the list for the user to be able to add
  function addNewMeasureVisualToResponse(measurevisuals) {
    measurevisuals.push({
      id: "new",
      project: null,
      project_title: null,
      measure: null,
      measure_title: null,
      visual: visual_id,
      start_date: null,
      end_date: null,
      collect: null,
      style_color: null,
    });
    return measurevisuals;
  }

  useEffect(() => {
    if (visual_id !== "new") {
      setState({ visualDetail: null, visualDetail_for_chart: null });
      axios
        .get("http://127.0.0.1:8000/project/visuals/" + visual_id.toString())
        .then((response) => {
          //   console.log(response.data);
          response.data.measurevisuals = addNewMeasureVisualToResponse(
            response.data.measurevisuals
          );

          setState({
            visualDetail: response.data,
            visualDetail_for_chart: response.data,
          });
        })
        .catch((err) => {
          console.log(err);
          alert("issue loading");
        });
    } else {
      setState({ visualDetail: null, visualDetail_for_chart: null });
    }
  }, [visual_id]);

  function renderInputForm(key, value) {
    if (key == "collect") {
      return (<div><Form.Select
      name={key}
      onChange={(event) => {
        handleFormChange(event, value.id);
      }}
      onSelect={(event) => {
        handleFormChange(event, value.id);
      }}
      value={value[key]}
    >
      <option value={null}>Select</option>
      <option value={"monthly"}>monthly</option>
    </Form.Select><br/></div>)
    } else {
      if(!checkForDeactivated(key)){
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
      }

    }
  }
  function handleFormChange(event, measurevisual_id) {
    console.log("state of visual detail at change:", state.visualDetail);

    let copy_visualDetail = cloneDeep(state.visualDetail);
    // let copy_visualDetail = { ...state.visualDetail };

    console.log("copy visual detail at change", copy_visualDetail);

    let copy_measurevisuals = cloneDeep(state.visualDetail.measurevisuals);

    // .filter((m) => {
    //   return m.id == measurevisual_id;
    // });

    copy_measurevisuals = copy_measurevisuals.map((m) => {
      if (m.id == measurevisual_id) {
        m[event.target.name] = event.target.value;
        return m;
      } else {
        return m;
      }
    });

    // copy_measurevisuals[0][event.target.name] = event.target.value;
    copy_visualDetail.measurevisuals = copy_measurevisuals;
    setState({ visualDetail: copy_visualDetail });
  }

  //set specific fields to not user editable
  function checkForDeactivated(key) {
    if (key.toLowerCase() == "id") {
      return true;
    } else if (key.toLowerCase() == "project") {
      return true;
    } else if (key.toLowerCase() == "measure") {
      return true;
    } else if (key.toLowerCase() == "visual") {
      return true;
    } else if (key.toLowerCase() == "measure_title") {
      return true;
    } else if (key.toLowerCase() == "project_title") {
      return true;
    } else if (key.toLowerCase()=="style_color"){
      return true;
    }
    return false;
  }

  //submit the form data to the server
  function handleFormSubmit(event, measurevisual_id_to_delete = null) {
    if (event != null) {
      event.preventDefault();
    }
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

    //strip read only measure title and project title from data
    copy_visualDetail.measurevisuals = copy_visualDetail.measurevisuals.map(
      (measurevisual) => {
        delete measurevisual.measure_title;
        delete measurevisual.project_title;
        return measurevisual;
      }
    );

    if (measurevisual_id_to_delete !== null) {
      copy_visualDetail.measurevisuals =
        copy_visualDetail.measurevisuals.filter((measurevisual) => {
          return measurevisual.id != measurevisual_id_to_delete;
        });
    }

    console.log("copy visual detail in submit:", copy_visualDetail);

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

  function handleDeleteMeasureVisual(id) {
    console.log("id", id);
    handleFormSubmit(null, id);
  }

  function renderMeasureVisualList() {
    if (state.visualDetail) {
      return (
        <div>
          <Form
            onSubmit={(event) => {
              handleFormSubmit(event, null);
            }}
          >
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
                        insertCallBack={(
                          project,
                          project_title,
                          measure,
                          measure_title
                        ) => {
                          handleInsertCallBack(
                            project,
                            project_title,
                            measure,
                            measure_title,
                            value.id
                          );
                        }}
                      />
                        {" "}
                      <Button
                        variant="danger"
                        onClick={() => {
                          handleDeleteMeasureVisual(value.id);
                        }}
                      >
                        Delete Measure
                      </Button>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
              <br />
              <Button type="submit">Submit Changes</Button>
            </Accordion>
          </Form>
        </div>
      );
    }
  }

  //Make the accordion header label different if it's a new measurevisual
  function renderAccordionHeaderText(value) {
    if (value.project && value.measure) {
      return value.project_title + ":" + value.measure_title;
    } else if (value.id == "new") {
      return "*Add New Measurement*";
    }
  }

  //handle the return from the measure modal picker
  function handleInsertCallBack(
    project,
    project_title,
    measure,
    measure_title,
    id
  ) {
    let copy_visualDetail = { ...state.visualDetail };
    let copy_measurevisuals = cloneDeep(state.visualDetail.measurevisuals);
    let filtered_measurevisuals = copy_measurevisuals.filter((value) => {
      return value.id == id;
    });
    let copy_measurevisual_to_set = filtered_measurevisuals[0];
    copy_measurevisual_to_set.project = project;
    copy_measurevisual_to_set.project_title = project_title;
    copy_measurevisual_to_set.measure = measure;
    copy_measurevisual_to_set.measure_title = measure_title;

    copy_visualDetail.measurevisuals = copy_measurevisuals;
    setState({ visualDetail: copy_visualDetail });
  }

  function getResultData(id_to_get) {
    let base_url = "";

    if (getParameterForId(id_to_get, "collect") == "monthly") {
      base_url = "http://127.0.0.1:8000/project/consolidate/";
    } else {
      base_url = "http://127.0.0.1:8000/project/results/";
    }

    const measure = getParameterForId(id_to_get, "measure");
    base_url = base_url + "?measure=" + measure + "&nulldate=true";

    if (getParameterForId(id_to_get, "start_date") != null) {
      base_url =
        base_url + "&start_date=" + getParameterForId(id_to_get, "start_date");
    }

    if (getParameterForId(id_to_get, "end_date") != null) {
      base_url =
        base_url + "&end_date=" + getParameterForId(id_to_get, "end_date");
    }

    console.log(base_url);

    axios
      .get(base_url)
      .then((response) => {
        // console.log("response data", response.data);
        //see if state has a server_data_id for the object
        //if so, copy the object and set it's data to the response data
        //if not create one

        const server_id_name = "server_data_" + id_to_get.toString();

        let state_to_set = { server_data_fetched: !state.server_data_fetched };

        const data_payload = {
          id: id_to_get,
          data: response.data,
        };
        state_to_set[server_id_name] = data_payload;

        setState(state_to_set);

        // let valid_ids = state.visualDetail.measurevisuals.map((value)=>{return value.id})
        // console.log("valid IDs", valid_ids)
        // copy_server_data = copy_server_data.filter((value)=>{ return valid_ids.includes(value.id) })
      })
      .catch((err) => {
        console.log(err);
        alert("issue loading result data", fetch.id);
      });
  }

  function getParameterForId(id, parameter_name) {
    // console.log("state visual detail:", state.visualDetail);
    let filtered_measurevisuals =
      state.visualDetail_for_chart.measurevisuals.filter((value) => {
        return value.id == id;
      });
    //  console.log("filtered visuals:", filtered_measurevisuals);
    const copy_measurevisual_to_get = filtered_measurevisuals[0];
    //   console.log("copy of measure selected", copy_measurevisual_to_get);
    const parameter_value = copy_measurevisual_to_get[parameter_name];

    return parameter_value;
  }

  function getDatasetsMaxAndMinDate(datasets) {
    let dates = Array();
    datasets.map((dataset) => {
      dates = dates.concat(
        dataset.data.map((value) => {
          if (value.date != null) {
            //  console.log("value date:", new Date(value.date));
            return new Date(value.date);
            // return Date.parse(value.date);
          } else {
            return null;
          }
        })
      );
    });
    dates = dates.filter((value) => {
      return value !== null;
    });

    var max_date = new Date(Math.max.apply(null, dates));
    var min_date = new Date(Math.min.apply(null, dates));

    function formatDate(date) {
      var dd = date.getDate() + 1;
      var mm = date.getMonth() + 1; //January is 0!
      var yyyy = date.getFullYear();
      if (dd < 10) {
        dd = "0" + dd;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }
      //return dd + '-' + mm + '-' + yyyy;
      return yyyy + "-" + mm + "-" + dd;
    }

    let max_date_str = formatDate(max_date);
    let min_date_str = formatDate(min_date);

    return [min_date_str, max_date_str];
  }

  function setMinAndMaxDateToDatasets(datasets, min_date, max_date) {
    datasets = datasets.map((dataset) => {
      if (dataset.data.length == 1) {
        if (dataset.data[0].date == null) {
          //if null date measurement

          //add a second copy of the data
          dataset.data.push(cloneDeep(dataset.data[0]));
          //make one the min date and make one the max date
          dataset.data[0].date = min_date;
          dataset.data[1].date = max_date;

          return dataset;
        }
      } else {
        dataset.data = dataset.data.filter((value) => {
          return value.date !== null;
        });
        return dataset;
      }
    });
    return datasets;
  }

  function makeDatasetsFromServerData() {
    const default_colors = [
      "rgb(34, 146, 220)",
      "rgb(194, 227, 244)",
      "rgb(252, 211, 61)",
      "rgb(92, 183, 228)",
      "rgb(237, 100, 30)",
      "rgb(237, 40, 40)",
    ];

    if (state.visualDetail) {
      let datasets = Array();
      let valid_ids = state.visualDetail_for_chart.measurevisuals.map(
        (value) => {
          return value.id;
        }
      );
      valid_ids = valid_ids.filter((value) => {
        return value !== "new";
      });

      var color_index = state.color_index_offset;
      valid_ids.map((id) => {
        if (state["server_data_" + id.toString()]) {
          if (state["server_data_" + id.toString()].hasOwnProperty("data")) {
            color_index = color_index + 1;
            if (color_index > default_colors.length - 1) {
              color_index = 0;
            }

            let data_from_state = state["server_data_" + id.toString()].data;
            let data_array_from_state = data_from_state.map((value) => {
              return value.measure_result;
            });

            const data_sum = data_array_from_state.reduce((a, b) => a + b);
            const data_average = (
              data_sum / data_array_from_state.length
            ).toFixed(2);

            const data_max = Math.max.apply(null, data_array_from_state);
            const data_min = Math.min.apply(null, data_array_from_state);

            datasets.push({
              label:
                getParameterForId(id, "project_title") +
                ":" +
                getParameterForId(id, "measure_title"),
              data: data_from_state,
              borderColor: default_colors[color_index],
              backgroundColor: default_colors[color_index],
              sum: parseFloat(data_sum).toFixed(2),
              avg: parseFloat(data_average).toFixed(2),
              max: parseFloat(data_max).toFixed(2),
              min: parseFloat(data_min).toFixed(2),
            });
          }
        }
      });

      let [min_date, max_date] = getDatasetsMaxAndMinDate(datasets);

      //add code here to define function to set null data to have the min date and max date
      datasets = setMinAndMaxDateToDatasets(datasets, min_date, max_date);

      const data = {
        datasets: datasets,
      };
      console.log("data", data);

      return data;
    }
  }

  useEffect(() => {
    if (state.visualDetail_for_chart) {
      state.visualDetail_for_chart.measurevisuals.map((value) => {
        if (value.measure) {
          getResultData(value.id);
        }
      });
    }
  }, [state.visualDetail_for_chart]);

  function renderChartJS() {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      PointElement,
      ArcElement,
      LineElement,
      TimeScale,
      Title,
      Tooltip,
      Legend
    );

    const options_bar = {
     // skipNull:true,  // I think if I padded the data with null values I could get the axis to skip these?
      responsive: true,
      // scales: {
      //   x: {
      //     type: "time",
      //     // offsetAfterAutoskip: true,
      //     time: {
      //       //  unit: "month",
      //     },
      //     adapters: {
      //       date: {
      //         locale: enUS,
      //       },
      //     },
      //   },
      // },
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
          text: "Bar Chart",
        },
      },
    };

    const options_line = {
      scales: {
        x: {
          type: "time",
          time: {
            //  unit: "month",
          },
          adapters: {
            date: {
              locale: enUS,
            },
          },
        },
      },
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
          text: "Line Chart",
        },
      },
    };

    if (state.visualDetail_for_chart) {
      let data_for_chart = makeDatasetsFromServerData();
      console.log("state of visual detail", state.visualDetail);
      if (data_for_chart.datasets.length > 0) {
        const chart = () => {
          if (state.visualDetail.type == "line") {
            return <Line options={options_line} data={data_for_chart} />;
          } else if (state.visualDetail.type == "bar") {
            return <Bar options={options_bar} data={data_for_chart} />;
          } else if (state.visualDetail.type == "doughnut_sum") {
            return (
              <Doughnut
                options={options_bar}
                data={makeSummaryDataset(data_for_chart, "sum")}
              />
            );
          } else if (state.visualDetail.type == "doughnut_avg") {
            return (
              <Doughnut
                options={options_bar}
                data={makeSummaryDataset(data_for_chart, "avg")}
              />
            );
          }
        };

        return (
          <div>
            {chart()}
            <br/>
            {data_for_chart.datasets.map((dataset) => {
              return (
                <div>
                  {dataset.label} | avg: {dataset.avg} | sum: {dataset.sum} |
                  max: {dataset.max} | min: {dataset.min}
                </div>
              );
            })}
            <Button
              onClick={() => {
                let data_prepared = prepareDataToXlsx(data_for_chart);
                let settings = {
                  fileName: "MySpreadsheet", // Name of the resulting spreadsheet
                  extraLength: 3, // A bigger number means that columns will be wider
                  writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
                };

                xlsx(data_prepared, settings);
              }}
            >
              Download XLSX
            </Button>
          </div>
        );
      }
    }
  }

  function prepareDataToXlsx(data_for_chart) {
    return data_for_chart.datasets.map((dataset, index) => {
      return {
        sheet: dataset.label.slice(0, 28) + "-" + index.toString(),
        columns: [
          { label: "Date", value: "date" },
          { label: "Result", value: "measure_result" },
          { label: "Project:Measure", value: "label" },
        ],
        content: dataset.data.map((value) => {
          value["label"] = dataset.label;
          return value;
        }),
      };
    });
  }

  function makeSummaryDataset(data_for_chart, type) {
    return {
      datasets: [
        {
          data: data_for_chart.datasets.map((dataset) => {
            if (type == "sum") {
              return dataset.sum;
            } else return dataset.avg;
          }),
          borderColor: data_for_chart.datasets.map((dataset) => {
            return dataset.backgroundColor;
          }),
          backgroundColor: data_for_chart.datasets.map((dataset) => {
            return dataset.backgroundColor
              .replace(")", ", 0.75)")
              .replace("rgb", "rgba");
          }),
          borderWidth: 2,
        },
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: data_for_chart.datasets.map((dataset) => {
        return dataset.label;
      }),
    };
  }

  return (
    <div>
      {renderChartJS()}
      {renderMeasureVisualList()}
      
    </div>
  );
}
