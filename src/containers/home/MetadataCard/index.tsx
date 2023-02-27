import React, { useEffect } from 'react';
import { Card } from 'primereact/card';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useToastContext } from '../../../providers/ToastProvider';
import { Link } from 'react-router-dom';
import { usePortalMetadataAPI } from '../../../api/metadata';

function MetadataHomeCard() {
  const { toastShow } = useToastContext();

  const { isFetching, isLoading, isError, data } = usePortalMetadataAPI({ apiConfig: {} });

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

  let totalMetadataCount = 0;
  if (data) totalMetadataCount = data.pagination.count;

  return (
    <Link to='/metadata' style={{ textDecoration: 'unset' }}>
      <Card className='mb-0'>
        <div className='flex justify-content-between mb-3'>
          <div>
            <span className='block text-500 font-medium mb-3'>Metadata</span>
            {isLoading || isFetching || !totalMetadataCount ? (
              <div className='flex justify-content-center align-items-center max-w-fit'>
                <CircularLoaderWithText spinnerSize='20px' />
              </div>
            ) : (
              <div className='text-900 font-medium text-xl'>{totalMetadataCount}</div>
            )}
          </div>
          <div
            className='flex align-items-center justify-content-center bg-orange-100 border-round'
            style={{ width: '2.5rem', height: '2.5rem' }}>
            <i className='pi pi-database text-orange-500 text-xl' />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default MetadataHomeCard;
