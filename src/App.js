import logo from "./logo.svg";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { UserProvider } from './contexts/UserContext'; // Adjust the import path
import Layout from "./components/Layout/Layout";
import Home from "./components/Home/Home";
import SignIn from "./components/SignIn/SignIn";
import SignUp from "./components/SignUp/SignUp";
import Top10 from "./components/Top10/Top10";
import Posts from "./components/Posts/Posts";
import Analysis from "./components/Analysis/Analysis";
import History from "./components/History/History";
import Search from "./components/Search/Search";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <SignUp /> },
        { path: "/signin", element: <SignIn /> },
        { path: "/signup", element: <SignUp /> },
        { path: "/home", element: <Home /> },
        { path: "/top10", element: <Top10 /> },
        { path: "/posts", element: <Posts /> },
        { path: "/analysis", element: <Analysis /> },
        { path: "/history", element: <History /> },
        {path: "/search", element: <Search/>}
      ],
    },
  ]);
  return (
    <>
    <UserProvider>
          <RouterProvider router={router} />
    </UserProvider>
    </>
  );
}

export default App;