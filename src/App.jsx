import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import AdminMenu from "./components/AdminMenu";
import UserMenu from "./components/UserMenu";
import NotificationPage from "./components/NotificationPage";
import Search from "./pages/admin/search/page";
import LoginPage from "./app/auth/login/LoginPage";
import UserHomePage from "./pages/user/home/HomePage";
import ProfilePage from "./pages/user/profile/ProfilePage";
import UpdateProfilePage from "./pages/user/profile/UpdateProfilePage";
import WorkProcessPage from "./pages/user/profile/WorkProcessPage";
import ScientificPaperPage from "./pages/user/scientificPaper/ScientificPaperPage";
import AddScientificPaperPage from "./pages/user/scientificPaper/AddScientificPaperPage";
import ScientificPaperDetailPage from "./pages/user/scientificPaper/ScientificPaperDetailPage";
import ManagementAccount from "./pages/admin/managementAccount/managementAccountPage";
import ManagementAriticle from "./pages/admin/managementArticle/managementArticlePage";
import ManagementTable from "./pages/admin/managementStatistic/managementTablePage";
import ManagementChart from "./pages/admin/managementStatistic/managementChartPage";
import ManagementPoint from "./pages/admin/managementStatistic/managementPointPage";
const App = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  return (
    <div>
      {userRole === "admin" ? <AdminMenu /> : <UserMenu />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<UserHomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/update-profile" element={<UpdateProfilePage />} />
        <Route path="/work-process" element={<WorkProcessPage />} />
        <Route path="/scientific-paper" element={<ScientificPaperPage />} />
        <Route
          path="/scientific-paper/:id"
          element={<ScientificPaperDetailPage />}
        />
        <Route
          path="/add-scientific-paper"
          element={<AddScientificPaperPage />}
        />
        <Route path="/notifications" element={<NotificationPage />} />

        <Route path="/admin/search" element={<Search />} />
        <Route path="/admin/management/account" element={<ManagementAccount />} />
        <Route path="/admin/management/ariticle" element={<ManagementAriticle />} />
        <Route path="/admin/management/chart" element={<ManagementChart />} />
        <Route path="/admin/management/table" element={<ManagementTable />} />
        <Route path="/admin/management/point" element={<ManagementPoint />} />
        
      </Routes>
    </div>
  );
};

export default App;
