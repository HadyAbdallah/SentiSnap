import React, { useEffect, useState} from "react";
import styles from "./SignIn.css";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUser } from '../../contexts/UserContext'; // Import the useUser hook

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useUser(); // Get the login function from context
  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .matches(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(gmail\.com|yahoo\.com|outlook\.com)$/i,
        "Invalid email"
      )
      .required("Email is required"),
    password: Yup.string()
      .matches(
        /^.*(?=.{8,})(?=.*[a-zA-Z_])(?=.*\d).*$/i,
        "Password should be at least 8 characters, should have letters, digits, and Special characters"
      )
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => handleLogin(values),
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    setIsFormValid(Object.keys(formik.errors).length === 0 && isFormFilled());
  }, [formik.errors, formik.values]);

  const isFormFilled = () => {
    for (const key in formik.values) {
      if (formik.values.hasOwnProperty(key) && !formik.values[key]) {
        return false;
      }
    }
    return true;
  };

  async function handleLogin(values) {
    try {
      let response = await fetch('http://localhost:8000/api/signin', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Accept": 'application/json'
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      const data = await response.json();
      //localStorage.setItem('token', data.token); // Save JWT token in localStorage
      if (response.ok) {
        console.warn("Login successful", data);
        localStorage.setItem('token', data.access_token);
        login(data.user); // Save user data to context
        navigate("/home");
      } else {
        setLoginError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again later.");
      console.error("Error logging in:", error);
    }
  }

  return (
    <section className="signin">
      <div className="row">
        <div className="col-md-6 d-none d-md-block">
          <div className="backgroudPic">
            <h1 className="signHeader">SentiSnap</h1>
          </div>
        </div>
        <div className="col-md-6">
          <div className="center">
            <div className="content">
              <h2>Login</h2>
              <form
                onSubmit={formik.handleSubmit}
                action=""
                className="formSign"
              >
                <div className="row g-3">
                  <div className="col-md-12">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="input-control"
                      placeholder="Enter your email..."
                      onChange={formik.handleChange}
                      value={formik.values.email}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.email && formik.touched.email && (
                      <span className="d-block text-danger text-start mt-1">
                        {formik.errors.email}
                      </span>
                    )}
                  </div>
                  <div className="col-md-12">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="input-control"
                      placeholder="Enter your password..."
                      onChange={formik.handleChange}
                      value={formik.values.password}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.password && formik.touched.password && (
                      <span className="d-block text-danger text-start mt-1">
                        {formik.errors.password}
                      </span>
                    )}
                  </div>
                </div>
                {loginError && (
                  <div className="text-danger text-center mt-2">
                    {loginError}
                  </div>
                )}
                <button type="submit" className="signInButton" disabled={!isFormValid}>
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
