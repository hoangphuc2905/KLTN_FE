import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaChartBar,
  FaTable,
  FaClipboardList,
  FaNewspaper,
} from "react-icons/fa";
import "./Sidebar.scss";

const PopupMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleStatsMenu = () => setIsStatsOpen(!isStatsOpen);

  return (
    <>
      {/* Nút mở menu */}
      <button className="menu-toggle-btn" onClick={toggleMenu}>
        <FaBars />
      </button>

      {/* Menu popup */}
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

          {/* Thống kê - Có submenu */}
          <div className="menu-item has-submenu" onClick={toggleStatsMenu}>
            <FaChartBar /> <span>Thống Kê</span>
          </div>
          {isStatsOpen && (
            <div className="submenu">
              <Link
                to="/thong-ke/bieu-do"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaChartBar /> Dạng Biểu Đồ
              </Link>
              <Link
                to="/thong-ke/bang"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaTable /> Dạng Bảng
              </Link>
              <Link
                to="/thong-ke/diem-dong-gop"
                className="submenu-item"
                onClick={toggleMenu}
              >
                <FaClipboardList /> Điểm Đóng Góp
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Background overlay */}
      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </>
  );
};

export default PopupMenu;
