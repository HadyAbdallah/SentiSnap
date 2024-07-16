import styles from "./Posts.css";
import React, { useState, useEffect } from "react";
import { Pie } from 'react-chartjs-2';
import { Tooltip } from 'react-tooltip'; // Import Tooltip
import { useUser } from '../../contexts/UserContext'; // Import the custom hook

export default function Posts() {
  const [chartData, setChartData] = useState([]);
  const [analysisDetails, setAnalysisDetails] = useState([]);
  const [userName, setUserName] = useState({ firstName: "", lastName: "" });
  const [showModalNegative, setShowModalNegative] = useState(false);
  const [showModalPositive, setShowModalPositive] = useState(false);
  const [positiveComments, setPositiveComments] = useState([]);
  const [negativeComments, setNegativeComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useUser(); // Access the current user information

  useEffect(() => {
    handlePosts();
  }, [user]);

  const handlePosts = async () => {
    if (user) {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/get_posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        if (data && data.analysis_details && data.analysis_details.length > 0) {
          const firstUserDetail = data.analysis_details[0].user_details;
          setUserName({ firstName: firstUserDetail.first_name, lastName: firstUserDetail.last_name });
          console.log("User name set to: ", { firstName: firstUserDetail.first_name, lastName: firstUserDetail.last_name });
          setAnalysisDetails(data.analysis_details);

          const chartDataArray = data.analysis_details.map(detail => ({
            labels: ['Positive', 'Negative', 'None'],
            datasets: [
              {
                label: 'Comments Percentage',
                data: [detail.positive_comments_percentage, detail.negative_comments_percentage, detail.none_comments_percentage],
                backgroundColor: ['#4caf50', '#f44336', '#ffeb3b'],
              },
            ],
          }));

          setChartData(chartDataArray);

          // Assuming positive_comments and negative_comments are arrays
          setPositiveComments(data.analysis_details.map(detail => detail.positive_comments || []));
          setNegativeComments(data.analysis_details.map(detail => detail.negative_comments || []));

          setLoading(false);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error analyzing URL:", error);
      }
    }
  };

  const truncateUrl = (url, maxLength = 30) => {
    if (url.length <= maxLength) {
      return url;
    }
    return url.substring(0, maxLength) + '...';
  };

  const handlePositiveClick = (positiveComments) => {
    setPositiveComments(positiveComments);
    setShowModalPositive(true);
  };

  const handleNegativeClick = (negativeComments) => {
    setNegativeComments(negativeComments);
    setShowModalNegative(true);
  };

  const handleCloseModalPositive = () => {
    setShowModalPositive(false);
  };

  const handleCloseModalNegative = () => {
    setShowModalNegative(false);
  };

  return (
    <section className="posts">
      <div className="container">
        <h2 className="postsHeader">Posts</h2>
        {loading && <Spinner />} {/* Display spinner while loading */}
        {analysisDetails.map((detail, index) => (
          <div className="resultBox" key={index}>
            <div className="resultHeader">
              <div className="profile">
                <span className="profileName">
                  {detail.user_details.first_name ? detail.user_details.first_name.charAt(0).toUpperCase() : ''}
                </span>
              </div>
              <div className="titleContainer d-inline-block">
                <h3 className="userName">{detail.user_details.first_name} {detail.user_details.last_name}</h3>
              </div>
              <h4 className="title">{detail.title}</h4>
            </div>
            <div className="row">
              <div className="col-md-6">
                <p className="sameAsInput">
                  <a href={detail.url} target='_blank' data-tooltip-id={`tooltip-${index}`} data-tooltip-content={detail.url}>
                    {truncateUrl(detail.url)}
                  </a>
                </p>
                <div className="row mt-5">
                  <div className="col-md-12">
                    <button
                      className="commentBtn"
                      onClick={() => handlePositiveClick(detail.positive_comments)}
                    >
                      Show Positive Comments
                    </button>
                  </div>
                  <div className="col-md-12">
                    <button
                      className="commentBtn"
                      onClick={() => handleNegativeClick(detail.negative_comments)}
                    >
                      Show Negative Comments
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                {chartData[index] && (
                  <Pie
                    data={chartData[index]}
                    options={{
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top',
                        }
                      },
                      maintainAspectRatio: false
                    }}
                    width={250}
                    height={250}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
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
                {positiveComments.map((comment, idx) => (
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
                {negativeComments.map((comment, idx) => (
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
