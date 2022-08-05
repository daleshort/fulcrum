import React from "react";
import logo from "./fulcrum_about.jpg"

export default function About() {
  console.log("in about")
  return (
    <div className="flex-title">
      {" "}
      <img src={logo} width="1000px" />
    </div>
  );
}
