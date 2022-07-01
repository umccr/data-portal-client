import React from 'react';
import { Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';
import { useUserContext } from '../providers/UserProvider';
// Pages
import SignInPage from '../pages/SignInPage';
import MenuBar from '../layouts/MenuBar';
import SubjectRoutes from './subjects';

function Routes() {
  return (
    <RouterRoutes>
      <Route path='/' element={<ProtectedRoute />}>
        {/* NoPath redirects to HomePage */}
        <Route index element={<h1>HomePage</h1>} />

        {/* Subjects routing */}
        <Route path='/subject/*' element={<SubjectRoutes />} />

        {/* Non matching page redirect to NotFound */}
        <Route path='*' element={<h1>NotFoundPage</h1>}></Route>
      </Route>
      <Route path='/signIn' element={<SignInPage />}></Route>
    </RouterRoutes>
  );
}

export default Routes;

function ProtectedRoute() {
  // If not signedIn redirect to `/signIn` page
  const isUserSignedIn = useUserContext().isAuth;
  if (!isUserSignedIn) {
    return <Navigate replace to='signIn' />;
  }

  // Add layout componet for SignedIn page
  return (
    <>
      <MenuBar />
      <Outlet />
    </>
  );
}
