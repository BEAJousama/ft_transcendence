import React, { useState } from "react";
import Button from "./components/button";
import { AppContext } from "./context";
import { User } from "./interfaces/user";
import { Login } from "./pages";

function App() {
  const [user, setUser] = useState<User>();
  return (
    <AppContext.Provider value={[user, setUser]}>
      {/* <div className="App h-screen w-screen flex items-center justify-center">
        <Button className=" rounded-full" onClick={() => {}}>
          <img src="/img/42.svg" />
          <span>Login with intranet</span>
        </Button>
      </div> */}
      <Login />
    </AppContext.Provider>
  );
}

export default App;
