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

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  if (!isPreviewSupported) {
    return (
      <IconButton disabled={true}>
        <WarningIcon />
      </IconButton>
    );
  } else {
    return (
      <>
        {/* Button to open preview */}
        <IconButton onClick={() => setIsPreviewOpen(true)}>
          <VisibilityIcon />
        </IconButton>
        <Dialog
          maxWidth='lg'
          fullWidth={true}
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}>
          <DialogData data={data} />
        </Dialog>
      </>
    );
  }
}

// Helper Function
function isDataTypeSupported(name: string) {
  const dataTypeSupported = [...IMAGE_FILETYPE_LIST, 'html', 'tsv', 'csv', 'json', 'txt', 'yaml'];

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
interface PresignedUrlObject {
  isLoading: boolean;
  presignedUrlString: string;
  presignedUrlContent: string;
}
function DialogData({ data }: Props) {
  const [presignedUrlData, setPresignedUrlData] = useState<PresignedUrlObject>({
    isLoading: true,
    presignedUrlString: '',
    presignedUrlContent: '',
  });

  const fileType = data.name.split('.').pop();

  useEffect(() => {
    let componentUnmount = false;

    const fetchPresignedUrl = async () => {
      const presignedUrlString = await getPreSignedUrl(data.id);

      // Skip stream data if an image file
      let presignedUrlContent = '';
      if (!IMAGE_FILETYPE_LIST.includes(fileType)) {
        presignedUrlContent = await getPreSignedUrlBody(presignedUrlString);
      }

      if (componentUnmount) return;
      setPresignedUrlData({
        isLoading: false,
        presignedUrlString: presignedUrlString,
        presignedUrlContent: presignedUrlContent,
      });
    };
    fetchPresignedUrl();

    return () => {
      componentUnmount = true;
    };
  }, [data.id]);
  return (
    <>
      {/* Dialog that opens the preview */}
      <DialogTitle>{data.name}</DialogTitle>
      <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {presignedUrlData.isLoading ? (
          <CircularProgress />
        ) : IMAGE_FILETYPE_LIST.includes(fileType) ? (
          <ImageViewer presignedUrl={presignedUrlData.presignedUrlString} />
        ) : fileType === 'html' ? (
          <HTMLViewers fileContent={presignedUrlData.presignedUrlContent} />
        ) : (
          <>{`Some Component`}</>
        )}
      </DialogContent>
    </>
  );
}

// Helper function
async function getPreSignedUrl(id: string) {
  const apiResponse = await API.get('files', `/gds/${id}/presign`, {});

  if (Object.keys(apiResponse).includes('error')) {
    throw Error('Unable to fetch get presigned url.');
  }

  return await API.get('files', `/gds/${id}/presign`, {});
}

async function getPreSignedUrlBody(url: string) {
  const fetchResponse = await fetch(url);

  if (fetchResponse.status < 200 && fetchResponse.status >= 300) {
    throw Error('Non 20X status response from presigned url');
  }

  const responseString = await fetchResponse.text();
  return responseString;
}

/**
 * Component to view preSignedURL data
 */
type ImageViewerProps = { presignedUrl: string };
function ImageViewer({ presignedUrl }: ImageViewerProps) {
  return <img style={{ maxHeight: '100%', maxWidth: '100%' }} src={presignedUrl} />;
}

type HTMLViewersProps = { fileContent: string };
function HTMLViewers({ fileContent }: HTMLViewersProps) {
  return <iframe style={{ height: '80vh', width: '100%' }} srcDoc={fileContent} />;
}
