import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./app/auth/login/page";
import Search from "./pages/admin/search/page";

const App = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/admin/search");
  };

  return (
    <div>
      <button onClick={handleLoginClick}>Login</button>
      <Routes>
        <Route path="/admin/search" element={<Search />} />
      </Routes>
    </div>
  );
};

export default App;