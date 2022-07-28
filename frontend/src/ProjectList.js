import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import React, {
  useReducer,
  useEffect,
} from "react";
import axios from "axios";

export default function ProjectList({returnSelectedProject}) {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      projects: null,
      isLoadingProjectList: true,
      selectedProject: null,
    }
  );

  useEffect(() => {
    refreshProjectList();
  }, []);

  function refreshProjectList() {
    //update project list
    axios
      .get("http://127.0.0.1:8000/project/projects/")
      .then((response) => {
        console.log(response.data);
        setState({ projects: response.data, isLoadingProjectList: false });
      })
      .catch((err) => {
        console.log(err);
        alert("issue loading project list");
        setState({ isLoadingProjectList: false });
      });
  }

  function setSelectedProject(project_id) {
    setState({ selectedProject: project_id });
    let project_title = state.projects.filter((value)=>{
      return value.id == project_id
    })[0].title
    returnSelectedProject(project_id,project_title);
  }

  return (
    <Card >
    {/* <Card style={{ width: "18rem" }}> */}
      <ListGroup>
        {state.projects
          ? state.projects.map((x, i) => {
              return (
                <ListGroupItem
                  action
                  key={x.id}
                  active={state.selectedProject == x.id}
                  onClick={() => {
                    setSelectedProject(x.id);
                  }}
                >
                  {x.title}
                </ListGroupItem>
              );
            })
          : null}
      </ListGroup>
    </Card>
  );
}
