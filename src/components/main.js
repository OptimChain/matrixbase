import React from "react";
import Lchart from "./chartdemo";
import "./master.css";
import { useState } from "react";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import Axios from "axios";
import Paginate from "./paginate";

const Main = (props) => {
  const [cookies, setCookie, removeCookie] = useCookies(["uToken"]);

  const [togglers, setToogler] = useState([]);
  const [view, setView] = useState(localStorage.getItem("cView") ? localStorage.getItem("cView") : "cards");

  const [chartType, setChartType] = useState("line");
  const [isLoading, setIsloading] = useState(false);

  const [path, setPath] = useState("");

  const [sortedarr, setSortedArr] = useState([]);

  const [ogData, setOgData] = useState([]);
  const [pnum, setPNum] = useState(1);
  const [datalen, setDataLen] = useState(0);
  const [err, setErr] = useState(0);
  const [datasetnames, setDataSetNames] = useState([]);

  const changeView = (e) => {
    localStorage.setItem("cView", e);
    setView(e);
    window.location.reload();
  };

  // Calling & Exception Handling Start==============>
  useEffect(() => {
    setIsloading(true);

    const config = {
      headers: { "content-type": "application/json", Authorization: cookies.uToken },
    };

    Axios.post("http://127.0.0.1:8000/", { object_name: props.isactive, page_no: pnum }, config)
      .then((response) => {
        console.log(response.data);
        setOgData(response.data[1].dataset);
        setDataLen(response.data[0].page_obj.end);
        setDataSetNames(response.data[2].dataset_colms);
        setIsloading(false);
        setErr(0);
      })
      .catch((err) => {
        setIsloading(false);
        // Console logging the error & also updating the state variable for the exact message if it' present in the response ===>
        console.log(err);
        setErr(err.response.data.message ? err.response.data.message : "something went wrong!");
        // Console logging the error & also updating the state variable End ====================================================>
      });

    setPath(localStorage.getItem("bucket") + " > " + localStorage.getItem("file"));
  }, [props, pnum]);

  // Calling & Exception Handling End==============>

  useEffect(() => {
    setIsloading(true);
    // Combine all arrays into a single array
    const combinedArray = ogData.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    // Update state for the sorted array
    setSortedArr(combinedArray);
    setIsloading(false);
  }, [ogData]);

  return (
    <>
      {isLoading && (
        <div style={{ height: "100vh", width: "100%", zIndex: 99, position: "absolute", top: 0, left: 0, background: "rgba(0,0,0,0.5)" }} className="d-flex align-items-center">
          <div className="loader2 mx-auto"></div>
        </div>
      )}

      {!isLoading && err !== 0 && (
        <div style={{ height: "80%", width: "100%" }} className="d-flex align-items-center justify-content-center">
          <div className="text-center bg-black rounded p-3 shadow mx-auto">
            <h1 className="display-5">
              <i className="fa fa-warning text-warning"></i>
            </h1>
            <h4 className="lead ps-3 text-secondary pt-2"> {path} </h4>
            <h4 className="text-light">{err}</h4>
          </div>
        </div>
      )}

      {err == 0 && (
        <>
          <div style={{ maxHeight: "93dvh", overflowY: "scroll " }}>
            <h4 className="lead ps-3 text-secondary pt-2"> {path} </h4>

            <div className="px-3 pt-4">
              <div className=" d-flex align-items-center justify-content-between">
                <div className="togglers w-100">
                  <div className="cToggles d-flex border border-1 border-secondary rounded-pill p-2 mb-2" style={{ width: "max-content", background: "#0f1b2a" }}>
                    <button className={`rounded-pill btn ${chartType == "line" ? "btn-info text-light" : "btn-outline-info"}`} onClick={() => setChartType("line")}>
                      <i className="fa fa-line-chart rounded-circle"></i>
                    </button>
                    <button className={`rounded-pill btn ms-2 ${chartType == "bar" ? "btn-info text-light" : "btn-outline-info"}`} onClick={() => setChartType("bar")}>
                      <i className="fa fa-bar-chart"></i>
                    </button>
                  </div>
                </div>

                <div className="mb-1 text-end w-100">
                  <button className={`btn btn-lg ${view == "cards" ? "btn-dark" : "btn-outline-dark"} p-1 px-2 me-1`} onClick={() => changeView("cards")}>
                    <i className="fa fa-list-alt"></i>
                  </button>
                  <button className={`btn btn-lg ${view == "cards" ? "btn-outline-dark" : "btn-dark"} p-1 px-2`} onClick={() => changeView("list")}>
                    <i className="fa fa-th-list"></i>
                  </button>
                </div>
              </div>
              <div className="w-100 text-center" style={{ position: "sticky", top: 0 }}>
                <Paginate pagecount={(e) => setPNum(e)} total={datalen} cactive={pnum} />
              </div>
              <div className="row mx-0 p-3 ps-0 pe-0 rounded" style={{ backgroundColor: "#0f1b2a" }}>
                {/* [PAgination] */}

                {datasetnames.map((ini, i) => {
                  let x = i;
                  if (i % 100 == 0) {
                    x = i;
                  }

                  return (
                    <span key={i + 1} className={`${view == "cards" ? "col-6" : "col-12"} d-flex`}>
                      {`${ini}`.toLowerCase().includes(props.tsearch) || props.tsearch == "" ? (
                        <div className="w-100">
                          <div className="w-100   p-3 mb-3 shadow rounded-4" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Lchart cdata={togglers} cType={chartType} sarr={sortedarr} dataname={ini} color={i < 100 ? i : i - x} origin={"workflows"} />
                          </div>

                          <div className="h-100 opacity-0" style={{ background: "rgb(183, 183, 185)" }}>
                            <div className="vr"></div>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Main;
