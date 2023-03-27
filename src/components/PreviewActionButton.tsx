import React, { useState, useEffect } from 'react';

// AWS Amplify
import { API } from 'aws-amplify';

// Material- UI
import CloseIcon from '@material-ui/icons/Close';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import WarningIcon from '@material-ui/icons/Warning';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { grey } from '@material-ui/core/colors';
import Snackbar from '@material-ui/core/Snackbar';

// Other Dependencies
import JSONPretty from 'react-json-pretty';

const IMAGE_FILETYPE_LIST: string[] = ['png', 'jpg', 'jpeg'];
const HTML_FILETYPE_LIST: string[] = ['html'];
const DELIMITER_SERPERATED_VALUE_FILETYPE_LIST: string[] = ['csv', 'tsv'];
const PLAIN_FILETYPE_LIST: string[] = ['txt', 'md5sum'];
const OTHER_FILETYPE_LIST: string[] = ['json', 'yaml'];

/**
 * Preview Action Button
 */
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
type PreviewActionButtonProps = {
  type: string;
  data: any;
};
export default function PreviewActionButton({ type, data }: PreviewActionButtonProps) {
  const iconClasses = useStylesButtonIcon();

  const fileName = type == 'gds' ? data.name : data.key;
  const fileSize = type == 'gds' ? data.size_in_bytes : data.size;
  const isDataTypeSupported = checkIsDataTypeSupoorted(fileName);
  const isFileSizeSupported = checkIsFileSizeSupported(fileSize);

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const fileExt = fileName.split('.').pop();

  const isCorsOriginBlock =
    type == 's3' && !IMAGE_FILETYPE_LIST.includes(fileExt) && !HTML_FILETYPE_LIST.includes(fileExt);

  if (!isDataTypeSupported) {
    return (
      <div className={iconClasses.typeWarning}>
        <IconButton disabled={true}>
          <VisibilityOffIcon />
        </IconButton>

        {/* Text will show on hover defined on div class */}
        <p>Unsupported FileType</p>
      </div>
    );
  } else if (!isFileSizeSupported) {
    return (
      <div className={iconClasses.typeWarning}>
        <IconButton disabled={true}>
          <VisibilityOffIcon />
        </IconButton>

        {/* Text will show on hover defined on div class */}
        <p>FileSize exceed 60MB</p>
      </div>
    );
  } else if (isCorsOriginBlock) {
    return (
      <div className={iconClasses.typeWarning}>
        <IconButton disabled={true}>
          <VisibilityOffIcon />
        </IconButton>

        {/* Text will show on hover defined on div class */}
        <p>{`Unable to preview '${fileExt}' from S3`}</p>
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
          <DialogData type={type} data={data} />
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
    ...HTML_FILETYPE_LIST,
    ...DELIMITER_SERPERATED_VALUE_FILETYPE_LIST,
    ...PLAIN_FILETYPE_LIST,
    ...OTHER_FILETYPE_LIST,
  ];

  for (const dataType of dataTypeSupported) {
    if (name.endsWith(dataType)) {
      return true;
    }
  }
  return false;
}
function checkIsFileSizeSupported(size_in_bytes: number): boolean {
  // Only support file less than 60MB
  if (size_in_bytes < 60000000) return true;
  return false;
}

/**
 * Handle Preview Button when Open
 */
interface PresignedUrlObject {
  isError: boolean;
  isLoading: boolean;
  presignedUrlString: string;
  presignedUrlContent: string;
}
type DialogDataProps = {
  type: string;
  data: any;
};
function DialogData({ type, data }: DialogDataProps) {
  const [isDataCopied, setIsDataCopied] = useState<boolean>(false);
  const [presignedUrlData, setPresignedUrlData] = useState<PresignedUrlObject>({
    isLoading: true,
    isError: false,
    presignedUrlString: '',
    presignedUrlContent: '',
  });

  const fileName = type == 'gds' ? data.name : data.key.split('/').pop();
  const fileType = fileName.split('.').pop();

  useEffect(() => {
    let componentUnmount = false;

    const fetchPresignedUrl = async () => {
      try {
        const presignedUrlString = await getPreSignedUrl(type, data.id);

        // Skip streaming data if an image and HTML file
        // NOTE: <img> and <html> tag will src to the presignedUrl data
        let presignedUrlContent = '';
        if (!IMAGE_FILETYPE_LIST.includes(fileType) && !HTML_FILETYPE_LIST.includes(fileType)) {
          presignedUrlContent = await getPreSignedUrlBody(presignedUrlString);
        }
        if (componentUnmount) return;
        setPresignedUrlData({
          isError: false,
          isLoading: false,
          presignedUrlString: presignedUrlString,
          presignedUrlContent: presignedUrlContent,
        });
      } catch {
        if (componentUnmount) return;
        setPresignedUrlData({
          isError: true,
          isLoading: false,
          presignedUrlString: '',
          presignedUrlContent: '',
        });
      }
    };
    fetchPresignedUrl();

    return () => {
      componentUnmount = true;
    };
  }, [data.id, type]);

  return (
    <>
      {/* Dialog that opens the preview */}
      <DialogTitle
        style={{
          minHeight: '4rem',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}>
        {fileName}
      </DialogTitle>
      <DialogContent
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#525659',
          overflow: 'hidden',
          padding: '1px 0 0 0',
        }}>
        {presignedUrlData.isLoading ? (
          <div
            style={{
              minHeight: '30vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <CircularProgress />
          </div>
        ) : presignedUrlData.isError ? (
          <WarningIcon fontSize='large' style={{ minHeight: '30vh' }} />
        ) : IMAGE_FILETYPE_LIST.includes(fileType) ? (
          <ImageViewer presignedUrl={presignedUrlData.presignedUrlString} />
        ) : HTML_FILETYPE_LIST.includes(fileType) ? (
          <HTMLViewer presignedUrl={presignedUrlData.presignedUrlString} />
        ) : fileType === 'json' ? (
          <JSONViewer fileContent={presignedUrlData.presignedUrlContent} />
        ) : fileType === 'yaml' ? (
          <YAMLViewer fileContent={presignedUrlData.presignedUrlContent} />
        ) : (
          <PlainTextViewer fileContent={presignedUrlData.presignedUrlContent} />
        )}
        {presignedUrlData.presignedUrlContent ? (
          <>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(presignedUrlData.presignedUrlContent);
                setIsDataCopied(true);
              }}
              color='primary'
              aria-label='Copy content data'
              style={{
                backgroundColor: grey[300],
                position: 'absolute',
                right: 0,
                bottom: '0.5rem',
              }}>
              <FileCopyIcon color='action' />
            </IconButton>
            <Snackbar
              autoHideDuration={3000}
              open={isDataCopied}
              onClose={() => setIsDataCopied(false)}
              message='Data copied to clipboard!'
            />
          </>
        ) : (
          <></>
        )}
      </DialogContent>
    </>
  );
}

