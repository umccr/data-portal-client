import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserAttributes, FetchUserAttributesOutput } from '@aws-amplify/auth';
import CircularLoaderWithText from '../../components/CircularLoaderWithText';

const UserContext = createContext<{ isAuth: boolean; user: FetchUserAttributesOutput }>({
  isAuth: false,
  user: {},
});

/**
 * Create UserProvider
 */
type Props = { children: React.ReactNode };
function UserProvider(props: Props): React.ReactElement {
  const [user, setUser] = useState(useContext(UserContext));
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  // Authenticating function and update states
  useEffect(() => {
    let cancel = false;

    const authenticatingUser = async () => {
      setIsAuthenticating(true);
      let newStatePlaceholder = {};
      try {
        const userAttribute = await fetchUserAttributes();
        newStatePlaceholder = { isAuth: true, user: userAttribute };
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

// Export to be imported elsewhere
export function useUserContext() {
  return useContext(UserContext);
}
