import { Skeleton } from 'primereact/skeleton';

export const TableSkeleton = () => {
  return (
    <div className='grid'>
      <div className='col-12'>
        <div className='grid'>
          <div className='col-2'>
            <Skeleton className='mb-2' />
          </div>
          <div className='col-2'>
            <Skeleton className='mb-2' />
          </div>
          <div className='col-8'>
            <div className='flex flex-grow-1 align-items-center justify-content-center'>
              <Skeleton />
            </div>
          </div>
        </div>
      </div>
      <div className='col-12'>
        <div className='grid'>
          <div className='col-2'>
            <Skeleton className='mb-2' />
            <Skeleton className='mb-2' />
            <Skeleton className='mb-2' />
            <Skeleton className='mb-2' />
          </div>
          <div className='col-2'>
            <Skeleton className='mb-2' />
            <Skeleton className='mb-2' />
            <Skeleton className='mb-2' />
            <Skeleton className='mb-2' />
          </div>
          <div className='col-8'>
            <div className='flex flex-grow-1 align-items-center justify-content-center'>
              <Skeleton height='4rem' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
