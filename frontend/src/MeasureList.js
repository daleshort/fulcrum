import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import React, { useReducer, useEffect } from "react";
import axios from "axios";

export default function MeasureList({
  returnSelectedMeasure,
  project_id = null,
}) {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      measures: null,
      isLoadingMeasureList: true,
      selectedMeasure: null,
    }
  );

  useEffect(() => {
    refreshMeasureList();
  }, []);

  useEffect(() => {
    setState({ selectedMeasure: null });
    refreshMeasureList();
  }, [project_id]);

  function refreshMeasureList() {
    if (project_id !== null) {
      console.log("load new measures", project_id);

      setState({ isLoadingMeasures: true });
      let path =
        "http://127.0.0.1:8000/project/projects/" +
        project_id.toString() +
        "/measures/";
      axios
        .get(path)
        .then((response) => {
          console.log(response.data);
          setState({
            measures: response.data,
            isLoadingMeasureList: false,
          });
        })
        .catch((err) => {
          console.log(err);
          alert("issue loading");
          setState({ isLoadingMeasureList: false });
        });
    }
  }

  function setSelectedMeasure(measure_id) {
    setState({ selectedMeasure: measure_id });
    let measure_title = state.measures.filter((value)=>{
      return value.id == measure_id
    })[0].title
    returnSelectedMeasure(measure_id,measure_title);
  }
  if(state.measures){
  return (
    <Card>
      <ListGroup>
        {state.measures.map((x, i) => {
          return (
            <ListGroupItem
              action
              key={x.id}
              active={state.selectedMeasure == x.id}
              onClick={() => {
                setSelectedMeasure(x.id);
              }}
            >
              {x.title}
            </ListGroupItem>
          );
        })}
      </ListGroup>
    </Card>
  );
    }
}
