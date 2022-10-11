import { Auth } from '@aws-amplify/auth';

export const getJwtToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};
