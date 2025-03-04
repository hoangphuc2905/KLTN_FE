import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Menu";
import Search from "./pages/admin/search/page";
import LoginPage from "./app/auth/login/LoginPage";
import UserHomePage from "./pages/user/home/HomePage";
import ProfilePage from "./pages/user/profile/ProfilePage";
import ManagementAccount from "./pages/admin/managementAccount/managementAccountPage"
import ManagementAriticle from "./pages/admin/managementArticle/managementArticlePage"

const App = () => {
  return (
    <div>
      <Sidebar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<UserHomePage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/admin/search" element={<Search />} />
        <Route path="/admin/management/Account" element={<ManagementAccount />} />
        <Route path="/admin/management/Ariticle" element={<ManagementAriticle />} />
      </Routes>
    </div>
  );
};

export default App;
