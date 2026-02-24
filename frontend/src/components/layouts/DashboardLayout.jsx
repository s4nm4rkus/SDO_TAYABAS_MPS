// import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import SideNav from "../navbar/SideNav";

const DashboardLayout = () => {
  return (
    <div className="flex">
      <SideNav />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
