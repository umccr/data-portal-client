/* eslint-disable */
import React, { useState, useEffect } from 'react';

// AWS Amplify
import { API } from 'aws-amplify';

// Material- UI
import WarningIcon from '@material-ui/icons/Warning';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';

const IMAGE_FILETYPE_LIST: string[] = ['png', 'jpg', 'jpeg'];
/**
 * Preview Action Button
 */
type Props = { data: any };

export default function PreviewActionButton({ data }: Props) {
  const isPreviewSupported = isDataTypeSupported(data.name);

  if (!isPreviewSupported) {
    return (
      <IconButton disabled={true}>
        <WarningIcon />
      </IconButton>
    );
  } else {
    return <PreviewButton data={data} />;
  }
}

// Helper Function
function isDataTypeSupported(name: string) {
  const dataTypeSupported = [...IMAGE_FILETYPE_LIST, 'tsv', 'csv', 'json', 'txt', 'yaml'];

  for (const dataType of dataTypeSupported) {
    if (name.endsWith(dataType)) {
      return true;
    }
  }
  return false;
}

/**
 * Handle Preview Button when Open
 */

function PreviewButton({ data }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [presignedUrl, setPresignedUrl] = useState<string>('');

  const fileType = data.name.split('.').pop();

  useEffect(() => {
    let componentUnmount = false;

    const fetchPresignedUrl = async () => {
      setIsLoading(true);

      const presignedUrlRequest = await getPreSignedUrl(data.id);

      if (componentUnmount) return;

      setPresignedUrl(presignedUrlRequest);
      setIsLoading(false);
    };
    fetchPresignedUrl();

    return () => {
      componentUnmount = true;
    };
  }, [data.id]);

  return (
    <>
      {/* Button to open preview */}
      <IconButton onClick={() => setIsPreviewOpen(true)}>
        <VisibilityIcon />
      </IconButton>

      {/* Dialog that opens the preview */}
      <Dialog
        maxWidth='lg'
        fullWidth={true}
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}>
        <DialogTitle>{data.name}</DialogTitle>

        <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {isLoading ? (
            <CircularProgress />
          ) : IMAGE_FILETYPE_LIST.includes(fileType) ? (
            <ImageViewer presignedUrl={presignedUrl} />
          ) : fileType === 'txt' ? (
            <TxtViewer presignedUrl={presignedUrl} />
          ) : (
            <>{`Some Component`}</>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function
async function getPreSignedUrl(id: string) {
  return await API.get('files', `/gds/${id}/presign`, {});
}

/**
 * Component to view preSignedURL data
 */
type ImageViewerProps = { presignedUrl: string };
function ImageViewer({ presignedUrl }: ImageViewerProps) {
  return <img style={{ maxHeight: '100%', maxWidth: '100%' }} src={presignedUrl} />;
}

type TxtViewerProps = { presignedUrl: string };
function TxtViewer({ presignedUrl }: TxtViewerProps) {
  return <Typography>{presignedUrl}</Typography>;
}
