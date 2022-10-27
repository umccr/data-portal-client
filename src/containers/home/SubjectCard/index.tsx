import React from 'react';
import { Card } from 'primereact/card';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useToastContext } from '../../../providers/ToastProvider';
import { Link } from 'react-router-dom';
import { usePortalSubjectAPI } from '../../../api/subject';

function SubjectHomeCard() {
  const { toastShow } = useToastContext();

  const { isFetching, isLoading, isError, data } = usePortalSubjectAPI({});

  if (isError) {
    toastShow({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }

  let totalSubjectCount = 0;
  if (data) totalSubjectCount = data.pagination.count;

  return (
    <Link to='/subjects' style={{ textDecoration: 'unset' }}>
      <Card className='mb-0'>
        {isLoading && isFetching ? (
          <div className='flex justify-content-center align-items-center'>
            <CircularLoaderWithText />
          </div>
        ) : (
          <>
            <div className='flex justify-content-between mb-3'>
              <div>
                <span className='block text-500 font-medium mb-3'>Subjects</span>
                <div className='text-900 font-medium text-xl'>{totalSubjectCount}</div>
              </div>
              <div
                className='flex align-items-center justify-content-center bg-blue-100 border-round'
                style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className='pi pi-users text-blue-500 text-xl' />
              </div>
            </div>
          </>
        )}
      </Card>
    </Link>
  );
}

export default SubjectHomeCard;
