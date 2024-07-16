import React, { useEffect, useState } from "react";
import styles from "./Home.css";

export default function Home() {
  const [showInstructions, setShowInstructions] = useState(false);

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <section className="home position-relative">
      <div className="container ">
        <div className="row">
          <div className="col-md-6">
            <p className="slogan">
              Navigating Emotions, Empowering Decisions - Your Shortcut to
              Insightful Social media Sentiments!
            </p>
            <button
              className="instructionsBtn"
              type="submit"
              id="sbmtBtn"
              onClick={toggleInstructions}
            >
              Instructions
            </button>
          </div>
          <div className="col-md-6">
            <img className="homeImg" src={require("../../assets/imgs/Screenshot 2024-04-19 012141.png")} alt="" />
          </div>
        </div>
      </div>
      {/*& Instructions card code &*/}
      <div
        className={`instructionsCard position-absolute start-0 top-0 h-100 w-100 d-flex justify-content-center align-items-center ${
          showInstructions ? "d-block" : "d-none"
        }`}
      >
        <div className="cardContent bg-white rounded-2 shadow-lg p-4">
          <header className="w-100 mb-2">
            <button
              className="btn border-0"
              id="closeBtn"
              onClick={toggleInstructions}
            >
              <i className="fa-solid fa-xmark fs-3"></i>
            </button>
          </header>
          <p className="instructionText">
            How to do analysis on a specific link :
          </p>
          <ul className="list-unstyled listedErrors ps-2">
            <li>
              <span>
                <i className="fa-solid fa-circle-arrow-right me-2 fs-5"></i>
              </span>
              Go to analysis tab
            </li>
            <li>
              <span>
                <i className="fa-solid fa-circle-arrow-right me-2 fs-5"></i>
              </span>
              Put the link you want to get its analysis after clicking on URL tab, choose its category, then click analyze !
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
