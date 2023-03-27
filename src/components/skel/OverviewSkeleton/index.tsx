import { Skeleton } from 'primereact/skeleton';

export const OverviewSkeleton = () => {
  return (
    <div className='grid'>
      <div className='col-6'>
        <Skeleton className='mb-2'></Skeleton>
        <Skeleton width='10rem' className='mb-2' />
        <Skeleton width='5rem' className='mb-2' />
        <Skeleton height='2rem' className='mb-2' />
        <Skeleton width='10rem' height='4rem' />
      </div>
      <div className='col-6'>
        <Skeleton className='mb-2' />
        <Skeleton width='10rem' className='mb-2' />
        <Skeleton width='5rem' className='mb-2' />
        <Skeleton height='2rem' className='mb-2' />
        <Skeleton width='10rem' height='4rem' />
      </div>
    </div>
  );
};
