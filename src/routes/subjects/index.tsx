import React from 'react';

import { Routes as RouterRoutes, Route, Outlet } from 'react-router-dom';
import Breadcrumbs from '../../layouts/Breadcrumbs';
import SubjectPage from '../../pages/subjects/SubjectPage';
// import SideBar from '../../layouts/SideBar';
function SubjectRoutes() {
  return (
    <RouterRoutes>
      <Route path='/' element={<SubjectPageLayout />}>
        <Route index element={<SubjectPage />} />
        <Route path='/heho' element={<SubjectPage />} />
      </Route>
    </RouterRoutes>
  );
}

export default SubjectRoutes;

function SubjectPageLayout() {
  // return <SideBar />;
  return (
    <>
      <Breadcrumbs />
      <Outlet />
    </>
  );
}
