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
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

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

  // const fileType = data.name.split('.').pop();
  let fileType = 'csv';

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
        ) : fileType === 'csv' ? (
          <CSVViewers fileContent={presignedUrlData.presignedUrlContent} />
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
  return apiResponse;
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

type CSVViewersProps = { fileContent: string };
function CSVViewers({ fileContent }: CSVViewersProps) {
  const [isFirstRowHeader, setIsFirstRowHeader] = useState<boolean>(true);

  // Sanitize and split string
  const sanitizeContent: string = fileContent.replaceAll('\r\n', '\n');
  const allRows: string[] = sanitizeContent.split('\n').filter((element) => element);

  const dataRows = allRows.slice(isFirstRowHeader ? 1 : 0);
  const headerRow = isFirstRowHeader ? allRows[0] : null;

  return (
    <div style={{ width: '100%' }}>
      <FormControlLabel
        value='end'
        control={
          <Checkbox
            color='primary'
            size='small'
            checked={isFirstRowHeader}
            onChange={() => setIsFirstRowHeader((prev) => !prev)}
          />
        }
        label='Header row'
        labelPlacement='end'
        style={{ marginBottom: '0.5rem' }}
      />
      <Paper elevation={3} style={{ width: '100%' }}>
        <TableContainer style={{ maxHeight: '75vh' }}>
          <Table stickyHeader aria-label='sticky table'>
            <TableHead>
              {headerRow ? (
                <TableRow>
                  {headerRow.split(',').map((column: string) => (
                    <TableCell key={column}>{column}</TableCell>
                  ))}
                </TableRow>
              ) : (
                <></>
              )}
            </TableHead>

            <TableBody>
              {dataRows.map((row: string, index: number) => {
                return (
                  <TableRow hover role='checkbox' tabIndex={-1} key={index}>
                    {row.split(',').map((value: string, index: number) => {
                      return <TableCell key={index}>{value}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}
