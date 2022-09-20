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

function Routes() {
  const isUserSignedIn = useUserContext().isAuth;

  if (!isUserSignedIn) {
    return (
      <RouterRoutes>
        <Route path='/signIn' element={<SignInPage />} />
      </RouterRoutes>
    );
  } else {
    return (
      <RouterRoutes>
        <Route path='/' element={<SignedInLayout />}>
          {/* NoPath redirects to HomePage */}
          <Route index element={<HomePage />} />

          <Route path='/metadata' element={<MetadataPage />} />
          <Route path='/lims' element={<LIMSPage />} />

          {/* Complicated routing or more than one routing will be split into their own component. */}
          <Route path='/subjects/*' element={<SubjectRoutes />} />

          {/* Non matching page redirect to NotFound */}
          <Route path='*' element={<h1>NotFoundPage</h1>}></Route>
        </Route>
        <Route path='/signIn' element={<SignInPage />}></Route>
      </RouterRoutes>
    );
  }
}

export default Routes;

function SignedInLayout() {
  // Add layout componet for SignedIn page
  return (
    <>
      <MenuBar />
      <div style={{ top: '3rem', position: 'relative' }}>
        <Outlet />
      </div>
    </>
  );
}
