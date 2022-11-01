import React, { useEffect } from 'react';
import { Card } from 'primereact/card';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useToastContext } from '../../../providers/ToastProvider';
import { usePortalRunsAPI } from '../../../api/run';
import { Link } from 'react-router-dom';

function RunHomeCard() {
  const { toastShow } = useToastContext();

  const { isFetching, isLoading, isError, data } = usePortalRunsAPI({});

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

  let totalRunCount = 0;
  if (data) totalRunCount = data.pagination.count;

  return (
    <Link to='/runs' style={{ textDecoration: 'unset' }}>
      <Card className='mb-0'>
        {isLoading && isFetching ? (
          <div className='flex justify-content-center align-items-center'>
            <CircularLoaderWithText />
          </div>
        ) : (
          <>
            <div className='flex justify-content-between mb-3'>
              <div>
                <span className='block text-500 font-medium mb-3'>Runs</span>
                <div className='text-900 font-medium text-xl'>{totalRunCount}</div>
              </div>
              <div
                className='flex align-items-center justify-content-center  bg-green-100 border-round'
                style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className='pi pi-book text-green-500 text-xl' />
              </div>
            </div>
          </>
        )}
      </Card>
    </Link>
  );
}

export default RunHomeCard;
