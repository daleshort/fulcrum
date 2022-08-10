import React, { useReducer } from "react";
import MeasureManager from "./MeasureManager";
import RequireAuth from "./RequireAuth";
import Visualize from "./Visualize";

import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Layout from "./Layout";
import Register from "./Register";
import Users from "./Users";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route path="measures" element={<MeasureManager />} />
          <Route path="visualize" element={<Visualize />} />
          <Route path="users" element={<Users/>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
