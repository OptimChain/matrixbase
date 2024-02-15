import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link, Outlet, Location } from "react-router-dom";

const Dash = (props) => {
  const [cookies, setCookie, removeCookie] = useCookies(["uToken"]);

  const [activeRepo, setActiveRepo] = useState([]);
  const [activeBucket, setActiveBucket] = useState(localStorage.getItem("bucket") ? localStorage.getItem("bucket") : "");
  const [bucketList, setBucketLsit] = useState([]);
  const [matdata, setData] = useState(localStorage.getItem("file") ? localStorage.getItem("file") : "");
  const [isLoading, setIsloading] = useState(false);

  const [cpage, setCpage] = useState("main");

  useEffect(() => {
    const config = {
      headers: { "content-type": "application/json", Authorization: cookies.uToken },
    };

    Axios.post("http://127.0.0.1:8000/get-all-buckets", {}, config)
      .then((response) => {
        // console.log(response.data);
        setActiveRepo(response.data);
        setIsloading(false);
      })
      .catch(() => {
        setIsloading(false);
      });
  }, []);

  // Buckets===>

  useEffect(() => {
    setIsloading(true);

    const config = {
      headers: { "content-type": "application/json", Authorization: cookies.uToken },
    };

    Axios.post("http://127.0.0.1:8000/get-all-filenames", { bucket_name: activeBucket }, config)
      .then((response) => {
        // console.log("buckets Detail==>");
        // console.log(response.data);
        setBucketLsit(response.data);
        setIsloading(false);
      })
      .catch(() => {
        setIsloading(false);
      });
  }, [activeBucket]);

  useEffect(() => {
    localStorage.setItem("bucket", activeBucket);
    localStorage.setItem("file", matdata);
    props.activerep(matdata);
  }, [matdata]);

  // Buckets End

  return (
    <>
      <div className="maincs w-100 " data-aos="fade-up" data-aos-delay="100">
        <div className="d-flex flex-column flex-shrink-0 p-3 w-100" style={{ width: "100%", background: "#0f1b2a" }}>
          <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-light text-decoration-none">
            <span className="fs-4 fw-bold">LOGO</span>
          </a>
          <hr />
          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item text-light">
              <Link to="/" style={{ fontSize: "15px" }} className={`nav-link text-light ${cpage == "main" ? "active" : ""}`} onClick={() => setCpage("main")}>
                <i className="fa fa-home fs-6 pe-3"></i> Home
              </Link>
            </li>
            {activeRepo && activeRepo.length !== 0 && (
              <li className="nav-item dropdown" data-bs-auto-close="outside">
                <a
                  className="nav-link dropdown-toggle text-light"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ fontSize: "15px" }}
                  data-bs-auto-close="outside"
                >
                  <i className="fa fa-bitbucket fs-6 pe-3"></i> Buckets
                </a>
                <ul className="dropdown-menu px-1 bg-dark" aria-labelledby="navbarDropdown" style={{ overflowY: "scroll", height: "300px", width: "100%" }} data-bs-auto-close="outside">
                  {activeRepo &&
                    activeRepo.map((ini, i) => {
                      return (
                        <li key={i} className="nav-item dropdown" data-bs-auto-close="outside">
                          <a
                            className={`nav-link text-light  ${ini == activeBucket ? "active text-info" : ""}`}
                            href="#"
                            role="button"
                            style={{ fontSize: "15px" }}
                            onClick={() => setActiveBucket(ini)}
                          >
                            {ini}
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </li>
            )}

            {isLoading && (
              <h3 className="text-center py-3">
                <i className="fa fa-spinner fa-spin text-light"></i>
              </h3>
            )}

            {bucketList && bucketList.length !== 0 && (
              <li className="nav-item dropdown" data-bs-auto-close="outside">
                <a
                  className="nav-link dropdown-toggle text-light "
                  href="#"
                  id="navbarDropdown1"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ fontSize: "15px" }}
                  data-bs-auto-close="outside"
                >
                  <i className="fa fa-list fs-6 pe-3"></i> Bucket Files
                </a>
                <ul className="dropdown-menu px-1 bg-dark" aria-labelledby="navbarDropdown1" style={{ overflowY: "scroll", height: "300px", width: "100%" }} data-bs-auto-close="outside">
                  {bucketList &&
                    bucketList.map((ini, i) => {
                      return (
                        <li key={i} className="nav-item dropdown" data-bs-auto-close="outside">
                          <a className={`nav-link text-light  ${ini == matdata ? "active text-info" : ""}`} href="#" role="button" style={{ fontSize: "15px" }} onClick={() => setData(ini)}>
                            {ini}
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </li>
            )}
          </ul>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Dash;