// Helper function
async function getPreSignedUrl(type: string, id: string) {
  const { error, signed_url } = await API.get('files', `/${type}/${id}/presign`, {
    headers: { 'Content-Disposition': 'inline' },
  });

  if (error) {
    throw Error('Unable to fetch get presigned url.');
  }
  return signed_url;
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
  return (
    <div
      style={{
        height: '80vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={() => window.open(presignedUrl, '_blank')}>
      <img
        style={{ maxHeight: '100%', maxWidth: '100%', backgroundColor: 'white' }}
        src={presignedUrl}
      />
    </div>
  );
}

type HTMLViewerProps = { presignedUrl: string };
function HTMLViewer({ presignedUrl }: HTMLViewerProps) {
  return (
    <iframe
      style={{ height: '80vh', width: '100%', backgroundColor: 'white' }}
      src={presignedUrl}
    />
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
  try {
    let JSONParse = JSON.parse(fileContent);
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
            minWidth: '75vw',
          }}
        />
      </Paper>
    );
  } catch (err) {
    return (
      <div>
        <p>ERROR</p>
      </div>
    );
  }
}

type YAMLViewerProps = { fileContent: string };
function YAMLViewer({ fileContent }: YAMLViewerProps) {
  return (
    <div style={{ maxHeight: '80vh', maxWidth: '100%', overflow: 'auto', margin: '1rem' }}>
      <pre
        style={{
          minWidth: '75vw',
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
          minWidth: '75vw',
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
