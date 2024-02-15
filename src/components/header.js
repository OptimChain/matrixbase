import React from "react";
import { useCookies } from "react-cookie";
import toast, { Toaster } from "react-hot-toast";
const Header = (props) => {
  const [cookies, setCookie, removeCookie] = useCookies(["uToken"]);
  const handleGitAuth = () => {
    window.open("http://127.0.0.1:8000/github-auth", "_blank");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#0f1b2a" }}>
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <form className="d-flex w-75 ">
            <input
              className="form-control me-2 w-100 border-0 rounded-pill text-light"
              style={{ background: "#000716" }}
              type="search"
              // style={{ backgroundColor: "#101014" }}
              placeholder="Search"
              aria-label="Search"
              value={props.cSearch}
              onChange={(e) => props.searchTerm(e.target.value)}
            />
          </form>
          <div className="d-flex justify-items-end">
            {/* <button
              className="btn btn-dark me-2 border-1 border-light bg-none"
              onClick={() => {
                removeCookie("uToken");
              }}
            >
              Logout <i className="fa fa-logout"></i>
            </button> */}
            {cookies.uToken !== undefined && cookies.uToken.length !== 0 && (
              <button
                className="btn fw-bold py-2  btn-dark d-flex align-items-center justify-content-center me-2"
                aria-current="page"
                href="#"
                onClick={() =>
                  toast((t) => (
                    <span>
                      <b>Log Out? </b>
                      <a
                        className="btn bg-info text-light  mx-2"
                        onClick={() => {
                          removeCookie("uToken");
                          toast.dismiss(t.id);
                          window.location.href = "/";
                        }}
                      >
                        <i className="fa fa-check"></i>
                      </a>
                      <a className="btn bg-dark text-light" onClick={() => toast.dismiss(t.id)}>
                        <i className="fa fa-times"></i>
                      </a>
                    </span>
                  ))
                }
              >
                Logout <i className="fa fa-sign-out ps-2" />
              </button>
            )}

            {/* <button type="button" className="btn  fw-bold py-2  btn-outline-dark d-flex align-items-center justify-content-center " onClick={handleGitAuth}>
              <i className=" fa fa-github pe-2 fs-4"></i> Connect with GitHub
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
