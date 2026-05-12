import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header";

const variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function AppLayout() {
  const location = useLocation();

  const updateHeaderHeight = React.useCallback(() => {
    const el = document.querySelector(".nh-header, .header");
    const h = el ? el.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty("--header-h", `${h}px`);
  }, []);

  React.useLayoutEffect(() => {
    updateHeaderHeight();
    let ro;
    const el = document.querySelector(".nh-header, .header");
    if (window.ResizeObserver && el) {
      ro = new ResizeObserver(updateHeaderHeight);
      ro.observe(el);
    }
    window.addEventListener("resize", updateHeaderHeight);
    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      if (ro) ro.disconnect();
    };
  }, [updateHeaderHeight]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header whiteBg={location.pathname === "/login"} /> {/* ✅ 조건 */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            willChange: "opacity",
            transform: "none",   // ✅ sticky 깨지지 않게
            paddingTop: "var(--header-h, 60px)",
            minHeight: "calc(100vh - var(--header-h, 60px))",
          }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </>
  );
}
