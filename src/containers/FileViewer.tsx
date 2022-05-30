import React, { useState, useEffect, useCallback } from 'react';

// MUI - Components
import {
  Paper,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
  ButtonBase,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  ImageListItemBar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { blueGrey, grey } from '@material-ui/core/colors';

// MUI - Icons
import LaunchIcon from '@material-ui/icons/Launch';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

// Other libraries
import { useParams, Link } from 'react-router-dom';
import { API } from 'aws-amplify';

// Import dialog details
import LimsRowDetailsDialog from '../components/LimsRowDetailsDialog';

type pipelineOptionType = {
  name: string;
  regexKey: string;
};

const GPL_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'GPL - all', regexKey: 'gridss_purple_linx/(.*)(.png|.html)$' },
  { name: 'GPL - purple', regexKey: 'gridss_purple_linx/purple/(.*)(.png|.html)$' },
  { name: 'GPL - linx', regexKey: 'gridss_purple_linx/linx/(.*)(.png|.html)$' },
];
const WTS_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'WTS - all', regexKey: 'WTS/(.*)(.png|.html)$' },
  { name: 'WTS - RNAsum', regexKey: 'WTS/(.*)RNAsum/(.*)(.png|.html)$' },
];
const WGS_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'WGS - all', regexKey: 'WGS/(.*)(.png|.html)$' },
];

const UMCCRISED_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'UMCCRISE - all', regexKey: 'umccrised/(.*)(.png|.html)$' },
];
const DEFAULT_PIPELINE_OPTIONS: pipelineOptionType = {
  name: 'All',
  regexKey: '(.*)(.png|.html)$',
};

const PIPELINE_OPTIONS_LIST: pipelineOptionType[] = [
  DEFAULT_PIPELINE_OPTIONS,
  ...GPL_PIPELINE_OPTIONS,
  ...WTS_PIPELINE_OPTIONS,
  ...WGS_PIPELINE_OPTIONS,
  ...UMCCRISED_PIPELINE_OPTIONS,
];

interface ItemResultProps {
  bucket: string;
  e_tag: string;
  id: number;
  key: string;
  last_modified_date: string;
  size: number;
  unique_hash: string;
  presigned_url: string | undefined;
}

