import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaClipboardList,
  FaNewspaper,
  FaChevronDown,
} from "react-icons/fa";
import "./Sidebar.scss";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSubMenu = () => setIsSubMenuOpen(!isSubMenuOpen);

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
            <FaNewspaper /> <span>Bài Báo</span>
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
                <span>Danh sách bài báo</span>
              </Link>
              <Link
                to="/add-scientific-paper"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <span>Thêm bài báo</span>
              </Link>
            </div>
          )}

          <Link to="/user-dashboard" className="menu-item" onClick={toggleMenu}>
            <FaClipboardList /> <span>User Dashboard</span>
          </Link>
        </nav>
      </div>

      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </>
  );
};

export default UserMenu;
