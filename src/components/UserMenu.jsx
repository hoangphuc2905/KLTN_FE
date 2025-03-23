import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaChevronDown,
  FaClipboardList,
  FaTable,
  FaChartBar,
  FaFileAlt,
  FaChartPie,
  FaFileUpload,
  FaListAlt,
} from "react-icons/fa";
import "./Sidebar.scss";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSubMenu = () => setIsSubMenuOpen(!isSubMenuOpen);
  const toggleStatsMenu = () => setIsStatsOpen(!isStatsOpen);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

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

          <div className="menu-item" onClick={toggleSubMenu}>
            <FaFileAlt /> <span>Bài Báo</span>
            <FaChevronDown
              className={`submenu-toggle ${isSubMenuOpen ? "open" : ""}`}
            />
          </div>
          {isSubMenuOpen && (
            <div className="submenu">
              <Link
                to="/scientific-paper"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaListAlt /> <span>Danh sách bài báo</span>
              </Link>
              <Link
                to="/add-scientific-paper"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaFileUpload /> <span>Thêm bài báo</span>
              </Link>
            </div>
          )}

          <div className="menu-item has-submenu" onClick={toggleStatsMenu}>
            <FaChartBar /> <span>Thống Kê</span>
            <FaChevronDown
              className={`submenu-toggle ${isStatsOpen ? "open" : ""}`}
            />
          </div>
          {isStatsOpen && (
            <div className="submenu">
              <Link
                to="statistics-chart"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaChartPie /> Dạng Biểu Đồ
              </Link>
              <Link
                to="statistics-table"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaTable /> Dạng Bảng
              </Link>
              <Link
                to="statistics-point"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaClipboardList /> Điểm Đóng Góp
              </Link>
            </div>
          )}
        </nav>
      </div>

      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </>
  );
};

export default UserMenu;
