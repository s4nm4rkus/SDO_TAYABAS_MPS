import { Outlet } from "react-router-dom";
import MainHeader from "../headers/main-header/Header";
import MainFooter from "../footers/main-footer/Footer";
import LandingBackground from "../../assets/images/landing_bg.png";

const MainLayout = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${LandingBackground})` }}
    >
      <MainHeader />
      <main>
        <Outlet />
      </main>
      <MainFooter />
    </div>
  );
};

export default MainLayout;
