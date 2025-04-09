import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminMenu from "./components/AdminMenu";
import UserMenu from "./components/UserMenu";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationPage from "./components/NotificationPage";
import LoginPage from "./app/auth/login/LoginPage";
import UserHomePage from "./pages/user/home/HomePage";
import ProfilePage from "./pages/user/profile/ProfilePage";
import UpdateProfilePage from "./pages/user/profile/UpdateProfilePage";
import WorkProcessPage from "./pages/user/profile/WorkProcessPage";
import ScientificPaperPage from "./pages/user/scientificPaper/ScientificPaperPage";
import AddScientificPaperPage from "./pages/user/scientificPaper/AddScientificPaperPage";
import ScientificPaperDetailPage from "./pages/user/scientificPaper/ScientificPaperDetailPage";
import StatisticsTablePage from "./pages/user/statistics/StatisticsTablePage";
import StatisticsChartPage from "./pages/user/statistics/StatisticsChartPage";
import StatisticsPointPage from "./pages/user/statistics/StatisticsPointPage";
import ManagementAccount from "./pages/admin/managementAccount/managementAccountPage";
import ManagementAriticle from "./pages/admin/managementArticle/managementArticlePage";
import ManagementTable from "./pages/admin/managementStatistic/managementTablePage";
import ManagementChart from "./pages/admin/managementStatistic/managementChartPage";
import ManagementPoint from "./pages/admin/managementStatistic/managementPointPage";
import ManagementFormulas from "./pages/admin/managementScoringformulas/managementScoringformulasPage";
import ManagementData from "./pages/admin/managementData/managementDataPage";
import RoleSelectionPage from "./components/RoleSelectionPage";
import ErrorPage from "./components/ErrorPage";
import DetailArticlePage from "./pages/admin/managementArticle/detailArticlePage";
import StorageScientificPage from "./pages/user/storage/StorageScientificPage";
import EditScientificPaperPage from "./pages/user/scientificPaper/EditScientificPaperPage";
import ManagementDepartmentChart from "./pages/admin/managementStatistic/managementDepartmentChartPage";
import ManagementPointDepartmentPage from "./pages/admin/managementStatistic/managementPointDepartmentPage";
import ManagementPointDetailPage from "./pages/admin/managementStatistic/managementPointDetailPage";

const App = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = () => {
      try {
        const roles = localStorage.getItem("roles");
        const currentRole = localStorage.getItem("current_role");
        const token = localStorage.getItem("token");

        console.log("Token hiện tại:", token);
        console.log("Roles hiện tại:", roles);
        console.log("Vai trò hiện tại:", currentRole);

        if (currentRole) {
          setUserRoles([currentRole]);
        } else if (roles) {
          const parsedRoles = roles ? JSON.parse(roles) : [];
          setUserRoles(
            Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]
          );
        } else {
          setUserRoles([]);
        }
      } catch (error) {
        console.error("Lỗi khi xử lý roles hoặc current_role:", error);
        setUserRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    const handleStorageChange = () => {
      fetchRoles();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>Đang tải...</div>
    );
  }

  return (
    <div>
      {window.location.pathname !== "/role-selection" &&
        (userRoles.some((role) =>
          [
            "admin",
            "head_of_department",
            "deputy_head_of_department",
            "department_in_charge",
          ].includes(role)
        ) ? (
          <AdminMenu currentRole={userRoles[0]} />
        ) : (
          <UserMenu />
        ))}
      <Routes>
        {!localStorage.getItem("token") ? (
          <>
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute roles={userRoles} path="/home">
                  <UserHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/role-selection"
              element={
                <ProtectedRoute roles={userRoles} path="/role-selection">
                  <RoleSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={userRoles} path="/profile">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-profile"
              element={
                <ProtectedRoute roles={userRoles} path="/update-profile">
                  <UpdateProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/work-process"
              element={
                <ProtectedRoute roles={userRoles} path="/work-process">
                  <WorkProcessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scientific-paper"
              element={
                <ProtectedRoute roles={userRoles} path="/scientific-paper">
                  <ScientificPaperPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scientific-paper/:id"
              element={
                <ProtectedRoute roles={userRoles} path="/scientific-paper/:id">
                  <ScientificPaperDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scientific-paper/edit/:id"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/scientific-paper/edit/:id"
                >
                  <EditScientificPaperPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-scientific-paper"
              element={
                <ProtectedRoute roles={userRoles} path="/add-scientific-paper">
                  <AddScientificPaperPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics-table"
              element={
                <ProtectedRoute roles={userRoles} path="/statistics-table">
                  <StatisticsTablePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics-chart"
              element={
                <ProtectedRoute roles={userRoles} path="/statistics-chart">
                  <StatisticsChartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics-point"
              element={
                <ProtectedRoute roles={userRoles} path="/statistics-point">
                  <StatisticsPointPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute roles={userRoles} path="/notifications">
                  <NotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/storage-scientific-paper"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/storage-scientific-paper"
                >
                  <StorageScientificPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/management/account"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/account"
                >
                  <ManagementAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/ariticle"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/ariticle"
                >
                  <ManagementAriticle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/ariticle/detail/:id"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/ariticle/detail/:id"
                >
                  <DetailArticlePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/chart"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/chart"
                >
                  <ManagementChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management/chart"
              element={
                <ProtectedRoute roles={userRoles} path="/management/chart">
                  <ManagementDepartmentChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/table"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/table"
                >
                  <ManagementTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/point"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/point"
                >
                  <ManagementPoint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/point/department"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/point/department"
                >
                  <ManagementPointDepartmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/point/detail/:id"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/point/detail/:id"
                >
                  <ManagementPointDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/scoringformulas"
              element={
                <ProtectedRoute
                  roles={userRoles}
                  path="/admin/management/scoringformulas"
                >
                  <ManagementFormulas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/management/data"
              element={
                <ProtectedRoute roles={userRoles} path="/admin/management/data">
                  <ManagementData />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <ErrorPage
                  status="404"
                  title="404"
                  subTitle="Trang bạn tìm kiếm không tồn tại."
                />
              }
            />
          </>
        )}
      </Routes>
    </div>
  );
};

export default App;
