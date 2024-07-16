import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { useUser } from '../../contexts/UserContext'; // Import the custom hook
import styles from "./Analysis.css";
import { Pie } from 'react-chartjs-2';
import { FaSpinner } from 'react-icons/fa';

export default function Analysis({ onShare }) {
  const [inputValue, setInputValue] = useState(""); // State to hold input value
  const [error, setError] = useState(""); // State to hold error message
  const [showResult, setShowResult] = useState(false); // State to track if result should be shown
  const [showResultUrl, setShowResultUrl] = useState(false); // State to track if result should be shown
  const [showModal, setShowModal] = useState(false); // State to track if modal should be shown
  const [modalValue, setModalValue] = useState(""); // State to hold input value
  const [urlValue, setUrlValue] = useState(""); // State to hold URL input value
  const [urlError, setUrlError] = useState(""); // State to hold URL error message
  const [result, setResult] = useState(null);
  const [category, setCategory] = useState(""); // State to hold selected category
  const [showModalFrequent, setShowModalFrequent] = useState(false); // State to track if modal should be shown
  const [freq, setFreq] = useState([]);
  const [chartData, setChartData] = useState(null); // State to hold chart data
  const [analysisDetails, setAnalysisDetails] = useState(null);
  const [sentimentColor, setSentimentColor] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [showModalPositive, setShowModalPositive] = useState(false);
  const [showModalNegative, setShowModalNegative] = useState(false);
  const [positiveComments, setPositiveComments] = useState([]);
  const [negativeComments, setNegativeComments] = useState([]);
  const [alertMessage, setAlertMessage] = useState(""); // State to hold alert message
  const [scrappingError, setScrappingError] = useState("");
  const { user } = useUser(); // Access the current user information

  // Function to validate Arabic text
  const validateArabicText = (inputText) => {
    // If input is empty, consider it invalid
    if (!inputText.trim()) return false;

    const arabicRegex = /^[\u0600-\u06FF\s]*$/; // Regular expression for Arabic text
    return arabicRegex.test(inputText);
  };

  // Function to handle input change and validation
  const handleInputChange = (event) => {
    const text = event.target.value;
    setInputValue(text);
    setError(validateArabicText(text) ? "" : "Please enter Arabic text only.");
    setShowResult(false); // Hide result when input changes
  };

  // Function to validate URL
  const validateURL = (inputURL) => {
    // If input is empty, consider it invalid
    if (!inputURL.trim()) return false;

    // Regular expression to match Facebook or Instagram URLs
    const urlRegExp =
      /^(https?:\/\/)?(www\.)?(facebook|instagram)\.(co|com)(\/[\w\-\/]*)?(\?.*)?$/;

    return urlRegExp.test(inputURL);
  };

  // Function to handle input change and validation for URL input
  const handleUrlChange = (event) => {
    const url = event.target.value;
    setUrlValue(url);
    setUrlError(
      validateURL(url) ? "" : "Please enter a valid Instagram or Facebook URL."
    );
    setShowResultUrl(false); // Hide result when URL input changes
    setScrappingError(false);
  };

  const handleAnalyzeClick = async () => {
    if (inputValue.trim() && !error && user) {
      setLoadingText(true);
      try {
        const response = await fetch("http://localhost:8000/api/analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sentence: inputValue,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const resultData = JSON.parse(responseData.result);

        if (resultData) {
          setResult(resultData);
          setShowResult(true);
          setSentimentColor(getSentimentColor(resultData.sentiment));
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error analyzing text:", error);
      } finally {
        setLoadingText(false); // Reset loading state for text analysis
      }
    }
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  // Function to handle analyze button click for URL
  const handleAnalyzeClickUrl = async () => {
    setLoadingUrl(true);
    if (urlValue.trim() && !urlError && user && category) {
      try {
        const response = await fetch('http://localhost:8000/api/analysis_URL', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: urlValue,
            userId: user.id,
            category: category,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        if (data.error) {
          // Check for error message in the response
          setAlertMessage(data.error);
          setShowResultUrl(false);
          setScrappingError(true);
        } else if (data) {
          setResult(data.positive_comments_percentage > data.negative_comments_percentage);
          setChartData({
            labels: ['Positive', 'Negative', 'None'],
            datasets: [
              {
                label: 'Comments Percentage',
                data: [data.positive_comments_percentage, data.negative_comments_percentage, data.none_comments_percentage],
                backgroundColor: ['#4caf50', '#f44336', '#ffeb3b'],
              },
            ],
          });

          setPositiveComments(data.positive_comments || []);
          setNegativeComments(data.negative_comments || []);

          setShowResultUrl(true); // Show result when analysis is done
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error analyzing URL:", error);
      } finally {
        setLoadingUrl(false); // Reset loading state for URL analysis
      }
    }
  };

  useEffect(() => {
    console.log(freq);
  }, [freq]);

  useEffect(() => {
    if (result) {
      setSentimentColor(getSentimentColor(result));
    }
  }, [result]);

  // Function to handle share button click
  const handleShareClick = () => {
    setShowModal(true);
  };

  // Function to handle frequent words button click
  const handleFrequentClick = () => {
    setShowModalFrequent(true);
  };

  // Function to handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to determine sentiment color
  const getSentimentColor = (sentiment) => {
    return sentiment === 'positive' ? '#4caf50' : sentiment === 'negative' ? '#f44336' : '#ffeb3b';
  };



  const handleSaveModal = async () => {
    if (user && modalValue.trim()) {
      try {
        console.log("Preparing to send request with data:", {
          userId: user.id,
          title: modalValue,
        });

        const response = await fetch("http://localhost:8000/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            title: modalValue,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Request successful, modal value:', modalValue);
        const data = await response.json();
        setAnalysisDetails(data.analysis_details);
        setShowModal(false); // Close the modal upon successful save

      } catch (error) {
        console.error("Error sharing post:", error);
      }
    } else {
      console.log("Form validation failed. Check user, modalValue, and analysisId.");
    }
  };




  // Function to handle modal frequent close
  const handleCloseModalFrequent = () => {
    setShowModalFrequent(false);
  };

  // Function to handle modal input change
  const handleModalInputChange = (event) => {
    const text = event.target.value;
    setModalValue(text);
  };


  // Positive and Negative buttoms to show comments

  const handlePositiveClick = (commentsString) => {
    setShowModalPositive(true);
  };
  const handleCloseModalPositive = () => {
    setShowModalPositive(false);
  };

  const handleNegativeClick = (commentsString) => {
    setShowModalNegative(true);
  };
  const handleCloseModalNegative = () => {
    setShowModalNegative(false);
  };


  // Function to truncate the URL and add tooltip
  const truncateUrl = (url, maxLength = 30) => {
    if (url.length <= maxLength) {
      return url;
    }
    return url.substring(0, maxLength) + '...';
  };



  return (
    <section className="analysis">
      <h2 className="analysisHeader">Analysis</h2>
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
          aria-labelledby="nav-home-tab"
          tabIndex="0"
        >
          <div className="textContent">
            <input
              type="text"
              name="text"
              id="text"
              className="effect-2"
              placeholder="Enter text..."
              value={inputValue}
              onChange={handleInputChange}
            />

            {error && <div className="error m-auto mt-2">{error}</div>}
            <button
              className="textButton"
              disabled={!inputValue.trim() || error}
              onClick={handleAnalyzeClick} // Analyze button click handler

            >
              {loadingText ? <FaSpinner className="spinner" /> : "Analyze"}
            </button>
          </div>
          {/* Inside the render function */}
          <div className={`resultBox w-25 texttt ${showResult ? "show" : "hide"}`}>
            <div className="row">
              <div className="col-md-12 text-center">
                <h3 className="text-center text-decoration-underline">Analysis Result</h3>
                <div className={`sameAsInput fs-4 fw-bold ${inputValue.length > 5 ? 'scrollable' : ''}`}>
                  <p >{inputValue}</p>
                </div>

              </div>
              <div className="col-md-12">
                {result && (
                  <div>
                    <p className="fw-bold fs-5 text-center">
                      <p><span style={{ "color": "#4caf50" }}>Positive:</span> {result.positive}%</p>
                      <p><span style={{ "color": "#f44336" }}>Negative:</span> {result.negative}%</p>
                    </p>
                  </div>
                )}
                {/* Display other analysis details here as needed */}
              </div>
            </div>
          </div>

        </div>
        <div
          className="tab-pane fade"
          id="nav-url"
          role="tabpanel"
          aria-labelledby="nav-profile-tab"
          tabIndex="0"
        >
          <div className="textContent">
            <input
              type="text"
              name="text"
              id="url"
              className="effect-2"
              placeholder="Enter URL..."
              value={urlValue}
              onChange={handleUrlChange}
            />
            <select id="dropdown" value={category} onChange={handleCategoryChange}>
              <option value="" disabled hidden>
                Category
              </option>
              <option value="Food">Food</option>
              <option value="Clothes">Clothes</option>
              <option value="Movies">Movies</option>
              <option value="Books">Books</option>
              <option value="Other">Other</option>
            </select>
            {urlError && <div className="error m-auto mt-2">{urlError}</div>}
            {alertMessage && scrappingError && (
              <div className="error m-auto mt-2">
                {alertMessage}
              </div>
            )}
            <button
              className="textButton"
              disabled={!urlValue.trim() || urlError || !category}
              onClick={handleAnalyzeClickUrl} // Analyze button click handler
            >
              {loadingUrl ? <FaSpinner className="spinner" /> : "Analyze"}
            </button>
          </div>
          <div className={`resultBox ${showResultUrl ? "show" : "hide"}`}>
            <h3 className="text-center">Analysis Result </h3>
            <div className="row">
              <div className="col-md-6">
                <p className="sameAsInput mb-1 mt-3 d-block">
                  <a href={urlValue} target='_blank' >
                    {truncateUrl(urlValue)}
                  </a>
                </p>
                <div className="row mt-3">
                  <div className="col-md-12">
                    <button
                      className="commentBtn me-0 mb-0"
                      onClick={handlePositiveClick}
                    >
                      Show Positive Comments
                    </button>
                  </div>
                  <div className="col-md-12">
                    <button
                      className="commentBtn me-0 mb-0"
                      onClick={handleNegativeClick}
                    >
                      Show Negative Comments
                    </button>
                  </div>
                </div>
                <button className="shareBtn" onClick={handleShareClick}>
                  Share
                </button>
              </div>
              <div className="col-md-6">
                {chartData && (
                  <Pie
                    data={chartData}
                    options={{
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top',
                        }
                      }
                    }}
                  />
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title Modal */}
      {showModal && (
        <div className="modal " tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter a title for the post: </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="input-control"
                  placeholder="Post title..."
                  value={modalValue}
                  onChange={handleModalInputChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn closeBtn"
                  onClick={handleCloseModal}
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                {modalValue.trim() ? (
                  <Link className="text-decoration-none">
                    <button
                      type="button"
                      className="btn shareBtn"
                      onClick={handleSaveModal}
                    >
                      Save and Share
                    </button>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="btn shareBtn"
                    onClick={handleSaveModal}
                    disabled
                  >
                    Save and Share
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Positive Comments Modal */}
      {showModalPositive && (
        <div className="modal" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Positive Comments</h5>
                <button type="button" className="btn-close" onClick={handleCloseModalPositive} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {positiveComments.map((comment, index) => (
                  <div key={index} className="comment">
                    {comment}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn closeBtn" onClick={handleCloseModalPositive}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Negative Comments Modal */}
      {showModalNegative && (
        <div className="modal" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Negative Comments</h5>
                <button type="button" className="btn-close" onClick={handleCloseModalNegative} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {negativeComments.map((comment, index) => (
                  <div key={index} className="comment">
                    {comment}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn closeBtn" onClick={handleCloseModalNegative}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
