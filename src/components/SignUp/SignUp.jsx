import React, { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./SignUp.css";  // Ensure you have this imported if you're using CSS modules

export default function SignUp() {
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    rePassword: "",
  };

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .matches(/^[a-zA-Z]{3,15}$/i, "Invalid name, must be between 3-15 characters")
      .min(3, "Must be 3 characters or more")
      .max(15, "Must be 15 characters or less")
      .required("First name is required"),
    lastName: Yup.string()
      .matches(/^[a-zA-Z]{3,15}$/i, "Invalid name, must be between 3-15 characters")
      .min(3, "Must be 3 characters or more")
      .max(15, "Must be 15 characters or less")
      .required("Last name is required"),
    email: Yup.string()
      .matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(gmail\.com|yahoo\.com|outlook\.com)$/i, "Invalid email")
      .required("Email is required"),
    password: Yup.string()
      .matches(/^.*(?=.{8,})(?=.*[a-zA-Z_])(?=.*\d).*$/i, "Password should be at least 8 characters, should have letters, digits, and Special characters")
      .required("Password is required"),
    rePassword: Yup.string()
      .required("rePassword is required")
      .oneOf([Yup.ref("password")], "rePassword must match password"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => handleRegister(values),
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(Object.keys(formik.errors).length === 0 && isFormFilled());
  }, [formik.errors, initialValues]);

  const isFormFilled = () => {
    for (const key in formik.values) {
      if (formik.values.hasOwnProperty(key) && !formik.values[key]) {
        return false;
      }
    }
    return true;
  };
  const navigate = useNavigate();
  async function handleRegister(values) {
    let response = await fetch('http://localhost:8000/api/register', {      
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            password_confirmation: values.rePassword,
        }),
    });

    const data = await response.json();
    
    if (response.status === 401) {
        console.error("Error:", data.message); // Print error message
        alert(data.message); // Ask the user to enter a unique email
    } else if (response.status === 201) {
        console.log("Success:", data); // Registration successful
        alert("Registration successful!");
        navigate('/');
         // Notify the user of success
        // Redirect or update the UI as needed
    } else {
        console.error("Unexpected error:", data);
        alert("An unexpected error occurred. Please try again later.");
    }
}


  return (
    <section className="signup">
      <div className="row">
        <div className="col-md-6 d-none d-md-block">
          <div className="backgroudPic">
            <h1 className="signHeader">SentiSnap</h1>
          </div>
        </div>
        <div className="col-md-6">
          <div className="center">
            <div className="content">
              <h2>Create Your Account</h2>
              <h5>Join SentiSnap</h5>
              <form onSubmit={formik.handleSubmit} className="formSign">
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      className="input-control"
                      placeholder="Enter your first name..."
                      onChange={formik.handleChange}
                      value={formik.values.firstName}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.firstName && formik.touched.firstName && (
                      <span className="d-block text-danger text-start mt-1">
                        {formik.errors.firstName}
                      </span>
                    )}
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      className="input-control"
                      placeholder="Enter your last name..."
                      onChange={formik.handleChange}
                      value={formik.values.lastName}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.lastName && formik.touched.lastName && (
                      <span className="d-block text-danger text-start mt-1">
                        {formik.errors.lastName}
                      </span>
                    )}
                  </div>
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
                  <div className="col-md-12">
                    <input
                      type="password"
                      name="rePassword"
                      id="rePassword"
                      className="input-control"
                      placeholder="Enter your password again..."
                      onChange={formik.handleChange}
                      value={formik.values.rePassword}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.rePassword && formik.touched.rePassword && (
                      <span className="d-block text-danger text-start mt-1">
                        {formik.errors.rePassword}
                      </span>
                    )}
                  </div>
                </div>
                <button type="submit" className="signUpButton" disabled={!isFormValid}>
                  Sign Up
                </button>
                <p className="orOption">or</p>
                <p className="mt-2">
                  already have an account?
                  <Link to={"/signin"} className="ms-1">
                    sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
