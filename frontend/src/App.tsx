import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Card } from "./components";
import Button from "./components/button";
import { AppContext } from "./context";
import { User } from "./interfaces/user";
import { Login } from "./pages";
import TwoFactorAuth from "./pages/twofactorauth";

function App() {
  const [user, setUser] = useState<User>();
  return (
    <AppContext.Provider value={[user, setUser]}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tfa" element={<TwoFactorAuth />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
