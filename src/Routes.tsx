import React from 'react';
import { Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';
import { useUserContext } from './providers/UserProvider';
import { Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
// Pages
import SignInPage from './pages/SignInPage';

function Routes() {
  return (
    <RouterRoutes>
      <Route path='/' element={<ProtectedRoute />}>
        <Route index element={<h1 onClick={() => Auth.signOut()}>HomePage</h1>} />
        <Route path='*' element={<h1>NotFoundPage</h1>}></Route>
      </Route>
      <Route path='/signIn' element={<SignInPage />}></Route>
    </RouterRoutes>
  );
}

export default Routes;

function ProtectedRoute() {
  const isUserSignedIn = useUserContext().isAuth;

  // If signedIn, render the rest of children (Outlet), else redirect to `/signIn` page
  return <>{isUserSignedIn ? <Outlet /> : <Navigate replace to='signIn' />}</>;
}
