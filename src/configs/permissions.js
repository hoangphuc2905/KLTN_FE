const permissions = {
  admin: [
    "/admin/management/chart",
    "/admin/management/table",
    "/admin/search",
    "/admin/management/account",
    "/admin/management/ariticle",
    "/admin/management/data",
    "/admin/management/scoringformulas",
    "/admin/management/point",
    "/home",
    "/role-selection",
    "/profile",
    "/update-profile",
    "/work-process",
  ],
  student: [
    "/home",
    "/profile",
    "/update-profile",
    "/work-process",
    "/scientific-paper",
    "/scientific-paper/:id",
    "/add-scientific-paper",
    "/statistics-table",
    "/statistics-chart",
    "/statistics-point",
    "/notifications",
  ],
  lecturer: [
    "/admin/management/chart",
    "/role-selection",
    "/home",
    "/profile",
    "/update-profile",
    "/work-process",
  ],
  head_of_department: [
    "/admin/management/chart",

    "/role-selection",

    "/home",
    // "/profile",
    "/department/overview",
    "/department/reports",
    "/work-process",
  ],
  deputy_head_of_department: [
    "/admin/management/chart",
    "/role-selection",
    "/home",
    "/profile",
  ],
  department_in_charge: [
    "/role-selection",
    "/home",
    "/profile",
    "/department/tasks",
  ],
};

export default permissions;
