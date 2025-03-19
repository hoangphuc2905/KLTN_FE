import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleSelection from "../../components/RoleSelection";

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = ["admin", "lecturer"];

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    // Navigate to the appropriate page based on the selected role
    if (role === "admin") {
      navigate("/lecturer-dashboard"); // Replace with actual route
    } else if (role === "lecturer") {
      navigate("/admin-dashboard"); // Replace with actual route
    }
  };

  return (
    <div className="role-selection-page">
      <h2>Select Your Role</h2>
      <RoleSelection roles={roles} onRoleSelect={handleRoleSelection} />
    </div>
  );
};

export default RoleSelectionPage;
