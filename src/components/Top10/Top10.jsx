import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Top10.css';

export default function Top10() {
  const [category, setCategory] = useState('clothes');
  const [topListClothes, setTopListClothes] = useState([]);
  const [topListFood, setTopListFood] = useState([]);
  const [topListMovies, setTopListMovies] = useState([]);
  const [topListBooks, setTopListBooks] = useState([]);
  const [topListOther, setTopListOther] = useState([]);

  // State to track loading state for each category
  const [loadingClothes, setLoadingClothes] = useState(false);
  const [loadingFood, setLoadingFood] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingOther, setLoadingOther] = useState(false);

  useEffect(() => {
    // Fetch top 10 data initially when component mounts
    fetchTop10('clothes');
    fetchTop10('food');
    fetchTop10('movies');
    fetchTop10('books');
    fetchTop10('other');
  }, []);

  const fetchTop10 = async (selectedCategory) => {
    try {
      // Set loading state to true while fetching data
      switch (selectedCategory) {
        case 'clothes':
          setLoadingClothes(true);
          break;
        case 'food':
          setLoadingFood(true);
          break;
        case 'movies':
          setLoadingMovies(true);
          break;
        case 'books':
          setLoadingBooks(true);
          break;
        case 'other':
          setLoadingOther(true);
          break;
        default:
          break;
      }

      const response = await fetch('http://localhost:8000/api/top10', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // Update state based on category
      switch (selectedCategory) {
        case 'clothes':
          setTopListClothes(data.top);
          setLoadingClothes(false); // Set loading state back to false after data fetch
          break;
        case 'food':
          setTopListFood(data.top);
          setLoadingFood(false);
          break;
        case 'movies':
          setTopListMovies(data.top);
          setLoadingMovies(false);
          break;
        case 'books':
          setTopListBooks(data.top);
          setLoadingBooks(false);
          break;
        case 'other':
          setTopListOther(data.top);
          setLoadingOther(false);
          break;
        default:
          break;
      }

    } catch (error) {
      console.error(`Error fetching top 10 for ${selectedCategory}:`, error);

      // Ensure loading state is reset in case of error
      switch (selectedCategory) {
        case 'clothes':
          setLoadingClothes(false);
          break;
        case 'food':
          setLoadingFood(false);
          break;
        case 'movies':
          setLoadingMovies(false);
          break;
        case 'books':
          setLoadingBooks(false);
          break;
        case 'other':
          setLoadingOther(false);
          break;
        default:
          break;
      }
    }
  };

  const handleTabClick = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  return (
    <section className="top10">
      <div className="container">
        <h2 className="top10Header">Top 10</h2>
        <nav className="navLinks">
          <div className="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              className={`nav-link ${category === 'clothes' ? 'active' : ''}`}
              onClick={() => handleTabClick('clothes')}
            >
              Clothes
            </button>
            <button
              className={`nav-link ${category === 'food' ? 'active' : ''}`}
              onClick={() => handleTabClick('food')}
            >
              Food
            </button>
            <button
              className={`nav-link ${category === 'movies' ? 'active' : ''}`}
              onClick={() => handleTabClick('movies')}
            >
              Movies
            </button>
            <button
              className={`nav-link ${category === 'books' ? 'active' : ''}`}
              onClick={() => handleTabClick('books')}
            >
              Books
            </button>
            <button
              className={`nav-link ${category === 'other' ? 'active' : ''}`}
              onClick={() => handleTabClick('other')}
            >
              Other
            </button>
          </div>
        </nav>
        <div className="tab-content" id="nav-tabContent">
          <div
            className={`tab-pane fade ${category === 'clothes' ? 'show active' : ''}`}
            id="nav-text"
            role="tabpanel"
            aria-labelledby="nav-home-tab"
            tabIndex="0"
          >
            {loadingClothes && <Spinner />} {/* Display spinner while loading */}
            <div className="textContent text-center">
              {topListClothes.map((item, index) => (
                <div key={index} className="resultBox">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="top10PostNumber">{index + 1}</div>
                    </div>
                    <div className="col-md-8">
                      <h3>Analysis Result</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <p className="sameAsInput m-auto mb-2"><a href={item.url} target='_blank'>{item.url}</a></p>
                    </div>
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-4">
                          <p><h4 className='' style={{ color: "#008000" }}>Positive:</h4> {item.positive_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#FF0000" }}>Negative:</h4>  {item.negative_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#8B8000" }}>None:</h4> {item.none_comments_percentage}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`tab-pane fade ${category === 'food' ? 'show active' : ''}`}
            id="nav-url"
            role="tabpanel"
            aria-labelledby="nav-profile-tab"
            tabIndex="0"
          >
            {loadingFood && <Spinner />} {/* Display spinner while loading */}
            <div className="urlContent text-center">
              {topListFood.map((item, index) => (
                <div key={index} className="resultBox">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="top10PostNumber">{index + 1}</div>
                    </div>
                    <div className="col-md-8">
                      <h3>Analysis Result</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <p className="sameAsInput m-auto mb-2"><a href={item.url} target='_blank'>{item.url}</a></p>
                    </div>
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-4">
                          <p><h4 className='' style={{ color: "#008000" }}>Positive:</h4> {item.positive_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#FF0000" }}>Negative:</h4>  {item.negative_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#8B8000" }}>None:</h4> {item.none_comments_percentage}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`tab-pane fade ${category === 'movies' ? 'show active' : ''}`}
            id="nav-text"
            role="tabpanel"
            aria-labelledby="nav-home-tab"
            tabIndex="0"
          >
            {loadingMovies && <Spinner />} {/* Display spinner while loading */}
            <div className="textContent text-center">
              {topListMovies.map((item, index) => (
                <div key={index} className="resultBox">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="top10PostNumber">{index + 1}</div>
                    </div>
                    <div className="col-md-8">
                      <h3>Analysis Result</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <p className="sameAsInput m-auto mb-2"><a href={item.url} target='_blank'>{item.url}</a></p>
                    </div>
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-4">
                          <p><h4 className='' style={{ color: "#008000" }}>Positive:</h4> {item.positive_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#FF0000" }}>Negative:</h4>  {item.negative_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#8B8000" }}>None:</h4> {item.none_comments_percentage}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`tab-pane fade ${category === 'books' ? 'show active' : ''}`}
            id="nav-text"
            role="tabpanel"
            aria-labelledby="nav-home-tab"
            tabIndex="0"
          >
            {loadingBooks && <Spinner />} {/* Display spinner while loading */}
            <div className="textContent text-center">
              {topListBooks.map((item, index) => (
                <div key={index} className="resultBox">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="top10PostNumber">{index + 1}</div>
                    </div>
                    <div className="col-md-8">
                      <h3>Analysis Result</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <p className="sameAsInput m-auto mb-2"><a href={item.url} target='_blank'>{item.url}</a></p>
                    </div>
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-4">
                          <p><h4 className='' style={{ color: "#008000" }}>Positive:</h4> {item.positive_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#FF0000" }}>Negative:</h4>  {item.negative_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#8B8000" }}>None:</h4> {item.none_comments_percentage}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`tab-pane fade ${category === 'other' ? 'show active' : ''}`}
            id="nav-text"
            role="tabpanel"
            aria-labelledby="nav-home-tab"
            tabIndex="0"
          >
            {loadingOther && <Spinner />} {/* Display spinner while loading */}
            <div className="textContent text-center">
              {topListOther.map((item, index) => (
                <div key={index} className="resultBox">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="top10PostNumber">{index + 1}</div>
                    </div>
                    <div className="col-md-8">
                      <h3>Analysis Result</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <p className="sameAsInput m-auto mb-2"><a href={item.url} target='_blank'>{item.url}</a></p>
                    </div>
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-4">
                          <p><h4 className='' style={{ color: "#008000" }}>Positive:</h4> {item.positive_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#FF0000" }}>Negative:</h4>  {item.negative_comments_percentage}%</p>
                        </div>
                        <div className="col-md-4">
                          <p> <h4 className='' style={{ color: "#8B8000" }}>None:</h4> {item.none_comments_percentage}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
