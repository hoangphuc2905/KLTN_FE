import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { hasAccess } from "../utils/authorization";
import ErrorPage from "./ErrorPage";

const ProtectedRoute = ({ roles, path, children }) => {
  console.log("Roles:", roles);
  console.log("Path:", path);

  if (!roles || roles.length === 0) {
    console.error("Không có roles. Chuyển hướng đến trang đăng nhập.");
    return <Navigate to="/" replace />;
  }

  const hasPermission = hasAccess(roles, path);

  if (!hasPermission) {
    console.error("Không có quyền truy cập. Hiển thị trang lỗi.");
    return (
      <ErrorPage
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
      />
    );
  }

  return children;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  path: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
