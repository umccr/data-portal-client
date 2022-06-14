import { API } from '@aws-amplify/api';
import { Auth } from '@aws-amplify/auth';

export const getPreSignedUrl = async (bucket: string, key: string) => {
  return await API.get('portal', `/presign?bucket=${bucket}&key=${key}`, {});
};

export const getJwtToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};
