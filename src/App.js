import "./App.css";
import Main from "./components/main";
import Header from "./components/header";
import Dash from "./components/dash";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";

import toast, { Toaster } from "react-hot-toast";

function App() {
  const [screen, setScreen] = useState(0);
  const [err, setErr] = useState(false);
  const [currentRepo, setCurrentRepo] = useState();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (window.location.pathname == "/" || window.location.pathname == "/git_auth") {
      setScreen(false);
      setErr(false);
    } else {
      setErr(true);
    }
  }, []);

  return (
    <>
      <Toaster />
      {console.log(search)}
      <div className="row mx-0">
        <Router>
          {(window.location.pathname == "/" || window.location.pathname == "/pull-requests" || window.location.pathname == "/workflows" || window.location.pathname == "/add-repo") && (
            <div className="col-2 p-0">
              <Dash activerep={(e) => setCurrentRepo(e)} isactive={currentRepo} />
            </div>
          )}
          <div className="col-10  p-0 mx-auto #0f1b2a " style={{ background: "#000716" }}>
            {(window.location.pathname == "/" || window.location.pathname == "/pull-requests" || window.location.pathname == "/workflows" || window.location.pathname == "/add-repo") && (
              <Header searchTerm={(e) => setSearch(e)} cSearch={search} />
            )}
            <Routes>
              <Route path="/" element={<Main isactive={currentRepo} tsearch={search} />} />
            </Routes>
          </div>
        </Router>
      </div>

      {err && (
        <div className="loader d-flex align-items-center justify-content-center bg-light" data-aos="fade-up">
          <div className="text-center">
            <h1 className="display-1 text-danger fw-bold">404</h1>
            <h1 className="display-2 text-dark fw-bold ">Not Found</h1>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
