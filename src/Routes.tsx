import React from 'react';
import { Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';

function Routes() {
  return (
    <RouterRoutes>
      <Route path='/' element={<ProtectedRoute />}>
        <Route index element={<h1>HomePage</h1>} />
        <Route path='*' element={<h1>NotFoundPage</h1>}></Route>
      </Route>
      <Route path='/signIn' element={<h1>SignInPage</h1>}></Route>
    </RouterRoutes>
  );
}

export default Routes;

function ProtectedRoute() {
  const isUserSignedIn = true; // Placeholder (Will use auth context API to identify)

  // If signedIn, render the rest of children (Outlet), else redirect to `/signIn` page
  return <>{isUserSignedIn ? <Outlet /> : <Navigate replace to='signIn' />}</>;
}
