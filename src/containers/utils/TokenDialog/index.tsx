import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { fetchAuthSession } from 'aws-amplify/auth';
import moment from 'moment';

import CircularLoaderWithText from '../../../components/CircularLoaderWithText';

import './index.css';
import { getJwtToken } from '../../../utils/signer';

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

  // Fetch new JWT Token
  useEffect(() => {
    let cancel = false;
    const fetchingNewToken = async () => {
      setIsLoading(true);

      // Force refresh to get brand new token
      await fetchAuthSession({ forceRefresh: true });

      const token = await getJwtToken();
      if (!token) throw new Error('');

      if (cancel) return;
      setIsLoading(false);
      setJWTData({
        token: token.toString(),
        expires: token.payload.exp?.toString() ?? '',
      });
      setIsLoading(false);
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
      <Dialog
        header='Token'
        visible={isOpen}
        style={{ width: '50vw' }}
        draggable={false}
        resizable={false}
        onHide={() => handleIsOpen(false)}>
        <Toast
          ref={toast}
          position='top-center'
          className='opacity-100 w-6'
          style={{ maxWidth: '1000px' }}
        />
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
              ]}>
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
