import { Link, useNavigate, useLocation, matchPath } from "react-router-dom";
import { useState, useMemo, useCallback } from "react";
import SideMenu from "./SideMenu";
import Tutorial from '../aiplan/Tutorial';
import useUserStore from "../../api/userStore";
import "../../css/common/Header.css";

import logo from "../../images/header/logo2.svg";
import menu from "../../images/header/menu.svg";
import account from "../../images/header/account.svg";
import cartlogo from "../../images/header/cart.svg";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const openTutorial = () => setIsTutorialOpen(true);
  const closeTutorial = () => setIsTutorialOpen(false);

  const { user } = useUserStore();
  const isLoggedIn = !!user;
  const hasProfileImage = !!user?.profileImageUrl;

  const navigate = useNavigate();
  const location = useLocation();
  const whiteBgPatterns = useMemo(
    () => [
      { path: "/community", end: true },
      { path: "/mypage", end: true },
      { path: "/cart", end: true },
      { path: "/planlist", end: true },
      { path: "/search", end: true },
      { path: "/posts", end: false },
      { path: "/myplan", end: false },
    ],
    []
  );

  const isWhiteBg = useMemo(() => {
    const pathname = location.pathname;
    return whiteBgPatterns.some((pattern) =>
      matchPath({ path: pattern.path, end: pattern.end }, pathname)
    );
  }, [location.pathname, whiteBgPatterns]);

  const hoverEnabled = location.pathname.startsWith("/cart");

  const confirmIfDirty = useCallback(() => {
    try {
      const isOnMyPlan = location.pathname.startsWith('/myplan');
      if (isOnMyPlan && typeof window !== 'undefined' && window.__MYPLAN_DIRTY__) {
        return window.confirm('저장되지 않은 변경사항이 있습니다. 이동하시겠습니까?');
      }
    } catch (_) {}
    return true;
  }, [location.pathname]);

  const handleProtectedRoute = useCallback((path) => {
    if (!confirmIfDirty()) return;
    if (isLoggedIn) navigate(path);
    else navigate("/login");
  }, [confirmIfDirty, isLoggedIn, navigate]);

  return (
    <div className={`header ${hoverEnabled ? "hover-enabled" : ""} ${isWhiteBg ? "white-bg" : ""}`}>
      <header className="header-top">
        <div className="header-top-container">
          <div className="logo-area">
            <Link
              to="/"
              className="logo-link"
              onClick={(e) => {
                const ok = confirmIfDirty();
                if (!ok) {
                  e.preventDefault();
                }
              }}
            >
              <img src={logo} alt="logo" />
            </Link>
          </div>

          <nav className="navbar-container">

            <li className="nav-item">
              <button
                className="nav-link"
                onClick={openTutorial}
              >
                <span className="tutorial-modal">튜토리얼</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                className="nav-link"
                onClick={() => handleProtectedRoute("/planlist")}
              >
                <span className="myplan">내 계획</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                className="nav-link"
                onClick={() => handleProtectedRoute("/cart")}
              >
                <img src={cartlogo} alt="cart" className="nav-icon" />
              </button>
            </li>

            <li className="nav-item">
              <button className="nav-link" onClick={toggleMenu}>
                <img src={menu} alt="menu" className="nav-icon" />
              </button>
            </li>

            <li className="nav-item">
              <button
                className="nav-link"
                onClick={() => handleProtectedRoute("/mypage")}
              >
                {isLoggedIn && hasProfileImage ? (
                  <img
                    src={user.profileImageUrl}
                    alt="profile"
                    className="nav-icon profile-image-header"
                  />
                ) : (
                  <img src={account} alt="account" className="nav-icon" />
                )}
              </button>
            </li>
          </nav>
        </div>
      </header>

      {isMenuOpen && <SideMenu onClose={toggleMenu} />}

      {isTutorialOpen && (
        <Tutorial 
          showArrows={true} 
          onClose={closeTutorial} 
        />
      )}
    </div>
  );
}

export default Header;