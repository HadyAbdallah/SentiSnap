import React from "react";
import styles from "./Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="socialMedia">
          <div className="logo">
            <img
              src={require("../../assets/imgs/sentiment-analysis.png")}
              alt="logo"
            />
            <h1>
              SentiSnap<span>.</span>
            </h1>
          </div>
          <p>
            SentiSnap is a an Arabic sentiment tool that aims to understanding
            people's feelings and opinions.
          </p>
          <h3>Social Media</h3>
          <ul className="socialLinksFooter">
            <li>
              <a href="https://twitter.com/">
                <span>
                  <i className="fa-brands fa-twitter"></i>
                </span>
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/">
                <span>
                  <i className="fa-brands fa-facebook-f"></i>
                </span>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/?hl=en">
                <span>
                  <i className="fa-brands fa-instagram"></i>
                </span>
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/">
                <span>
                  <i className="fa-brands fa-linkedin"></i>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div className="quickLinksSection">
          <h2>Feedback</h2>
          <p>
            Give us your feedback about our website, it means so much to us!
          </p>
          <div className="inputSubscription ">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter Your Message.."
            />
            <button className="btnFooter">
              <span>
                <i className="fa-solid fa-envelope"></i>
              </span>{" "}
              Send
            </button>
          </div>
          
        </div>
        <div className="getInTouch">
          <h2>Get in Touch</h2>
          <ul>
            <li>
              <span>
                <i className="fa-solid fa-location-dot"></i>
              </span>
              <p>Ad Doqi, Dokki, Giza Government 3750210</p>
            </li>
            <li>
              <span>
                <i className="fa-solid fa-envelope"></i>
              </span>
              <a href="">noranahmed5617@gmail.com</a>
            </li>
            <li>
              <span>
                <i className="fa-solid fa-phone"></i>
              </span>
              <a href="">+20 111 574 3944</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
