import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/site.css";
import "./styles/site-enhancements.css";
import PublicSite from "./site/PublicSite";
import AdminApp from "./admin/AdminApp";

const isAdmin = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isAdmin ? <AdminApp /> : <PublicSite />}
  </StrictMode>,
);