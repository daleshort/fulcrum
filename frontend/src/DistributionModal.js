import React, { useReducer, useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  TimeScale,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

import "chartjs-plugin-dragdata";
import { useImmerReducer } from "use-immer";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { cloneDeep } from "lodash";

export default function DistributionModal({
  insertCallBack,
  start_date = null,
  end_date = null,
  distribution_state= null,
}) {
  const [showRelationModal, setShowRelationModal] = useState(false);
  const handleRelationModalClose = () => {
    setShowRelationModal(false);
  };
  const handleRelationModalShow = () => setShowRelationModal(true);
  useEffect(handleRelationModalClose, []);

  const [dataset, setDataSet] = useState(initializeDataset());

  function initializeDataset(){
    if(distribution_state==""){
        return Array.from({ length: 10 }, () => 50)
    }else{
        return distribution_state.split(',').map((val)=>{return parseFloat(val)})
        //need to make distribution_state an array from the string that came in
        //return distribution_state
        //return Array.from({ length: 10 }, () => 50)
    }
  }

  const handleRelationModalInsert = () => {
    insertCallBack(dataset);
    setShowRelationModal(false);
  };

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Filler
  );

  function getData() {
    let labels = [...Array(10).keys()];

    // console.log("start date:", start_date);
    // console.log("end date", end_date);

    if (start_date != "0000-00-00" && end_date != "0000-00-00") {
      const start_date_as_date = new Date(start_date + "T04:00:00Z");
      const end_date_as_date = new Date(end_date + "T12:00:00Z");
      const diffTime = Math.abs(end_date_as_date - start_date_as_date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      //   console.log("diff time", diffTime);
      //   console.log("diff days", diffDays);
        labels = Array.from({ length: 10 }, (value, index) => {
        // console.log("index",index)
        // console.log(diffTime*index)
        return new Date(start_date_as_date.getTime() + (diffTime * index) / 9);
      });
     
    }

    return {
      labels: labels,
      datasets: [
        {
          data: dataset,
          fill: true,
          tension: 0.4,
          borderWidth: 1,
          pointHitRadius: 2,
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 5,
          spanGaps: false,
          borderColor: "rgb(0,99,247)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    };
  }
  function getOptions() {
    let options = {
      scales: {
        y: {
          max: 100,
          min: 0,
          ticks: {
            display: true,
            scaleSteps: 50,
            maxTicksLimit: 3,
          },
          grid: {
            display: false,
            //offsetGridLines: true,
            //color: "3C3C3C",
            drawTicks: true,
            tickMarkLength: 4,
          },
        },
        x: {
          // type: "time",
          // time: {
          //   //  unit: "month",
          // },
          // adapters: {
          //   date: {
          //     locale: enUS,
          //   },
          // },
          grid: {
            display: false,
            drawTicks: true,
            tickMarkLength: 4,
          },
        },
      },
      responsive: true,

      plugins: {
        legend: {
          display: false,
        },
        dragData: {
          round: 1,
          onDragStart: function (e) {
          },
          onDrag: function (e, datasetIndex, index, value) {
          },
          onDragEnd: function (e, datasetIndex, index, value) {
            let copy_data = cloneDeep(dataset);
            copy_data[index] = value;
            //setDataSet(copy_data);
          },
        },
      },
    };

    if (start_date != "0000-00-00" && end_date != "0000-00-00") {
      options.scales.x = {
        type: "time",
        time: {
         // unit: "month",
        },
        adapters: {
          date: {
            locale: enUS,
          },
        },
        grid: {
          display: false,
          drawTicks: true,
          tickMarkLength: 4,
        },
      };
    }
    return options;
  }

  return (
    <div>
      <Button onClick={handleRelationModalShow}>Draw Distribution</Button>
      <Modal show={showRelationModal} onHide={handleRelationModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select Distribution</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Line options={getOptions()} data={getData()} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRelationModalClose}>
            Cancel
          </Button>
          <Button onClick={handleRelationModalInsert}>Select</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
