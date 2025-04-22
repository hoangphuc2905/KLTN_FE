import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaChartBar,
  FaTable,
  FaClipboardList,
  FaChevronDown,
  FaUser,
  FaDatabase,
  FaCalculator,
  FaFileAlt,
  FaChartPie,
  FaUserCheck,
} from "react-icons/fa";
import "./Sidebar.scss";
import PropTypes from "prop-types";

const AdminMenu = ({ currentRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log("currentRole đã thay đổi:", currentRole);
  }, [currentRole]);

  if (!currentRole) {
    console.error("currentRole không được truyền vào AdminMenu");
    return null;
  }

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleStatsMenu = () => setIsStatsOpen(!isStatsOpen);

  if (location.pathname === "/") {
    return null;
  }

  return (
    <>
      <button
        className={`menu-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`popup-menu ${isOpen ? "open" : ""}`}>
        <nav className="menu-list">
          <Link to="/home" className="menu-item" onClick={toggleMenu}>
            <FaHome /> <span>Trang Chủ</span>
          </Link>

          <Link
            to="/admin/management/ariticle"
            className="menu-item"
            onClick={toggleMenu}
          >
            <FaFileAlt /> <span>Bài Báo</span>
          </Link>

          <Link
            to="/admin/management/account"
            className="menu-item"
            onClick={toggleMenu}
          >
            <FaUser /> <span>Quản lý người dùng</span>
          </Link>

          {currentRole === "department_in_charge" && (
            <Link
              to="/admin/management/user-approval"
              className="menu-item"
              onClick={toggleMenu}
            >
              <FaUserCheck /> <span>Quản lý tài khoản</span>
            </Link>
          )}

          {currentRole === "admin" && (
            <Link
              to="/admin/management/data"
              className="menu-item"
              onClick={toggleMenu}
            >
              <FaDatabase /> <span>Quản lý dữ liệu</span>
            </Link>
          )}

          {currentRole === "admin" && (
            <Link
              to="/admin/management/scoringformulas"
              className="menu-item"
              onClick={toggleMenu}
            >
              <FaCalculator /> <span>Công thức điểm</span>
            </Link>
          )}

          <div className="menu-item has-submenu" onClick={toggleStatsMenu}>
            <FaChartBar /> <span>Thống Kê</span>
            <FaChevronDown
              className={`submenu-toggle ${isStatsOpen ? "open" : ""}`}
            />
          </div>
          {isStatsOpen && (
            <div className="submenu">
              {(currentRole === "admin" ||
                currentRole === "head_of_department" ||
                currentRole === "deputy_head_of_department" ||
                currentRole === "department_in_charge") && (
                <Link
                  to={
                    currentRole === "admin"
                      ? "/admin/management/chart"
                      : "/management/chart"
                  }
                  className="submenu-item"
                  onClick={toggleMenu}
                >
                  <FaChartPie /> Dạng Biểu Đồ
                </Link>
              )}
              <Link
                to={
                  currentRole === "admin"
                    ? "/admin/management/table"
                    : "/management/table"
                }
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaTable /> Dạng Bảng
              </Link>
              <Link
                to={
                  currentRole === "admin"
                    ? "/admin/management/point"
                    : "/admin/management/point/department"
                }
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaClipboardList /> Điểm Đóng Góp
              </Link>
            </div>
          )}
        </nav>
      </div>

      {isOpen && <div className="overlay open" onClick={toggleMenu}></div>}
    </>
  );
};
AdminMenu.propTypes = {
  currentRole: PropTypes.string.isRequired,
};

export default AdminMenu;
