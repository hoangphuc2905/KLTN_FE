import React from "react";

const RoleSelection = ({ roles, onRoleSelect }) => {
  return (
    <div className="role-selection">
      {roles.map((role, index) => (
        <button
          key={index}
          onClick={() => onRoleSelect(role)}
          className="role-button"
        >
          {role}
        </button>
      ))}
    </div>
  );
};

export default RoleSelection;
