import React, { useContext } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppProvider, { AppContext } from "./context/app.context";
import TwoFactorAuth from "./pages/2fa";
import Login from "./pages/login";
import Home from "./pages/home";
import SignUp from "./pages/signup";
import Chat from "./pages/chat";
import Settings from "./pages/settings";
import Pong from "./pages/pong";
import FourOhFour from "./pages/404";
import { Spinner } from "./components";


const PrivateRoutes = () => {
  const { authenticated, loading, twoFactorAuth } = useContext(AppContext);
  const path = useLocation().pathname;

  if (loading) {
    return <Spinner />;
  }

  return authenticated || (path === "/tfa" && twoFactorAuth) ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
  // return <Outlet />;
};

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pong" element={<Pong />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tfa" element={<TwoFactorAuth />} />
        </Route>
        <Route path="*" element={<FourOhFour />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
