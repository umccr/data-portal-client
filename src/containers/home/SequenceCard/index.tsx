import React, { useEffect } from 'react';
import { Card } from 'primereact/card';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useToastContext } from '../../../providers/ToastProvider';
import { usePortalSequenceAPI } from '../../../api/sequence';

function SequenceHomeCard() {
  const { toastShow } = useToastContext();

  const { isFetching, isLoading, isError, data } = usePortalSequenceAPI({});

  useEffect(() => {
    if (isError) {
      toastShow({
        severity: 'error',
        summary: 'Something went wrong!',
        detail: 'Unable to fetch data from Portal API',
        life: 3000,
      });
    }
  }, [isError]);

  let totalSequenceCount = 0;
  if (data) totalSequenceCount = data.pagination.count;

  return (
    <Card className='mb-0 surface-100'>
      {isLoading && isFetching ? (
        <div className='flex justify-content-center align-items-center'>
          <CircularLoaderWithText />
        </div>
      ) : (
        <>
          <div className='flex justify-content-between mb-3'>
            <div>
              <span className='block text-500 font-medium mb-3'>Sequence</span>
              <div className='text-900 font-medium text-xl'>{totalSequenceCount}</div>
            </div>
            <div
              className='flex align-items-center justify-content-center bg-purple-100 border-round'
              style={{ width: '2.5rem', height: '2.5rem' }}>
              <i className='pi pi-desktop text-purple-500 text-xl' />
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export default SequenceHomeCard;
