import React, { useState, useEffect } from 'react';

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
import { grey } from '@material-ui/core/colors';

// MUI - Icons
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';

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
  { name: 'GPL - all', regexKey: 'gridss_purple_linx/(.*)(.png$)' },
  { name: 'GPL - purple', regexKey: 'gridss_purple_linx/purple/(.*)(.png$)' },
  { name: 'GPL - linx', regexKey: 'gridss_purple_linx/linx/(.*)(.png$)' },
];

const UMCCRISED_PIPELINE_OPTIONS: pipelineOptionType[] = [
  { name: 'UMCCRISED - all', regexKey: 'umccrised/(.*)(.png$)' },
];
const DEFAULT_PIPELINE_OPTIONS: pipelineOptionType = { name: 'All', regexKey: '(.*)(.png$)' };

const PIPELINE_OPTIONS_LIST: pipelineOptionType[] = [
  DEFAULT_PIPELINE_OPTIONS,
  ...GPL_PIPELINE_OPTIONS,
  ...UMCCRISED_PIPELINE_OPTIONS,
];

function FileViewers() {
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
    items: any[];
  };
  const [apiResults, setApiResults] = useState<apiDataResultType>({
    isLoading: true,
    isError: false,
    nextPageLink: null,
    items: [],
  });
  const [queryNextUrlString, setQueryNextUrlString] = useState<string | null>(null);

  const [selectedPreview, setSelectedPreview] = useState<any>(null);
  if (selectedPreview == null && apiResults.items.length !== 0) {
    setSelectedPreview(apiResults.items[0]);
  }

  // Dialog to see more details
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          rowsPerPage: 10,
          ordering: 'key',
        },
      };
      try {
        const apiResponse = await API.get('files', '/s3', apiConfig);
        await getPresignedUrlForEveryItem(apiResponse);
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
      setApiResults((prev) => ({
        ...prev,
        isLoading: true,
      }));
      try {
        const queryString = queryNextUrlString.split('?').pop();
        const apiResponse = await API.get('files', `/s3?${queryString}`, {});
        await getPresignedUrlForEveryItem(apiResponse);
        if (componentUnmount) return;
        setApiResults((prev) => ({
          nextPageLink: apiResponse.links.next,
          items: [...prev.items, ...apiResponse.results],
          isLoading: false,
          isError: false,
        }));
      } catch {
        if (componentUnmount) return;
        setApiResults((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
        }));
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
              {subjectId} - Image Analysis Output: {pipelineSelection.name}
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
              <Grid item xs={4} style={{ overflow: 'auto', height: '100%' }}>
                <Grid container direction='column'>
                  {apiResults.items.map((item, index) => {
                    let filename = item.key.split('/').pop();
                    const isSelected = selectedPreview && selectedPreview.id === item.id;
                    return (
                      <Grid item key={index} style={{ padding: '0' }}>
                        <ButtonBase
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
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

async function getPresignedUrlForEveryItem(apiResponse: any) {
  for (const item of apiResponse.results) {
    const id = item.id;
    const presigned_url = await getPreSignedUrl(id);
    item['presigned_url'] = presigned_url;
  }
}

async function getPreSignedUrl(id: string) {
  const { error, signed_url } = await API.get('files', `/s3/${id}/presign`, {});

  if (error) {
    throw Error('Unable to fetch get presigned url.');
  }
  return signed_url;
}

export default FileViewers;
