import { API } from 'aws-amplify';

const getFileSignedURL = async (bucket, key) => {
  return await API.get('files', `/file-signed-url?bucket=${bucket}&key=${key}`, {});
};

export default getFileSignedURL;
