import React from 'react';
import { Card } from 'primereact/card';
import { useQuery } from 'react-query';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useToastContext } from '../../../providers/ToastProvider';
import API from '@aws-amplify/api';
import { Link } from 'react-router-dom';

const fetchMetadataList = async () => {
  return await API.get('portal', '/metadata/', {});
};

function MetadataHomeCard() {
  const toast = useToastContext();

  const { isFetching, isLoading, isError, data } = useQuery(['getMetadataList', {}], () =>
    fetchMetadataList()
  );

  if (isError) {
    toast?.show({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }

  let totalMetadataCount = 0;
  if (data) totalMetadataCount = data.pagination.count;

  return (
    <Link to='/metadata' style={{ textDecoration: 'unset' }}>
      <Card className='mb-0'>
        {isLoading && isFetching ? (
          <div className='flex justify-content-center align-items-center'>
            <CircularLoaderWithText />
          </div>
        ) : (
          <>
            <div className='flex justify-content-between mb-3'>
              <div>
                <span className='block text-500 font-medium mb-3'>Metadata</span>
                <div className='text-900 font-medium text-xl'>{totalMetadataCount}</div>
              </div>
              <div
                className='flex align-items-center justify-content-center bg-orange-100 border-round'
                style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className='pi pi-database text-orange-500 text-xl' />
              </div>
            </div>
          </>
        )}
      </Card>
    </Link>
  );
}

export default MetadataHomeCard;
