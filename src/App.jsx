import { Routes, Route } from "react-router-dom";
import Search from "./pages/admin/search/page";
import LoginPage from "./app/auth/login/LoginPage";
import UserHomePage from "./pages/user/home/HomePage";

const App = () => {
  // const navigate = useNavigate();

  // const handleLoginClick = () => {
  //   navigate("/admin/search");
  // };

  return (
    <div>
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<UserHomePage />} />
        <Route path="/admin/search" element={<Search />} />
      </Routes>
      {/* <Footer /> */}
    </div>
  );
};

export default App;
