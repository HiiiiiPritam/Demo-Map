import React from "react";
import { motion } from "framer-motion";
import './HomePage.css'; // Import CSS file
import { Link } from "react-router-dom"; // Import Link from react-router-dom


// Top section with profile and weather updates
const TopSection = () => {
  return (
    <div className="top-section">
      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-icon">P</div>
        <span>Profile</span>
      </div>

      {/* Weather Alert Section */}
      <div className="weather-alert">
        <strong>Weather Alert:</strong> Sunny, 25°C
      </div>
    </div>
  );
};

// Main section with animated menus
const MainSection = () => {
  const menuItems = [
    { name: "Crop Disease Detection", path: "/crop-disease-detection" },
    { name: "Weed Detection", path: "/weed-detection" },
    { name: "AlertMap", path: "/map" },
    { name: "BuyCrop", path: "/buycrop" },
    { name: "SellCrop", path: "/sellcrop" },
    { name: "Crop Prediction", path: "/crop-prediction" }
  ];

  return (
    <div className="main-section">
      {menuItems.map((menu, index) => (
        <Link key={index} to={menu.path}>
          <motion.div
          key={index}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="menu-item"
        >
          {menu.name}
        </motion.div>
        </Link>
        
      ))}
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  return (
    <div className="homepage">
      <TopSection />
      <MainSection />
    </div>
  );
};

export default HomePage;
