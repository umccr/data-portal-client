import React, { createContext, useContext, useState, useEffect } from 'react';
import { Auth } from '@aws-amplify/auth';
import CircularLoaderWithText from '../components/CircularLoaderWithText';

/**
 * Create UserContext
 */
type UserContextType = {
  isAuth: boolean;
  user: unknown;
};
const UserContext = createContext<UserContextType>({ isAuth: false, user: {} });

/**
 * Create UserProvider
 */
type Props = { children: React.ReactNode };
function UserProvider(props: Props): React.ReactElement {
  const [user, setUser] = useState(useContext(UserContext));
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Authenticating function and update states
  useEffect(() => {
    let cancel = false;

    const authenticatingUser = async () => {
      setIsAuthenticating(true);
      let newStatePlaceholder = {};
      try {
        const authenticatedUser = await Auth.currentAuthenticatedUser();
        newStatePlaceholder = { isAuth: true, user: authenticatedUser };
      } catch (e) {
        newStatePlaceholder = { isAuth: false };
      }
      if (cancel) return;
      setUser((prev) => ({ ...prev, ...newStatePlaceholder }));
      setIsAuthenticating(false);
    };
    authenticatingUser();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <>
      {isAuthenticating ? (
        <CircularLoaderWithText text='Authenticating ...' />
      ) : (
        <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
      )}
    </>
  );
}

export default UserProvider;
