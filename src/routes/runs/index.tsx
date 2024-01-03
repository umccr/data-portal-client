import React from 'react';
import { Routes as RouterRoutes, Route, Outlet, Navigate } from 'react-router-dom';
import RunSideBar from '../../containers/runs/RunSideBar';

// Layout Component
import Breadcrumbs from '../../layouts/Breadcrumbs';
import SideBar from '../../layouts/SideBar';
import RunDataPage from '../../pages/runs/RunDataPage';
import RunLIMSPage from '../../pages/runs/RunLIMSPage';
import RunOverviewPage from '../../pages/runs/RunOverviewPage';

function RunRoutes() {
  return (
    <RouterRoutes>
      <Route path='/'>
        <Route index element={<Navigate to={'/'} replace={true} />} />
        <Route path=':runId' element={<RunPageLayout />}>
          <Route index element={<Navigate to='primary-data' />} />
          <Route path='overview' element={<RunOverviewPage />} />
          <Route path='primary-data' element={<RunDataPage />} />
          <Route path='lims' element={<RunLIMSPage />} />
        </Route>
      </Route>
    </RouterRoutes>
  );
}

export default RunRoutes;

function RunPageLayout() {
  return (
    <SideBar
      sideBarElement={<RunSideBar />}
      mainPageElement={
        <>
          <Breadcrumbs />
          <Outlet />
        </>
      }
    />
  );
}
