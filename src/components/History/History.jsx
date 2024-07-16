import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./History.css";
import { useUser } from '../../contexts/UserContext'; // Import the custom hook
import { Pie } from 'react-chartjs-2';
import { Tooltip } from 'react-tooltip'; // Import Tooltip

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [showResult, setShowResult] = useState(false); // State to track if result should be shown
  const [historyURLData, setHistoryURLData] = useState([]); // Initialize to empty array instead of null
  const [showModalPositive, setShowModalPositive] = useState(false);
  const [showModalNegative, setShowModalNegative] = useState(false);
  const [positiveComments, setPositiveComments] = useState([]);
  const [negativeComments, setNegativeComments] = useState([]);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingURL, setLoadingURL] = useState(false);
  const { user } = useUser(); // Access the current user information

  useEffect(() => {
    // Call the function to load text history by default
    handleUserHistoryTextClick();
  }, []);

  const handleUserHistoryTextClick = async () => {
    if (user) { // Ensure user is available
      try {
        setLoadingText(true);
        const response = await fetch('http://localhost:8000/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id, // Pass the current user's ID
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data); // Log the entire response for debugging

        if (data.history && Array.isArray(data.history)) {
          const results = data.history.map(item => {
            try {
              // Check if item.result is already an object
              const result = typeof item.result === 'object' ? item.result : JSON.parse(item.result);
              return { ...item, result };
            } catch (parseError) {
              throw new Error("Error parsing JSON: " + parseError.message);
            }
          });


          setHistoryData(results);
          
          setShowResult(true); // Show result when analysis is done
          setLoadingText(false);
        } else {
          throw new Error("Missing 'history' field or it is not an array in response");
        }
      } catch (error) {
        console.error("Error analyzing text:", error);
      }
    }
  };

  const handleUserHistoryURLClick = async () => {
    if (user) { // Ensure user is available
      try {
        setLoadingURL(true);
        const response = await fetch('http://localhost:8000/api/history_url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id, // Pass the current user's ID
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data); // Log the entire response for debugging

        if (data.historyURLs && Array.isArray(data.historyURLs)) {
          setHistoryURLData(data.historyURLs);
          
          setShowResult(true); // Show result when analysis is done
          setLoadingURL(false);
        } else {
          throw new Error("Missing 'historyURLs' field or it is not an array in response");
        }
      } catch (error) {
        console.error("Error fetching history URL:", error);
      }
    }
  };


  // Function to truncate the URL and add tooltip
  const truncateUrl = (url, maxLength = 30) => {
    if (url.length <= maxLength) {
      return url;
    }
    return url.substring(0, maxLength) + '...';
  };

  const handleCloseModalPositive = () => {
    setShowModalPositive(false);
  };

  const handleCloseModalNegative = () => {
    setShowModalNegative(false);
  };

  const handlePositiveClick = (positiveComments) => {
    setPositiveComments(positiveComments);
    setShowModalPositive(true);
  };

  const handleNegativeClick = (negativeComments) => {
    setNegativeComments(negativeComments);
    setShowModalNegative(true);
  };

  return (
    <section className="history">
      <h2 className="historyHeader">History</h2>
      <nav className="navLinks">
        <div className="nav nav-tabs" id="nav-tab" role="tablist">
          <button
            className="nav-link active"
            id="nav-text-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-text"
            type="button"
            role="tab"
            aria-controls="nav-text"
            aria-selected="true"
            onClick={handleUserHistoryTextClick}
          >
            Text
          </button>
          <button
            className="nav-link"
            id="nav-url-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-url"
            type="button"
            role="tab"
            aria-controls="nav-url"
            aria-selected="false"
            onClick={handleUserHistoryURLClick}
          >
            URL
          </button>
        </div>
      </nav>
      <div className="tab-content" id="nav-tabContent">
        <div
          className="tab-pane fade show active"
          id="nav-text"
          role="tabpanel"
          aria-labelledby="nav-text-tab"
          tabIndex="0"
        >
          <div className="textContent text-center">
            {loadingText && <Spinner />} {/* Display spinner while loading */}
            {showResult && historyData.length > 0 ? (
              historyData.map((item, index) => (
                <div key={item.id} className={"resultBox "}>
                  <div className="historyPostNumber ">{index + 1}</div>
                  <h3 className="text-center">Analysis Result </h3>
                  <div className="row">
                    <div className="col-md-12">
                      <div className={`sameAsInput fs-4 fw-bold ${item.sentence.length > 5 ? 'scrollable' : ''}`}>
                        <p>{item.sentence}</p>
                      </div>
                    </div>
                    <div className="col-md-12">
                      {item.result && (
                        <div>
                          <p className="fw-bold fs-5 text-center">
                            <p><span style={{ "color": "#4caf50" }}>Positive:</span> {item.result.positive}%</p>
                            <p><span style={{ "color": "#f44336" }}>Negative:</span> {item.result.negative}%</p>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Please Wait</p>
            )}
          </div>
        </div>
        <div
          className="tab-pane fade"
          id="nav-url"
          role="tabpanel"
          aria-labelledby="nav-url-tab"
          tabIndex="0"
        >
          {loadingURL && <Spinner />} {/* Display spinner while loading */}
          {showResult && historyURLData.length > 0 && historyURLData.map((item, index) => (
            <div key={index} className="urlContent text-center">
              <div className={"resultBox"}>
                <div className="historyPostNumber ">{index + 1}</div>
                <h3 className="text-center">Analysis Result </h3>
                <div className="row">
                  <div className="col-md-6 d-flex justify-content-center align-items-center flex-column">
                    <p className="sameAsInput mb-1 mt-3 d-block">
                      <a href={item.url} target='_blank' >
                        {truncateUrl(item.url)}
                      </a>
                    </p>
                    <div className="row ">
                      <div className="col-md-12 mb-1">
                        <button
                          className="commentBtn m-auto"
                          onClick={() => handlePositiveClick(item.positive_comments)}
                        >
                          Show Positive Comments
                        </button>
                      </div>
                      <div className="col-md-12">
                        <button
                          className="commentBtn m-auto"
                          onClick={() => handleNegativeClick(item.negative_comments)}
                        >
                          Show Negative Comments
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 ">
                    <Pie
                      data={{
                        labels: ['Positive', 'Negative', 'None'],
                        datasets: [
                          {
                            data: [
                              item.positive_comments_percentage,
                              item.negative_comments_percentage,
                              item.none_comments_percentage
                            ],
                            backgroundColor: [
                              '#4caf50',
                              '#f44336', '#ffeb3b'
                            ],
                            hoverBackgroundColor: [
                              '#4caf50',
                              '#f44336', '#ffeb3b'
                            ]
                          }
                        ]
                      }}
                      options={{
                        plugins: {
                          legend: {
                            display: true,
                            position: 'top',
                            align: 'center',
                            labels: {
                              boxWidth: 30,
                              boxHeight: 20,
                              padding: 15,
                              usePointStyle: true,
                              pointStyle: 'rectRounded',
                              font: {
                                size: 14,
                              },
                            },
                          },
                        },
                        layout: {
                          padding: {
                            left: 10,
                            right: 10,
                            top: 10,
                            bottom: 10,
                          },
                        },
                      }}
                      width={200} // Set custom width
                      height={200} // Set custom height
                    />

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModalPositive && (
        <div className="modal" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Positive Comments</h5>
                <button type="button" className="btn-close" onClick={handleCloseModalPositive} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {Array.isArray(positiveComments) && positiveComments.map((comment, idx) => (
                  <div key={idx} className="comment">{comment}</div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn closeBtn" onClick={handleCloseModalPositive}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModalNegative && (
        <div className="modal" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Negative Comments</h5>
                <button type="button" className="btn-close" onClick={handleCloseModalNegative} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {Array.isArray(negativeComments) && negativeComments.map((comment, idx) => (
                  <div key={idx} className="comment">{comment}</div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn closeBtn" onClick={handleCloseModalNegative}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


// Example spinner component
const Spinner = () => (
  <div className="d-flex justify-content-center align-items-center" >
    <div className="spinner-border" style={{ color: '#f2690d' }} role="status">
      <span className="sr-only  m-auto">Loading...</span>
    </div>
  </div>

);