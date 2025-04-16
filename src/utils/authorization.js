import permissions from "../configs/permissions";

export const hasAccess = (roles, path) => {
  if (!Array.isArray(roles)) {
    console.error("Roles không phải là mảng:", roles);
    return false;
  }

  const result = roles.some((role) => {
    const allowedPaths = permissions[role] || [];
    console.log(`Kiểm tra quyền cho role: ${role}, path: ${path}`);
    console.log(`Allowed paths:`, allowedPaths);
    return allowedPaths.includes(path);
  });

  console.log(`Kết quả kiểm tra quyền: ${result}`);
  return result;
};
