import React from "react";
import { useState, useEffect } from "react";
import "./master.css";
const Paginate = (props) => {
  const [totalNumbers, setTotalNumber] = useState(10);

  useEffect(() => {
    const updateTotalNumbers = () => {
      // You can adjust the logic based on your requirements
      const screenWidth = window.innerWidth;
      let updatedTotalNumbers;

      // Add your own logic to determine the totalNumbers based on screenWidth
      // For example, you can set different totalNumbers for different screen sizes
      if (screenWidth >= 1200) {
        updatedTotalNumbers = 8;
      } else if (screenWidth >= 768) {
        updatedTotalNumbers = 3;
      } else {
        updatedTotalNumbers = 2;
      }

      setTotalNumber(updatedTotalNumbers);
    };

    // Initial update
    updateTotalNumbers();

    // Event listener for window resize
    window.addEventListener("resize", updateTotalNumbers);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateTotalNumbers);
    };
  }, []); // Empty dependency array means this effect will run once on mount

  return (
    <nav aria-label="Page navigation example">
      <ul className={`pagination ${totalNumbers > 2 ? " pagination-lg" : "pagination-sm"} justify-content-center`}>
        <li className={`page-item ${props.cactive === 1 ? "disabled " : ""}`}>
          <span
            className={`page-link ${props.cactive === 1 ? "text-secondary bg-muted " : "text-info"}`}
            onClick={() => props.pagecount(props.cactive - 1)}
            aria-disabled={`${props.cactive === 1 ? "true" : ""}`}
          >
            Prev
          </span>
        </li>

        {totalNumbers >= 8 && props.total <= 50 ? (
          <>
            {[...Array(props.total)].map((ini, i) => {
              return (
                <li key={i} className={`page-item ${props.cactive === i + 1 ? "active" : ""}`}>
                  <span className="page-link text-info" onClick={() => props.pagecount(i + 1)}>
                    {i + 1}
                  </span>
                </li>
              );
            })}
          </>
        ) : (
          <>
            {props.cactive > 2 && (
              <li key={1} className={`page-item ${props.cactive === 1 ? "active" : ""}`}>
                <span className="page-link text-info" onClick={() => props.pagecount(1)}>
                  {1}
                </span>
              </li>
            )}
            {props.cactive > 2 && (
              <li className={`page-item`}>
                <span className="page-link text-info">...</span>
              </li>
            )}

            {[...Array(props.total)].slice(Math.max(0, props.cactive - 2), Math.min(props.total, props.cactive + totalNumbers)).map((_, i) => {
              const pageNumber =
                i === totalNumbers + 1 && props.cactive !== 1 ? props.total : Math.max(1, Math.min(props.total, props.cactive !== 1 ? props.cactive - 2 + i + 1 : props.cactive - 1 + i + 1));
              let isEllipsis = false;
              if (props.cactive == 1) {
                isEllipsis = i === totalNumbers;
              } else {
                isEllipsis = i === totalNumbers + 1;
              }
              return (
                <>
                  <li key={props.total * 2 - 1} className={`page-item ${props.cactive === pageNumber ? "active" : ""}`}>
                    <span className="page-link text-info" onClick={() => props.pagecount(pageNumber)}>
                      {isEllipsis ? "..." : pageNumber}
                    </span>
                  </li>
                  {isEllipsis && props.cactive !== 1 && (
                    <li key={i} className={`page-item ${props.cactive === pageNumber ? "active" : ""}`}>
                      <span className="page-link text-info" onClick={() => props.pagecount(pageNumber)}>
                        {pageNumber}
                      </span>
                    </li>
                  )}
                  {isEllipsis && props.cactive == 1 && (
                    <li key={props.total} className={`page-item ${props.cactive === props.total ? "active" : ""}`}>
                      <span className="page-link text-info" onClick={() => props.pagecount(props.total)}>
                        {props.total}
                      </span>
                    </li>
                  )}
                </>
              );
            })}
          </>
        )}
        <li className={`page-item ${props.cactive === props.total ? "disabled" : ""}`}>
          <span
            className={`page-link ${props.cactive === props.total ? "text-secondary bg-muted " : "text-info"}`}
            onClick={() => props.pagecount(props.cactive + 1)}
            aria-disabled={`${props.cactive === props.total ? "true" : ""}`}
          >
            Next
          </span>
        </li>
      </ul>
    </nav>
  );
};

export default Paginate;
