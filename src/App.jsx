import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Homepage from './Homepage/Homepage';
import Book from './Steps/Book';
import Footer from './components/Footer/Footer';
import Internal from './internal/Internal';
import Studio1 from './Studio/Studio1';
import Studio2 from './Studio/Studio2';
import Studio3 from './Studio/Studio3'; 
import Mem from './Services/Mix&master';
import Prod from './Services/Prod';
import Rec from './Services/Rec';
import ScrollToTop from './ScrollToTop';
import Navbar from './components/Navbar/Navbar';
import NavbarAdmin from './internal/Navbar/Navbar';
import Privacy from './Privacy/Privacy';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <ScrollToTop><Navbar isHome={true}/> <Homepage /><Footer /></ScrollToTop>,
    },
    {
      path: "/book",
      element: <ScrollToTop><Book /><Footer /></ScrollToTop>
    },
    {
      path: "/admin",
      element: <ScrollToTop><Internal/></ScrollToTop>
    },
    {
      path: "/studio1",
      element: <ScrollToTop><Navbar /><Studio1/><Footer /></ScrollToTop>
    },
    {
      path: "/studio2",
      element: <ScrollToTop><Navbar /><Studio2/><Footer /></ScrollToTop>
    },
    {
      path: "/studio3",
      element: <ScrollToTop><Navbar /><Studio3/><Footer /></ScrollToTop>
    },
    {
      path: "/rec",
      element: <ScrollToTop><Navbar /><Rec/><Footer /></ScrollToTop>
    },
    {
      path: "/mixmaster",
      element: <ScrollToTop><Navbar /><Mem/><Footer /></ScrollToTop>
    },
    {
      path: "/prod",
      element: <ScrollToTop><Navbar /><Prod/><Footer /></ScrollToTop>
    },
    {
      path: "/privacy",
      element: <ScrollToTop><Navbar /><Privacy/><Footer /></ScrollToTop>
    }
  ]);

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div style={{ minHeight: "80vh" }}>
        <RouterProvider router={router} />
      </div>
      
    </div>
  );
}

export default App;
