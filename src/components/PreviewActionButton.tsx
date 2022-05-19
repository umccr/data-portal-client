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
          <HTMLViewer fileContent={presignedUrlData.presignedUrlContent} />
        ) : fileType === 'csv' ? (
          <DelimiterSeperatedValuesViewer
            fileContent={presignedUrlData.presignedUrlContent}
            delimiter=','
          />
        ) : fileType === 'tsv' ? (
          <DelimiterSeperatedValuesViewer
            fileContent={presignedUrlData.presignedUrlContent}
            delimiter='\t'
          />
        ) : (
          <>{`Some Component`}</>
        )}
      </DialogContent>
    </>
  );
}

// Helper function
async function getPreSignedUrl(id: string) {
  return 'https://umccr-temp-dev.s3.ap-southeast-2.amazonaws.com/william/test-head.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA4IXYHPYNGAMPUGH3%2F20220519%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20220519T010754Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAgaDmFwLXNvdXRoZWFzdC0yIkgwRgIhAOYmByZSzrHjwPEBA1RBk8whXCcmfm05Me8AmijUlZ%2B1AiEAkzTbUCoapcP3tbFaY3yqnMiEL4DiGUNNFBoVu8aKYvsqoQMI4f%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARADGgw4NDM0MDc5MTY1NzAiDFtMI%2F7IevQQnLESNSr1AnorHEMrHV9NIr4E%2FsX82gOZT9SS%2BZfvcXVrAavvNXpZ8Svr0c7krNUmmqcGoePOx%2FRVq0ixVAs2ipcPOpj01KAaoyHk0HfleFR%2Bjd1kv8gsIHKni7wK%2FL7lpsJa32JXCrTqsP%2FSGCQbRwOgt3vaV2w4nqocYDLgJkRRQxGjV1s3LANgEO0Kg51qXntua9GjTw3fTH5DV%2Fq0sCYzdsQOvNdJaKufP8Q2yYkwjE%2B%2BSYc38wIIXpQXhIa2xnQUwgVzl%2BvGA3Xe5mwTG6nqMg0aqrMZsFVyV5v%2Fy066GSpphKwm61S8yBusLbO1hkWyba99GaYjLt7bx66GVD1qGYBR59Z6D5H5K3iaOt1qLgaTy8D1JOPJMKBr%2B2EVbED0msx7KlEadIM5%2BvqRkl7wRAnCmh14upxGoctRzhHf0bi%2Beet7yH9Aq6%2FAWcqMulYHfzs2dPVuE292BKG6fxhSdCXPBIOfY13bJeZ6Yw%2FrlLIgdQTFDX%2B4kLoww4uWlAY6pQHOBU1PaXC7w%2Bq5%2BYn2D0rbZG7gX83i4q3oyv9lx3Fyrd2cwARgZHUOnJrjP%2FjFOAiffm0quBH4duHuNzRvCDJlgDfkzqaWSfOMn2mKE5Er0m2UCtzrzK30af%2B3Du01INuSAzhaLZ%2F9eoxPKBIcNObtEM5VkcLueBNw0b%2FJgaagVNZARovovI2Ts6sad3H%2FJI%2B85y0WOb14bCrTr2IxO0SFlMxTVFc%3D&X-Amz-Signature=46c035afff7a26eacd5780ec977037bd40da2fefad5d4c8150170a938b7418c6';
  return 'https://umccr-temp-dev.s3.ap-southeast-2.amazonaws.com/william/test-head.tsv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA4IXYHPYNGAMPUGH3%2F20220519%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20220519T005208Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAgaDmFwLXNvdXRoZWFzdC0yIkgwRgIhAOYmByZSzrHjwPEBA1RBk8whXCcmfm05Me8AmijUlZ%2B1AiEAkzTbUCoapcP3tbFaY3yqnMiEL4DiGUNNFBoVu8aKYvsqoQMI4f%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARADGgw4NDM0MDc5MTY1NzAiDFtMI%2F7IevQQnLESNSr1AnorHEMrHV9NIr4E%2FsX82gOZT9SS%2BZfvcXVrAavvNXpZ8Svr0c7krNUmmqcGoePOx%2FRVq0ixVAs2ipcPOpj01KAaoyHk0HfleFR%2Bjd1kv8gsIHKni7wK%2FL7lpsJa32JXCrTqsP%2FSGCQbRwOgt3vaV2w4nqocYDLgJkRRQxGjV1s3LANgEO0Kg51qXntua9GjTw3fTH5DV%2Fq0sCYzdsQOvNdJaKufP8Q2yYkwjE%2B%2BSYc38wIIXpQXhIa2xnQUwgVzl%2BvGA3Xe5mwTG6nqMg0aqrMZsFVyV5v%2Fy066GSpphKwm61S8yBusLbO1hkWyba99GaYjLt7bx66GVD1qGYBR59Z6D5H5K3iaOt1qLgaTy8D1JOPJMKBr%2B2EVbED0msx7KlEadIM5%2BvqRkl7wRAnCmh14upxGoctRzhHf0bi%2Beet7yH9Aq6%2FAWcqMulYHfzs2dPVuE292BKG6fxhSdCXPBIOfY13bJeZ6Yw%2FrlLIgdQTFDX%2B4kLoww4uWlAY6pQHOBU1PaXC7w%2Bq5%2BYn2D0rbZG7gX83i4q3oyv9lx3Fyrd2cwARgZHUOnJrjP%2FjFOAiffm0quBH4duHuNzRvCDJlgDfkzqaWSfOMn2mKE5Er0m2UCtzrzK30af%2B3Du01INuSAzhaLZ%2F9eoxPKBIcNObtEM5VkcLueBNw0b%2FJgaagVNZARovovI2Ts6sad3H%2FJI%2B85y0WOb14bCrTr2IxO0SFlMxTVFc%3D&X-Amz-Signature=fbc6f181b36f3d44b2d1e23528ee01cf3389f8b3f777fe6d6e95833f6ffe7fa2';
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

type HTMLViewerProps = { fileContent: string };
function HTMLViewer({ fileContent }: HTMLViewerProps) {
  return <iframe style={{ height: '80vh', width: '100%' }} srcDoc={fileContent} />;
}

type DelimiterSeperatedValuesViewerProps = {
  fileContent: string;
  delimiter: string;
};
function DelimiterSeperatedValuesViewer(props: DelimiterSeperatedValuesViewerProps) {
  const { fileContent, delimiter } = props;
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
                  {headerRow.split(delimiter).map((column: string) => (
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
                    {row.split(delimiter).map((value: string, index: number) => {
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
