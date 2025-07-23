import React from "react";

const Sidebar = ({
  isOpen,
  onToggle,
  onPageChange,
  currentPage,
  onSignOut,
  showSignOut,
}) => {
  const menuItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "cart", label: "Cart", icon: "🛒" },
    { id: "browse", label: "Browse", icon: "🔍" },
  ];

  return (
    <>
      <button
        onClick={onToggle}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          padding: "10px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
        }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "250px",
          backgroundColor: "#fff",
          boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          padding: "80px 0 20px 0",
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            style={{
              padding: "15px 25px",
              fontSize: "16px",
              backgroundColor:
                currentPage === item.id ? "#f0f0f0" : "transparent",
              border: "none",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {showSignOut && (
          <button
            onClick={onSignOut}
            style={{
              padding: "15px 25px",
              fontSize: "16px",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "auto",
            }}
          >
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          onClick={onToggle}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 998,
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
