import { Route, Routes } from "react-router-dom";
import { ROUTER } from "./utils/router";
import Search from "./pages/admin/search/page";
import SearchPapers from "./pages/admin/search/searchPapers";

const AppRoutes = () => (
    <Routes>

<Route path={ROUTER.ADMIN.SEARCH} element={<Search />} />
<Route path={ROUTER.ADMIN.SEARCH_PAPERS} element={<SearchPapers />} />

    </Routes>
);
export default AppRoutes;