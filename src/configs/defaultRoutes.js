import permissions from "./permissions";

const defaultRoutes = Object.fromEntries(
  Object.entries(permissions).map(([roles, routes]) => [roles, routes[0]])
);

export default defaultRoutes;
