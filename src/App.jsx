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

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <ScrollToTop><Navbar isHome={true}/> <Homepage /></ScrollToTop>,
    },
    {
      path: "/book",
      element: <ScrollToTop><Book /></ScrollToTop>
    },
    {
      path: "/admin",
      element: <ScrollToTop><Internal/></ScrollToTop>
    },
    {
      path: "/studio1",
      element: <ScrollToTop><Navbar /><Studio1/></ScrollToTop>
    },
    {
      path: "/studio2",
      element: <ScrollToTop><Navbar /><Studio2/></ScrollToTop>
    },
    {
      path: "/studio3",
      element: <ScrollToTop><Navbar /><Studio3/></ScrollToTop>
    },
    {
      path: "/rec",
      element: <ScrollToTop><Navbar /><Rec/></ScrollToTop>
    },
    {
      path: "/mixmaster",
      element: <ScrollToTop><Navbar /><Mem/></ScrollToTop>
    },
    {
      path: "/prod",
      element: <ScrollToTop><Navbar /><Prod/></ScrollToTop>
    }
  ]);

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div style={{ minHeight: "80vh" }}>
        <RouterProvider router={router} />
      </div>
      <Footer />
    </div>
  );
}

export default App;
