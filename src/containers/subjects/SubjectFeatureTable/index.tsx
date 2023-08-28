import { useToastContext } from '../../../providers/ToastProvider';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import React, { useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
import './index.css';
import { FeatureSkeleton } from '../../../components/skel/FeatureSkeleton';

type Props = { subjectId: string };

function SubjectFeatureTable(props: Props) {
  let images: string[] = [];

  const { subjectId } = props;

  const { toastShow } = useToastContext();

  const { isLoading, isError, data } = usePortalSubjectDataAPI(subjectId);

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

  if (isLoading) {
    return <FeatureSkeleton />;
  }

  if (data && !isLoading) {
    const { features } = data;
    if (Array.isArray(features) && features.length) {
      // feature_content_url = features[0];
      images = features;
    }
  }

  const itemTemplate = (item: string) => {
    return <img src={item} alt={''} style={{ width: '100%', display: 'block' }} />;
  };

  const caption = (item: string) => {
    const filename = new URL(item).pathname.split('/').pop();
    return (
      <React.Fragment>
        <div
          style={{ overflowWrap: 'anywhere' }}
          className='flex flex-wrap align-items-center justify-content-center'>
          <h4 className='mb-1'>{filename}</h4>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div>
      {images ? (
        // <img src={feature_content_url} style={{ width: '100%', height: 'auto' }} alt={''} />
        <div className='card'>
          <Galleria
            value={images}
            numVisible={5}
            circular
            // style={{ maxWidth: '640px' }}
            showItemNavigators
            showItemNavigatorsOnHover
            showIndicators
            indicatorsPosition='bottom'
            showThumbnails={false}
            item={itemTemplate}
            caption={caption}
          />
        </div>
      ) : (
        <img
          src='data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='
          alt={''}
        />
      )}
    </div>
  );
}

export default SubjectFeatureTable;
