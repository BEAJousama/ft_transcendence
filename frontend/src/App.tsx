import { useContext } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppProvider, { AppContext } from "./context/app.context";
import { Spinner } from "./components";
import SocketProvider from "./context/socket.context";

import {
  TwoFactorAuth,
  Login,
  Home,
  SignUp,
  Chat,
  Settings,
  Pong,
  FourOhFour,
  Profile,
  Search,
  CompleteInfo,
  Notifications,
} from "./pages/";
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GameProvider from "./context/game.context";
import  ChatProvider  from "./context/chat.context";

const PrivateRoutes = () => {
  const { authenticated, loading, user, updateUser } = useContext(AppContext);
  const path = useLocation().pathname;
  const twoFactorAuth = user?.twoFactorAuth || localStorage.getItem("2fa_access_token");

  // updateUser();
  if (loading) {
    return <Spinner />;
  }
  return authenticated || (path === "/tfa" && twoFactorAuth) ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  try {
    localStorage.getItem('access_token')
  }
  catch (e) {
    return <FourOhFour show={false} />
  }

  return (
    <AppProvider>
<ChatProvider>
        <GameProvider>
      <SocketProvider>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route path="/" element={<Home />} />
              <Route path="/completeinfo" element={<CompleteInfo />} />
              <Route path="/pong" element={<Pong />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<Search />} />
              <Route path="/tfa" element={<TwoFactorAuth />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile/" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
            </Route>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<FourOhFour />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            limit={6}
            hideProgressBar={false}
            newestOnTop
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            transition={Slide}
            />
      </SocketProvider>
        </GameProvider>
            </ChatProvider>
    </AppProvider>
  );
}

export default App;