const useStylesFileViewer = makeStyles({
  buttonHover: {
    '&:hover': {
      backgroundColor: grey[100],
    },
  },
});
function FileViewer() {
  const classes = useStylesFileViewer();

  // Parse subjectId from url
  const { subjectId } = useParams<{ subjectId: string }>();

  // REGEX field
  const [pipelineSelection, setpipelineSelection] =
    useState<pipelineOptionType>(DEFAULT_PIPELINE_OPTIONS);
  const handleSelectionChange = (event: React.ChangeEvent<{ value: any }>) => {
    setpipelineSelection(JSON.parse(event.target.value));
  };

  // API Responses
  type apiDataResultType = {
    isLoading: boolean;
    isError: boolean;
    nextPageLink: string | null;
    items: ItemResultProps[];
  };
  const [apiResults, setApiResults] = useState<apiDataResultType>({
    isLoading: true,
    isError: false,
    nextPageLink: null,
    items: [],
  });
  const handleChangeResult = useCallback((props: any) => {
    setApiResults(props);
  }, []);

  const [queryNextUrlString, setQueryNextUrlString] = useState<string | null>(null);
  const [isNextQueryLoading, setIsNextQueryLoading] = useState<boolean>(false);

  const [selectedPreview, setSelectedPreview] = useState<any>(null);
  if (selectedPreview == null && apiResults.items.length !== 0) {
    setSelectedPreview(apiResults.items[0]);
  }

  useEffect(() => {
    let componentUnmount = false;
    const fetchData = async () => {
      setApiResults((prev) => ({
        ...prev,
        isLoading: true,
      }));

      // Build API-config
      let apiConfig = {};
      apiConfig = {
        queryStringParameters: {
          subject: `${subjectId}`,
          search: pipelineSelection.regexKey,
          rowsPerPage: 25,
          ordering: 'key',
        },
      };
      try {
        const apiResponse = await API.get('files', '/s3', apiConfig);
        setApiResults({
          isLoading: false,
          isError: false,
          nextPageLink: apiResponse.links.next,
          items: apiResponse.results,
        });
      } catch {
        if (componentUnmount) return;
        setApiResults((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
        }));
      }

      setSelectedPreview(null);
      setQueryNextUrlString(null);
    };

    fetchData();

    return () => {
      componentUnmount = true;
    };
  }, [pipelineSelection]);

  useEffect(() => {
    let componentUnmount = false;
    const fetchData = async (queryNextUrlString: string) => {
      setIsNextQueryLoading(true);
      try {
        const queryString = queryNextUrlString.split('?').pop();
        const apiResponse = await API.get('files', `/s3?${queryString}`, {});
        if (componentUnmount) return;
        setApiResults((prev) => ({
          nextPageLink: apiResponse.links.next,
          items: [...prev.items, ...apiResponse.results],
          isLoading: false,
          isError: false,
        }));
        setIsNextQueryLoading(false);
      } catch {
        if (componentUnmount) return;
        setApiResults((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
        }));
        setIsNextQueryLoading(false);
      }
    };
    if (queryNextUrlString != null && queryNextUrlString !== '') {
      fetchData(queryNextUrlString);
    }

    return () => {
      componentUnmount = true;
    };
  }, [queryNextUrlString]);

  return (
    <Paper
      elevation={3}
      style={{
        flexDirection: 'column',
        display: 'flex',
        width: '100%',
        minHeight: '600px',
        height: 'calc(100vh - 96px)', // 96px is magic number from toolbar and padding
      }}>
      <Grid
        container
        direction='column'
        justifyContent='flex-start'
        alignItems='stretch'
        wrap='nowrap'
        style={{ padding: '1rem', height: '100%' }}>
        {/* Title - First Row */}
        <Grid item container direction='row' justifyContent='flex-start' alignItems='center'>
          <Grid item>
            <IconButton component={Link} to={`/subjects/${subjectId}`}>
              <ChevronLeft />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant='h6'>
              {subjectId} - Analysis Output: {pipelineSelection.name}
            </Typography>
          </Grid>
        </Grid>

        {/* INPUT - Second Row */}
        <Grid
          item
          style={{ padding: '1rem', width: '100%' }}
          container
          direction='row'
          justifyContent='flex-start'
          alignItems='center'>
          <FormControl style={{ width: '100%' }}>
            <InputLabel id='select-workflow'>Pipeline Report</InputLabel>
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={JSON.stringify(pipelineSelection)}
              onChange={handleSelectionChange}>
              {PIPELINE_OPTIONS_LIST.map((item, index) => {
                return (
                  <MenuItem key={index} value={JSON.stringify(item)}>
                    {item.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* List & Preview */}
        <Grid
          item
          style={{
            width: '100%',
            height: 'calc(100% - 137px)',
            padding: '1rem',
          }}
          container
          direction='row'
          justifyContent='center'
          alignItems='center'>
          {apiResults.isLoading ? (
            <CircularProgress />
          ) : apiResults.isError ? (
            <Grid container direction='column' justifyContent='center' alignItems='center'>
              <WarningIcon />
              <Typography>Something went wrong!</Typography>
            </Grid>
          ) : apiResults.items.length == 0 ? (
            <Grid container direction='column' justifyContent='center' alignItems='center'>
              <WarningIcon />
              <Typography>No Data</Typography>
            </Grid>
          ) : (
            <Grid
              container
              direction='row'
              justifyContent='flex-start'
              alignItems='stretch'
              style={{ height: '100%' }}>
              <Grid item xs={4} style={{ overflow: 'auto', height: '100%', position: 'relative' }}>
                <Grid container direction='column' style={{}}>
                  <Grid
                    item
                    container
                    alignItems='center'
                    style={{
                      padding: '0',
                      minHeight: '48px',
                      backgroundColor: blueGrey[50],
                      position: 'sticky',
                      zIndex: '1',
                      top: 0,
                      borderBottom: 'solid 1px black',
                      paddingLeft: '1rem',
                    }}>
                    <Typography variant='h6' style={{}}>
                      Filename
                    </Typography>
                  </Grid>
                  {apiResults.items.map((item, index) => {
                    let filename = item.key.split('/').pop();
                    const isSelected = selectedPreview && selectedPreview.id === item.id;
                    return (
                      <Grid item key={index} style={{ padding: '0' }}>
                        <ButtonBase
                          className={classes.buttonHover}
                          style={{
                            width: '100%',
                            height: '100%',
                            justifyContent: 'flex-start',
                            backgroundColor: isSelected ? grey[300] : '',
                            padding: '0.5rem',
                          }}
                          onClick={() => setSelectedPreview(item)}>
                          <Typography noWrap variant='body2'>
                            {filename}
                          </Typography>
                        </ButtonBase>
                      </Grid>
                    );
                  })}
                  {apiResults.nextPageLink == null ? (
                    <></>
                  ) : isNextQueryLoading == true ? (
                    <Grid item style={{ padding: '0' }}>
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          justifyContent: 'center',
                          display: 'flex',
                          padding: '0.5rem',
                        }}>
                        <CircularProgress />
                      </div>
                    </Grid>
                  ) : (
                    <Grid item style={{ padding: '0' }}>
                      <ButtonBase
                        style={{
                          width: '100%',
                          height: '100%',
                          justifyContent: 'center',
                          backgroundColor: grey[100],
                          padding: '0.5rem',
                        }}
                        onClick={() => setQueryNextUrlString(apiResults.nextPageLink)}>
                        Load More
                      </ButtonBase>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={8}
                style={{
                  borderLeft: `1pt solid ${grey[300]}`,
                  height: '100%',
                  position: 'relative',
                  backgroundColor: `${grey[500]}`,
                }}
                direction='column'
                justifyContent='center'
                alignItems='center'>
                {selectedPreview == null ? (
                  <CircularProgress />
                ) : (
                  <FetchAndShowFile
                    selectedPreview={selectedPreview}
                    handleChangeResult={handleChangeResult}
                  />
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

interface FetchAndShowFileProps {
  selectedPreview: ItemResultProps;
  handleChangeResult: Function;
}

function FetchAndShowFile(props: FetchAndShowFileProps) {
  const { selectedPreview, handleChangeResult } = props;

  // Dialog to see more details
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // IsError Component
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let componentUnmount = false;

    const fetchPresignedUrl = async () => {
      const id = selectedPreview.id;
      try {
        const presigned_url = await getPreSignedUrl(id);

        if (componentUnmount) return;
        handleChangeResult((prev: any) => {
          const newState = { ...prev };

          for (const item of newState.items) {
            if (item.id === selectedPreview.id) {
              item['presigned_url'] = presigned_url;
            }
          }
          return newState;
        });
      } catch (e) {
        if (componentUnmount) return;
        setIsError(true);
        return;
      }
    };
    if (!selectedPreview.presigned_url) {
      fetchPresignedUrl();
    }
    return () => {
      componentUnmount = true;
    };
  }, [selectedPreview]);

  return (
    <>
      {isError ? (
        <WarningIcon />
      ) : !selectedPreview.presigned_url ? (
        <CircularProgress />
      ) : (
        <Grid item style={{ maxHeight: '100%', position: 'unset', padding: '1rem' }}>
          <div style={{ height: '48px' }}>
            <LimsRowDetailsDialog
              dialogOpened={isDialogOpen}
              rowData={selectedPreview}
              onDialogClose={() => setIsDialogOpen(false)}
            />
            <ImageListItemBar
              position='top'
              title={selectedPreview.key}
              actionIcon={
                <IconButton onClick={() => setIsDialogOpen(true)}>
                  <InfoIcon />
                </IconButton>
              }
            />
          </div>
          {/* Limit 60MB filesize */}
          {selectedPreview.size > 60000000 ? (
            <div
              style={{
                flexDirection: 'column',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => window.open(selectedPreview.presigned_url, '_blank')}>
              <VisibilityOffIcon color='disabled' />
              <Typography>
                FileSize exceed 60MB. Click here to open in a new tab.{' '}
                <LaunchIcon fontSize='small' />
              </Typography>
            </div>
          ) : // Show in PNG or HTML
          selectedPreview.key.endsWith('.html') ? (
            <iframe
              src={selectedPreview.presigned_url}
              style={{
                height: 'calc(100% - 48px)',
                maxWidth: '100%',
                backgroundColor: 'white',
                padding: '1px',
                position: 'absolute',
                top: '48px',
                left: 0,
                width: '100%',
              }}
            />
          ) : (
            <img
              style={{
                maxHeight: 'calc(100% - 48px)',
                maxWidth: '100%',
                backgroundColor: 'white',
                padding: '1px',
              }}
              onClick={() => window.open(selectedPreview.presigned_url, '_blank')}
              src={selectedPreview.presigned_url}
            />
          )}
        </Grid>
      )}
    </>
  );
}

async function getPreSignedUrl(id: number) {
  const { error, signed_url } = await API.get('files', `/s3/${id}/presign`, {});

  if (error) {
    throw Error('Unable to fetch get presigned url.');
  }
  return signed_url;
}

export default FileViewer;
