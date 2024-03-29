import React from 'react';
import { Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';
import { useUserContext } from '../providers/UserProvider';

// Routing components
import SubjectRoutes from './subjects';

// Pages
import SignInPage from '../pages/SignInPage';
import HomePage from '../pages/Home';
import MetadataPage from '../pages/Metadata';
import LIMSPage from '../pages/LIMS';

// Other Components
import MenuBar from '../layouts/MenuBar';
import RunRoutes from './runs';

function Routes() {
  const isUserSignedIn = useUserContext().isAuth;

  if (!isUserSignedIn) {
    return (
      <RouterRoutes>
        <Route path='/signIn' element={<SignInPage />} />
        <Route path='*' element={<Navigate replace to='signIn' />} />
      </RouterRoutes>
    );
  } else {
    return (
      <RouterRoutes>
        <Route path='/' element={<SignedInLayout />}>
          <Route index element={<HomePage />} />
          <Route path='/metadata' element={<MetadataPage />} />
          <Route path='/lims' element={<LIMSPage />} />

          {/* TODO: implement /search */}
          <Route path='/search' element={<h1>Not Implemented</h1>} />

          {/* More than one routing for the same prefix will be split into their own component. */}
          <Route path='/subjects/*' element={<SubjectRoutes />} />
          <Route path='/runs/*' element={<RunRoutes />} />

          {/* Non matching page redirect to NotFound */}
          <Route path='*' element={<h1>Page Not Found</h1>}></Route>
        </Route>
        <Route path='/signIn' element={<Navigate replace to='/' />}></Route>
      </RouterRoutes>
    );
  }
}

export default Routes;

function SignedInLayout() {
  // Add layout component for SignedIn page
  return (
    <>
      <MenuBar />
      <div style={{ top: '3rem', position: 'relative', height: 'calc(100% - 3rem)' }}>
        <Outlet />
      </div>
    </>
  );
}
