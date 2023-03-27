import { Skeleton } from 'primereact/skeleton';

export const FeatureSkeleton = () => {
  return (
    <div className='grid'>
      <div className='col-12'>
        <div className='flex flex-grow-1 align-items-center justify-content-center'>
          <Skeleton shape='circle' size='20rem' />
        </div>
        <Skeleton className='mt-2' />
      </div>
    </div>
  );
};
