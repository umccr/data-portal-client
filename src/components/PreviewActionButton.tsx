/* eslint-disable */
import React, { useState, useEffect } from 'react';

// AWS Amplify
import { API } from 'aws-amplify';

// Material- UI
import CloseIcon from '@material-ui/icons/Close';
import AllOutIcon from '@material-ui/icons/AllOut';
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
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { makeStyles } from '@material-ui/core/styles';

// Other Dependencies
import JSONPretty from 'react-json-pretty';

const IMAGE_FILETYPE_LIST: string[] = ['png', 'jpg', 'jpeg'];
const DELIMITER_SERPERATED_VALUE_FILETYPE_LIST: string[] = ['csv', 'tsv'];
const PLAIN_FILETYPE_LIST: string[] = ['txt', 'md5sum'];
/**
 * Preview Action Button
 */
type Props = { data: any };

const useStylesButtonIcon = makeStyles({
  typeWarning: {
    position: 'relative',
    '& p': {
      display: 'none',
      width: '100%',
    },
    '&:hover': {
      '& p': {
        backgroundColor: 'white',
        border: '1px solid black',
        position: 'absolute',
        display: 'inline',
        width: 'max-content',
        top: '-2.2rem',
        left: '-100%',
        padding: '3px',
      },
    },
  },
});

export default function PreviewActionButton({ data }: Props) {
  const iconClasses = useStylesButtonIcon();
  const isDataTypeSupported = checkIsDataTypeSupoorted(data.name);
  const isFileSizeSupported = checkIsFileSizeSupported(data.size_in_bytes);

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  if (!isDataTypeSupported) {
    return (
      <div className={iconClasses.typeWarning}>
        <IconButton disabled={true}>
          <WarningIcon />
        </IconButton>
        <p>Unsupported FileType</p>
      </div>
    );
  } else if (!isFileSizeSupported) {
    return (
      <div className={iconClasses.typeWarning}>
        <IconButton disabled={true}>
          <AllOutIcon />
        </IconButton>
        <p>FileSize exceed 15MB</p>
      </div>
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
          <IconButton
            style={{ position: 'absolute', right: '0', top: '5px' }}
            onClick={() => setIsPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Dialog>
      </>
    );
  }
}

// Helper Function
function checkIsDataTypeSupoorted(name: string): boolean {
  const dataTypeSupported = [
    ...IMAGE_FILETYPE_LIST,
    ...DELIMITER_SERPERATED_VALUE_FILETYPE_LIST,
    ...PLAIN_FILETYPE_LIST,
    'html',
    'json',
    'yaml',
  ];

  for (const dataType of dataTypeSupported) {
    if (name.endsWith(dataType)) {
      return true;
    }
  }
  return false;
}
function checkIsFileSizeSupported(size_in_bytes: number): boolean {
  // Only support file less than 15MB
  if (size_in_bytes < 15000000) return true;
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
  let fileType = 'json';

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
      <DialogContent
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#525659',
          overflow: 'hidden',
        }}>
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
        ) : fileType === 'json' ? (
          <JSONViewer fileContent={presignedUrlData.presignedUrlContent} />
        ) : fileType === 'yaml' ? (
          <YAMLViewer fileContent={presignedUrlData.presignedUrlContent} />
        ) : (
          <PlainTextViewer fileContent={presignedUrlData.presignedUrlContent} />
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

const useStylesJSONViewers = makeStyles({
  root: {
    '& pre': {
      margin: 0,
    },
  },
});

type JSONViewerProps = { fileContent: string };
function JSONViewer({ fileContent }: JSONViewerProps) {
  const JSONParse = JSON.parse(fileContent);
  const classes = useStylesJSONViewers();

  const cssTheme = {
    main: 'line-height:1.3;color:#a21515;background:#ffffff;overflow:auto;',
    error: 'line-height:1.3;color:#a21515;background:#ffffff;overflow:auto;',
    key: 'color:#a21515;',
    string: 'color:#0551a5;',
    value: 'color:#0b8658;',
    boolean: 'color:#0551a5;',
  };

  // Sanitize if JSON is
  let JSONString: string = '';
  try {
    const JSONParse = JSON.parse(fileContent);
    JSONString = JSON.stringify(JSONParse, null, 2);
  } catch (err) {
    JSONString = fileContent;
  }
  return (
    <Paper
      elevation={3}
      className={classes.root}
      style={{ maxWidth: '100%', maxHeight: '80vh', display: 'flex' }}>
      <JSONPretty
        id='json-pretty'
        data={JSONParse}
        theme={cssTheme}
        style={{
          borderRadius: '5px',
          overflow: 'auto',
        }}
      />
    </Paper>
  );
}

type YAMLViewerProps = { fileContent: string };
function YAMLViewer({ fileContent }: YAMLViewerProps) {
  return (
    <div style={{ maxHeight: '80vh', maxWidth: '100%', overflow: 'auto', margin: '1rem' }}>
      <pre
        style={{
          display: 'inline-block',
          borderRadius: '5px',
          border: '1px solid black',
          backgroundColor: 'white',
          padding: '1rem',
          margin: 0,
        }}>
        {fileContent}
      </pre>
    </div>
  );
}

type PlainTextViewerProps = { fileContent: string };
function PlainTextViewer({ fileContent }: PlainTextViewerProps) {
  return (
    <div style={{ maxHeight: '80vh', maxWidth: '100%', overflow: 'auto', margin: '1rem' }}>
      <pre
        style={{
          display: 'inline-block',
          borderRadius: '5px',
          border: '1px solid black',
          backgroundColor: 'white',
          padding: '1rem',
          margin: 0,
        }}>
        {fileContent}
      </pre>
    </div>
  );
}
