import { API, Auth } from 'aws-amplify';

export const getPreSignedUrl = async (bucket, key) => {
  return await API.get('files', `/presign?bucket=${bucket}&key=${key}`, {});
};

export const getJwtToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};
