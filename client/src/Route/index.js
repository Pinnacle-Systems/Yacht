import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Home, Login, Register } from "../Basic/pages";
import { Dashboard, ProtectedRoute } from "../Basic/components";
import { LOGIN, HOME_PATH, PRODUCT_ADMIN_HOME_PATH, REGISTER_PATH, DASHBOARD } from "./urlPaths";
import ActiveTabList from "../Basic/components/ActiveTabList";

export default function Routing() {
  return (
    <HashRouter>
      <Routes>
        <Route path={LOGIN} element={<Login />} />
        <Route path={REGISTER_PATH} element={<Register />} />
        <Route
          path={HOME_PATH}
          element={
            <ProtectedRoute>
              <Home />

            </ProtectedRoute>
          }
        />
        <Route
          path={PRODUCT_ADMIN_HOME_PATH}
          element={
            <ProtectedRoute>
              <Home />

            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}



