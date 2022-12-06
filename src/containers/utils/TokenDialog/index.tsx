import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { useUserContext } from '../../../providers/UserProvider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import moment from 'moment';

import CircularLoaderWithText from '../../../components/CircularLoaderWithText';

import './index.css';

type Props = {
  isOpen: boolean;
  handleIsOpen: (val: boolean) => void;
};

type JWTTokenProps = {
  token: string;
  expires: string;
};

// For Data Table show
type rowDataType = {
  key: string;
  value: string;
};
const keyTemplate = (rowData: rowDataType) => {
  return <div className='font-semibold uppercase white-space-nowrap'>{rowData.key}</div>;
};
const Header = () => (
  <div className='text-red-600'>
    WARNING: THIS IS YOUR PERSONAL ACCESS TOKEN (PAT). YOU SHOULD NOT SHARE WITH ANY THIRD PARTY!
  </div>
);

function TokenDialog(props: Props) {
  const toast = useRef<Toast>(null);
  const { isOpen, handleIsOpen } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [JWTData, setJWTData] = useState<JWTTokenProps>({ token: '', expires: '' });
  const cognitoUser = useUserContext().user;

  // Fetch new JWT Token
  useEffect(() => {
    let cancel = false;
    const fetchingNewToken = async () => {
      const currentSession = cognitoUser.getSignInUserSession();

      // Refresh token to get new JWT
      // Ref (UseCase 32): https://www.npmjs.com/package/amazon-cognito-identity-js
      const refreshToken = currentSession.getRefreshToken();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cognitoUser.refreshSession(refreshToken, (err: any, session: any) => {
        if (err) {
          console.log('Something went wrong');
        }
        const { idToken } = session;

        if (cancel) return;

        setIsLoading(false);
        setJWTData({
          token: idToken.getJwtToken(),
          expires: idToken.getExpiration(),
        });
      });
      if (cancel) return;
    };

    fetchingNewToken();
    return () => {
      cancel = true;
    };
  }, []);

  const handleCopyButton = () => {
    navigator.clipboard.writeText(JWTData.token);
    toast.current?.show({
      severity: 'success',
      summary: 'JWT Copied to the clipboard!',
      life: 3000,
    });
  };

  return (
    <>
      <Toast
        ref={toast}
        position='top-center'
        className='opacity-100 w-6'
        style={{ maxWidth: '1000px' }}
      />
      <Dialog
        header='Token'
        visible={isOpen}
        style={{ width: '50vw' }}
        draggable={false}
        resizable={false}
        onHide={() => handleIsOpen(false)}>
        {isLoading ? (
          <CircularLoaderWithText text='Fetching new token ...' />
        ) : (
          <>
            <DataTable
              header={<Header />}
              value={[
                {
                  key: 'Expires in',
                  value: moment.unix(parseInt(JWTData.expires)).toString(),
                },
                { key: 'JWT', value: JWTData.token },
              ]}
              responsiveLayout='scroll'>
              <Column headerStyle={{ display: 'none' }} field='key' body={keyTemplate} />
              <Column headerStyle={{ display: 'none' }} field='value' />
            </DataTable>
            <div style={{ padding: '1rem 0rem' }}>
              <Button
                label='Copy'
                icon='pi pi-copy'
                className='p-button-raised p-button-secondary'
                style={{ width: '100%' }}
                onClick={handleCopyButton}
              />
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}

export default TokenDialog;
