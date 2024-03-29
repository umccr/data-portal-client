import React, { useEffect } from 'react';
import { Card } from 'primereact/card';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useToastContext } from '../../../providers/ToastProvider';
import { Link } from 'react-router-dom';
import { usePortalLimsAPI } from '../../../api/lims';

function LimsHomeCard() {
  const { toastShow } = useToastContext();

  const { isFetching, isLoading, isError, data } = usePortalLimsAPI({});

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

  let totalLimsCount = 0;
  if (data) totalLimsCount = data.pagination.count;

  return (
    <Link to='/lims' style={{ textDecoration: 'unset' }}>
      <Card className='mb-0'>
        <div className='flex justify-content-between mb-3'>
          <div>
            <span className='block text-500 font-medium mb-3'>LIMS</span>
            {isLoading || isFetching || !totalLimsCount ? (
              <div className='flex justify-content-center align-items-center max-w-fit'>
                <CircularLoaderWithText spinnerSize='20px' />
              </div>
            ) : (
              <div className='text-900 font-medium text-xl'>{totalLimsCount}</div>
            )}
          </div>
          <div
            className='flex align-items-center justify-content-center bg-green-100 border-round'
            style={{ width: '2.5rem', height: '2.5rem' }}>
            <i className='pi pi-book text-green-500 text-xl' />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default LimsHomeCard;
