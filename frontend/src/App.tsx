import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Uploadfile from "./components/uploadfile";
import { AppContext } from "./context";
import { User } from "./interfaces/user";
import { Login } from "./pages";
import TwoFactorAuth from "./pages/twofactorauth";

const PrivateRoutes = () => {
  const { user, setUser } = useContext(AppContext);
  let loggedIn = user ? true : false;
  console.log("private route ", user);
  return loggedIn ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState<User>();
  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3000/api/auth/42/", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setUser(data);
      console.log(user);
    })();
  }, []);
  console.log(user);
  return (
    <AppContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/" element={<Uploadfile />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Uploadfile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/tfa" element={<TwoFactorAuth />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
