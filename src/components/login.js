import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";
import { useCookies } from "react-cookie";
import { Outlet, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
const Login = () => {
  document.title = "User-Login";

  const [cookies, setCookie, removeCookie] = useCookies(["uToken"]);
  const [response, setResponse] = useState([]);
  const [tresponse, setTresponse] = useState("");

  const [udata, setUdata] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsloading] = useState(false);

  const handlesubmit = (e) => {
    setIsloading(true);

    e.preventDefault();

    const config = {
      headers: { "content-type": "application/json" },
    };

    setTresponse("");
    Axios.post("http://127.0.0.1:8000/login", JSON.stringify(udata))
      .then((response) => {
        typeof response.data == "string" ? setTresponse(response.data) : setResponse(response.data);
        if (response.data.access) {
          response.length !== 0 && setCookie("uToken", response.data.access, { path: "/" });
          localStorage.setItem("cUser", udata.username);
          setUdata({ username: "", password: "" });
          toast.success("Success");
          setIsloading(false);
          console.log(response.data);
          // window.location.href = "/git_auth";
          window.location.href = "/main";
        } else if (response.data.message) {
          toast.error("Invalid Credentials");
          setIsloading(false);
        } else {
          toast.error("Something Went Wrong");
          setIsloading(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setResponse(error.message);
        toast.error("Something went Wrong");
        setIsloading(false);
      });
  };

  return (
    <>
      {isLoading && (
        <div style={{ height: "100vh", width: "100%" }} className="d-flex align-items-center">
          <div className="loader2 mx-auto"></div>
        </div>
      )}
      <div className="card" style={{ background: "transparent", border: "none", height: "100vh" }}>
        <div className="d-flex h-100 align-items-center justify-content-center mt-5">
          <form id="uform" onSubmit={handlesubmit} className="row g-3 col-11 col-md-6 p-4 my-5 text-dark rounded shadow-lg bg-light" data-aos="fade-down">
            <h3 className="fw-bold">Login</h3>
            {tresponse.length !== 0 && <p className="fw-bold text-info">{tresponse}</p>}
            <hr />
            <div className="col-12">
              <label for="Username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark shadow border-0 p-3"
                id="Username"
                autoComplete="username"
                placeholder="John"
                value={udata.username}
                onChange={(e) => setUdata({ ...udata, username: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label for="Password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control bg-light text-dark shadow border-0 p-3"
                id="Password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={udata.password}
                onChange={(e) => setUdata({ ...udata, password: e.target.value })}
              />
            </div>

            <div className="col-12 py-2">
              <button type="submit" className="btn w-100 fw-bold py-2 btn-lg btn-info">
                Continue
              </button>
              <hr />
            </div>
          </form>
          <Outlet />
        </div>
      </div>
    </>
  );
};
export default Login;
