import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaClipboardList,
  FaNewspaper,
} from "react-icons/fa";
import "./Sidebar.scss";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  if (location.pathname === "/") {
    return null;
  }

  return (
    <>
      <button className="menu-toggle-btn" onClick={toggleMenu}>
        <FaBars />
      </button>

      <div className={`popup-menu ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleMenu}>
          <FaTimes />
        </button>

        <nav className="menu-list">
          <Link to="/home" className="menu-item" onClick={toggleMenu}>
            <FaHome /> <span>Trang Chủ</span>
          </Link>

          <Link to="/bai-bao" className="menu-item" onClick={toggleMenu}>
            <FaNewspaper /> <span>Bài Báo</span>
          </Link>

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