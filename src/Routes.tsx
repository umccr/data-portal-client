import React from 'react';
import { Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';
import { Auth } from '@aws-amplify/auth';
import { useUserContext } from './providers/UserProvider';
// Pages
import SignInPage from './pages/SignInPage';
import MenuBar from './layouts/menuBar/MenuBar';

function Routes() {
  return (
    <RouterRoutes>
      <Route path='/' element={<ProtectedRoute />}>
        <Route index element={<h1>HomePage</h1>} />
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
