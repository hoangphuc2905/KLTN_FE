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
  lecturer: ["/home", "/profile", "/update-profile", "/work-process"],
  head_of_department: [
    "/home",
    "/profile",
    "/department/overview",
    "/department/reports",
  ],
  deputy_head_of_department: ["/home", "/profile", "/department/overview"],
  department_in_charge: ["/home", "/profile", "/department/tasks"],
};

export default permissions;
