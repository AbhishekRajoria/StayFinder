import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RootLayout from "@/components/layouts/RootLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Listings from "@/pages/Listings";
import { ListingDetails } from "@/pages/ListingDetails";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import MyListings from "@/pages/MyListings";
import Bookings from "@/pages/Bookings";
import { Unauthorized } from "@/pages/Unauthorized";
import { CreateListing } from "@/pages/CreateListing";
import EditListing from "@/pages/EditListing";
import HostBookings from "./pages/HostBooking";
import ProtectedRoute from "@/components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "listings",
        element: <Listings />,
      },
      {
        path: "listings/:id",
        element: <ListingDetails />,
      },
      {
        path: "listings/create",
        element: (
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        ),
      },
      {
        path: "listings/:id/edit",
        element: (
          <ProtectedRoute>
            <EditListing />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/host/bookings",
        element: (
          <ProtectedRoute>
            <HostBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-listings",
        element: (
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings",
        element: (
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        ),
      },
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
    ],
  },
]);

export default router; 