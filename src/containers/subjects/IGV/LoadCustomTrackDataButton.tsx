import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { RequiredGDSRowType, RequiredS3RowType } from './utils';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { GDSApiData, usePortalGDSAPI } from '../../../api/gds';
import { S3ApiData, usePortalS3API } from '../../../api/s3';
import { isIgvReadableFile } from './LoadSubjectDataButton';

type Props = {
  handleAddCustomS3LoadTrack(newTrackData: RequiredS3RowType): void;
  handleAddCustomGDSLoadTrack(newTrackData: RequiredGDSRowType): void;
};
enum URIType {
  GDS,
  S3,
}

function LoadCustomTrackDataButton({
  handleAddCustomS3LoadTrack,
  handleAddCustomGDSLoadTrack,
}: Props) {
  const [inputText, setInputText] = useState<string>('');

  // Check what kind of path type is entered
  let uriType: URIType | '' = '';
  if (inputText?.startsWith('gds://')) {
    uriType = URIType.GDS;
  } else if (inputText?.startsWith('s3://')) {
    uriType = URIType.S3;
  }

  // Check if filetype is supported
  const isFiletypeSupported = isIgvReadableFile(inputText);

  // Strip protocol from path
  // eslint-disable-next-line no-useless-escape
  const reMatch = inputText.match(/(^s3\/\/|^gds:\/\/)([^\/]+)\/\/?(.*?)$/i);
  let path = '';
  let bucketOrVolume = '';
  if (reMatch && reMatch.length === 4) path = reMatch[3]; // Refers to the path after the volume/bucket name
  if (reMatch && reMatch.length === 4) bucketOrVolume = reMatch[2]; // Refers to the volume/bucket name

  const [isAddCustomTrackDialogOpen, setIsAddCustomTrackDialogOpen] = useState<boolean>(false);

  // GDS Row checking (portal must exist to use this)
  const gdsApiRes = usePortalGDSAPI(
    {
      queryStringParameters: {
        search: `${path}$`,
      },
    },
    {
      enabled: uriType === URIType.GDS && isFiletypeSupported,
    }
  );

  // Check if GDS URI entered exist in the portal
  let isValidUri = false;
  const gdsData: GDSApiData = gdsApiRes.data;
  if (gdsData && gdsData.results.length == 1) isValidUri = true;
  if (uriType == URIType.S3) isValidUri = true;

  const handleOpenCustomTrackButton = () => {
    setInputText('');
    setIsAddCustomTrackDialogOpen((prev) => !prev);
  };
  const addNewTrackData = () => {
    if (uriType == URIType.S3) handleAddCustomS3LoadTrack({ key: path, bucket: bucketOrVolume });
    if (uriType == URIType.GDS) handleAddCustomGDSLoadTrack(gdsData.results[0]);
    setIsAddCustomTrackDialogOpen((prev) => !prev);
  };

  const renderFooter = () => {
    return (
      <div className='pt-4'>
        <Button
          label='Cancel'
          icon='pi pi-times'
          onClick={() => setIsAddCustomTrackDialogOpen((prev) => !prev)}
          className='p-button-text text-blue-800'
        />
        <Button
          className='bg-blue-800'
          disabled={!(isValidUri && inputText)}
          label='ADD'
          icon='pi pi-plus'
          onClick={() => addNewTrackData()}
          autoFocus
        />
      </div>
    );
  };
  return (
    <>
      <Dialog
        header={`Add Custom Track`}
        visible={isAddCustomTrackDialogOpen}
        className='w-11'
        draggable={false}
        footer={renderFooter()}
        onHide={() => setIsAddCustomTrackDialogOpen((prev) => !prev)}>
        <>
          <div className='mb-4 text-500'>
            {`To add a custom track, please enter S3 or GDS URI.`}
          </div>
          <div className='my-3'>
            <InputText
              className='w-full block focus:border-blue-800 mb-3'
              style={{ boxShadow: 'var(--blue-800)' }}
              value={inputText}
              placeholder={`e.g. "s3://umccr-primary-data-prod/.../SUBJ0001.bam" or "gds://production/.../SUBJ0001.bam"`}
              onChange={(e) => setInputText(e.target.value)}
            />
            <small>
              {!isFiletypeSupported && inputText ? (
                <div className='text-500 text-red-600'>{`Unsupported filetype. Only support BAM, CRAM, and VCF.`}</div>
              ) : !inputText ? (
                <div className='text-500'>{`Please enter a valid URI.`}</div>
              ) : (
                <>
                  {gdsApiRes.isLoading ? (
                    <div className={`flex flex-row align-items-content`}>
                      <div className='mr-2'>
                        <CircularLoaderWithText spinnerSize='20px' />
                      </div>
                      <div className='text-500 text-yellow-600'>{`Validating GDS URI.`}</div>
                    </div>
                  ) : !isValidUri ? (
                    <div className='text-500 text-red-600'>{`Invalid URI or URI does not exist.`}</div>
                  ) : isValidUri ? (
                    <div className='text-500 text-green-600'>{`URI is valid.`}</div>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </small>
          </div>
        </>
      </Dialog>

      <Button
        onClick={handleOpenCustomTrackButton}
        className='m-1 bg-blue-800 border-blue-800'
        label='CUSTOM'
        icon='pi pi-plus'
      />
    </>
  );
}

export default LoadCustomTrackDataButton;
