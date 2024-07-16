import React, { useState, useEffect } from "react";
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import "./Search.css";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showModalPositive, setShowModalPositive] = useState(false);
  const [showModalNegative, setShowModalNegative] = useState(false);
  const [positiveComments, setPositiveComments] = useState([]);
  const [negativeComments, setNegativeComments] = useState([]);
  const [chartData, setChartData] = useState([]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search: searchQuery,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

      const newData = data.map(item => ({
        labels: ['Positive', 'Negative', 'None'],
        datasets: [
          {
            label: 'Comments Percentage',
            data: [
              item.positive_comments_percentage,
              item.negative_comments_percentage,
              item.none_comments_percentage,
            ],
            backgroundColor: ['#4caf50', '#f44336', '#ffeb3b'],
          },
        ],
      }));

      setChartData(newData);
    } catch (error) {
      console.error("Error analyzing URL:", error);
    }

    setLoading(false);
  };

  const handlePositiveClick = (commentsString) => {
    const commentsArray = JSON.parse(commentsString);
    setPositiveComments(commentsArray);
    setShowModalPositive(true);
  };

  const handleCloseModalPositive = () => {
    setShowModalPositive(false);
  };

  const handleNegativeClick = (commentsString) => {
    const commentsArray = JSON.parse(commentsString);
    setNegativeComments(commentsArray);
    setShowModalNegative(true);
  };

  const handleCloseModalNegative = () => {
    setShowModalNegative(false);
  };

  return (
    <>
      <section className="search">
        <div className="container">
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search..."
              className="search-bar"
            />
            <button onClick={handleSearch} className="search-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-search"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          <div className="postsReturned">
            {loading ? (
              <div className="spinner"></div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <div className="resultBox" key={index}>
                  <div className="profile-title-container">
                    <div className="profile">
                      <span className="profileName text-center">
                        {result.publisher_username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3>{result.publisher_username}</h3>
                  </div>
                  <h5 className="title ">{result.post_caption}</h5>
                  <div className="row">
                    <div className="col-md-12 mb-2 text-center">
                      <p className="sameAsInput m-auto mb-2">
                        <a target="_blank" href={result.url}>
                          {result.url}
                        </a>
                      </p>
                    </div>
                    <div className="col-md-12 mb-2">
                      {chartData.length > 0 && (
                        <div className="pie-chart-container">
                          <Pie
                            data={chartData[index]}
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
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 search2Btn ">
                      <button
                        className="commentBtn me-0 mb-0"
                        onClick={() => handlePositiveClick(result.positive_comments)}
                      >
                        Show Positive Comments
                      </button>
                    </div>
                    <div className="col-md-6 search2Btn ">
                      <button
                        className="commentBtn me-0 mb-0"
                        onClick={() => handleNegativeClick(result.negative_comments)}
                      >
                        Show Negative Comments
                      </button>
                    </div>
                  </div>
                </div>

              ))
            ) : null}
          </div>
        </div>

        {showModalPositive && (
          <div className="modal " tabIndex="-1" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Positive Comments in this post:</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModalPositive}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body comments-wrapper">
                  {positiveComments.map((comment, index) => (
                    <div className="comment" key={index}>
                      {comment}
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn closeBtn"
                    onClick={handleCloseModalPositive}
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showModalNegative && (
          <div className="modal " tabIndex="-1" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Negative Comments in this post:</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModalNegative}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body comments-wrapper">
                  {negativeComments.map((comment, index) => (
                    <div className="comment" key={index}>
                      {comment}
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn closeBtn"
                    onClick={handleCloseModalNegative}
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
