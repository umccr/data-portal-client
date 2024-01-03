import { fetchAuthSession } from '@aws-amplify/auth';

export const getJwtToken = async () => {
  return (await fetchAuthSession()).tokens?.idToken;
};
