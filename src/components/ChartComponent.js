import React from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const Lchart = (props) => {
  const colors = [
    "#b088f5",
    "#018977",
    "#e07f9d",
    "#486de8",
    "#3498db",
    "#9b59b6",
    "#e67e22",
    "#1abc9c",
    "#e91e63",
    "#00bcd4",
    "#ff7675",
    "#6ab04c",
    "#a29bfe",
    "#fdcb6e",
    "#00b894",
    "#2ecc71",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
    "#e74c3c",
    "#8e44ad",
    "#f39c12",
    "#3498db",
    "#16a085",
    "#c0392b",
    "#3498db",
  ];


 ChartJS.defaults.color = "rgba(255,255,255,0.8)";

 // Ensure props.sarr is defined and has a length greater than 0
 const sarr = props.sarr && props.sarr.length > 0 ? props.sarr : [{ date: new Date().toISOString(), dataset: '', value: 0 }];

 const data = {
    labels: sarr.map((ini, i) => new Date(ini.date).toISOString().split("T")[0]),
    datasets: [
      {
        label: props.dataname || '', // Provide a default value for dataname
        tension: 0,
        data: sarr.map((ini) => (ini.dataset === props.dataname ? ini.value : 0)),
        borderColor: colors[props.color] || '#000', // Provide a default color
        backgroundColor: colors[props.color] || '#000',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 10,
      },
    ],
 };

 const options = {
    // Your options object
 };

 return (
    <>
      {props.cType === "line" && <Line data={data} options={options} />}
      {props.cType === "bar" && <Bar data={data} options={options} />}
    </>
 );
};

export default Lchart;
