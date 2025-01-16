import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./app/auth/login/page";

const App = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login"); 
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700">
      <h1 className="text-5xl font-extrabold text-white mb-10 drop-shadow-lg">
        Welcome to the App
      </h1>
      <button
        className="bg-white text-blue-700 px-10 py-4 rounded-full shadow-lg hover:bg-blue-100 hover:text-blue-800 hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        onClick={handleLoginClick}
      >
        Login
      </button>

      {/* Định nghĩa các route */}
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;
