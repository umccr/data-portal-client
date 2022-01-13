import React, { Component, Fragment } from 'react';
import {
  AppBar,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Slide,
  SlideProps,
  Snackbar,
  TextField,
  Theme,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import igv, { IGVBrowser, ITrack } from 'igv';
import { getJwtToken } from '../utils/signer';
import config from '../config';
import { API } from 'aws-amplify';
import Moment from 'react-moment';
import HumanReadableFileSize from '../components/HumanReadableFileSize';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HelpIcon from '@material-ui/icons/Help';
import { Link as RouterLink, RouteComponentProps } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import genomes from '../utils/genomes';
import URLParse from 'url-parse';

const styles = (theme: Theme) => ({
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  close: {
    padding: theme.spacing(0.5),
  },
  menuButton: {
    marginLeft: theme.spacing(0.5),
  },
  formControl: {
    marginRight: theme.spacing(4),
    minWidth: 120,
  },
});

function TransitionSlideUp(props: SlideProps) {
  return <Slide direction='up' {...props} />;
}

// we can optionally route to this page with a preset subjectId in the url
type MatchParams = {
  subjectId?: string;
};
type Props = RouteComponentProps<MatchParams> & {
  classes: any;
};
type State = {
  // the browser IGV instance, or null if we still have not finished loading it
  browser: IGVBrowser | null;

  // the string identifier of the reference genome being used... also tracks the state of the <select>
  refGenome: string;

  loadTrackDialogOpened: boolean;
  addExtTrackDialogOpened: boolean;
  helpDialogOpened: boolean;
  subject: any;
  subjectId: string | null;
  loadedTrackNames: string[];
  extTrackPath: string;
  errorMessage: string | null;
};

class IGV extends Component<Props, State> {
  state: State = {
    browser: null,
    refGenome: 'hg38',
    loadTrackDialogOpened: false,
    addExtTrackDialogOpened: false,
    helpDialogOpened: false,
    subject: null,
    subjectId: null,
    loadedTrackNames: [],
    extTrackPath: '',
    errorMessage: null,
  };

  async componentDidMount() {
    this.initIgv();
    const { subjectId } = this.props.match.params;
    const searchQuery = encodeURIComponent('final .bam$');
    if (subjectId) {
      const extraParams = {
        queryStringParameters: {
          subject: `${subjectId}`,
        },
      };
      const subject = await API.get('files', `/s3?search=${searchQuery}`, extraParams);
      this.setState({ subject: subject, subjectId: subjectId });
    }
  }

  initIgv = () => {
    this.setState({ browser: null });
    const igvDiv = document.getElementById('igvDiv');
    const options = {
      genomeList: genomes,
      genome: this.state.refGenome,
    };
    igv.createBrowser(igvDiv, options).then((browser: IGVBrowser) => {
      this.setState({ browser: browser });
    });
    igv.setOauthToken(getJwtToken, '*htsget*');
  };

  getBaseName = (key: string) => {
    return key.split('/')[key.split('/').length - 1];
  };

  deriveTrackName(url: URLParse<string>): string {
    return url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
  }

  /**
   * Load a htsget:// URL into IGV as a new track (either reads or variants)
   *
   * @param url the htsget URL
   * @param includeOAuthBearer if true then the track will be configured to use oauth JWT
   */
  loadHtsgetTrackInIvgJs = (url: URLParse<string>, includeOAuthBearer: boolean): void => {
    // some examples that can be used for testing
    // htsget://localhost:3100/variants/local/SBJ00297.vcf.gz
    // htsget://htsget.prod.umccr.org/umccr-primary-data-prod/CMitchell-PeterMacPath/SBJ01204/WGS/2021-12-07/umccrised/SBJ01204__SBJ01204_MDX210384_L2101572/small_variants/SBJ01204__SBJ01204_MDX210384_L2101572-somatic.vcf.gz
    // htsget://htsget.dev.umccr.org/umccr-primary-data-dev/Tothill-Merkel/SBJ00297/WGS/2020-05-07/umccrised/SBJ00297__SBJ00297_PRJ200088_L2000137/small_variants/SBJ00297__SBJ00297_PRJ200088_L2000137-somatic-strelka2-PASS.vcf.gz
    const { loadedTrackNames, browser } = this.state;

    const name = this.deriveTrackName(url);

    if (loadedTrackNames.includes(name)) {
      return;
    }

    // the htsget url scheme is actually unofficial
    // https://github.com/samtools/hts-specs/issues/581
    // IGV itself needs to be passed a Https endpoint from
    // which it itself will run the htsget protocol
    if (url.hostname == 'localhost' || url.hostname == '127.0.0.1') {
      // a quick hack for local debugging... telling it when it looks like localhost htsget chances are we want to
      // use http
      url.set('protocol', 'http:');
    } else {
      url.set('protocol', 'https:');
    }

    const trackConfig: ITrack = {
      sourceType: 'htsget',
      url: url.toString(),
      name: name,
      // these are default viz params if the track is a VCF
      squishedCallHeight: 1,
      expandedCallHeight: 4,
      displayMode: 'squished',
      visibilityWindow: 1000,
      // these are the default viz params if the track is a BAM
      // none for the moment
    };

    if (includeOAuthBearer) {
      // assign the *function* that returns tokens via Promises
      trackConfig.oauthToken = getJwtToken;
    }

    browser?.loadTrack(trackConfig).then(() => {
      loadedTrackNames.push(name);
      this.setState({ loadedTrackNames: loadedTrackNames });
    });
  };

  /**
   * Load an s3:// URL into igv as a track, by converting to a htsget url through known formatting rules
   * consistent with our htsget endpoints.
   *
   * @param data
   */
  loadS3HtsgetTrackInIgvJs = (data: { bucket: string; key: string }): void => {
    const { loadedTrackNames, browser } = this.state;
    const { bucket, key } = data;
    const baseName = this.getBaseName(key);

    if (loadedTrackNames.includes(baseName)) {
      return;
    }

    // we have a umccr specific rule about how our htsget ids are constructed
    const id = bucket + '/' + key;

    if (key.endsWith('bam')) {
      browser
        ?.loadTrack({
          type: 'alignment',
          format: 'bam',
          sourceType: 'htsget',
          url: config.htsget.URL,
          endpoint: config.htsget.ENDPOINT_READS,
          id: id,
          name: baseName,
          removable: false,
        })
        .then(() => {
          loadedTrackNames.push(baseName);
          this.setState({ loadedTrackNames: loadedTrackNames });
        });
    } else if (key.endsWith('vcf') || key.endsWith('vcf.gz')) {
      browser
        ?.loadTrack({
          type: 'variant',
          format: 'vcf',
          sourceType: 'htsget',
          url: config.htsget.URL,
          endpoint: config.htsget.ENDPOINT_VARIANTS,
          id: id,
          name: baseName,
        })
        .then(() => {
          loadedTrackNames.push(baseName);
          this.setState({ loadedTrackNames: loadedTrackNames });
        });
    } else {
      this.setState({ errorMessage: 'Unsupported file type!' });
    }
  };

  handleLoadAllTracks = () => {
    const { results } = this.state.subject;
    results.map((row: any) => this.loadS3HtsgetTrackInIgvJs(row));
  };

  handleClearAllTracks = () => {
    const { loadedTrackNames, browser } = this.state;
    if (browser) {
      loadedTrackNames.map((trackName) => browser.removeTrackByName(trackName));
      this.setState({ loadedTrackNames: [] });
    }
  };

  handlePathInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      extTrackPath: event.target.value,
    });
  };

  handleRefGenomeChange = (event: React.ChangeEvent<{ name?: string | undefined; value: any }>) => {
    event.preventDefault();
    const { browser } = this.state;
    const refGenome = event.target.value;
    this.setState({ refGenome: refGenome });
    browser?.loadGenome({
      genome: refGenome,
    });
  };

  handleAddExtTrackLoading = async (event: any) => {
    event.preventDefault();
    const { extTrackPath } = this.state;

    if (extTrackPath === null) {
      this.handleAddExtTrackDialogClose();
      return;
    }

    const newUrl = new URLParse<string>(extTrackPath);

    if (newUrl.protocol === 's3:') {
      const basePath = extTrackPath.split('s3://')[1];
      const bucket = basePath.split('/')[0];
      const key = basePath.replace(bucket + '/', '');
      const data = {
        bucket: bucket,
        key: key,
      };
      // this just triggers the load in igv - it does not wait for it to complete
      this.loadS3HtsgetTrackInIgvJs(data);
    } else if (newUrl.protocol === 'htsget:') {
      // this just triggers the load in igv - it does not wait for it to complete
      this.loadHtsgetTrackInIvgJs(newUrl, true);
    } else {
      if (extTrackPath && extTrackPath.length !== 0) {
        this.setState({ errorMessage: 'Invalid path ' + extTrackPath });
      }
    }
    this.handleAddExtTrackDialogClose();
  };

  handleAddExtTrackDialogOpen = () => {
    this.setState({ addExtTrackDialogOpened: true });
  };
  handleAddExtTrackDialogClose = () => {
    this.setState({ addExtTrackDialogOpened: false });
  };

  handleLoadTrackDialogOpen = () => {
    this.setState({ loadTrackDialogOpened: true });
  };
  handleLoadTrackDialogClose = () => {
    this.setState({ loadTrackDialogOpened: false });
  };

  handleHelpDialogOpen = () => {
    this.setState({ helpDialogOpened: true });
  };
  handleHelpDialogClose = () => {
    this.setState({ helpDialogOpened: false });
  };

  renderRowItem = (row: any) => {
    const { loadedTrackNames } = this.state;
    return (
      <ListItem key={row.id} button onClick={() => this.loadS3HtsgetTrackInIgvJs(row)}>
        <ListItemText
          primary={
            loadedTrackNames.includes(this.getBaseName(row.key)) ? (
              <Badge color='secondary' variant='dot'>
                <Typography variant={'subtitle2'} color={'textPrimary'}>
                  {row.key}
                </Typography>
              </Badge>
            ) : (
              row.key
            )
          }
          secondary={
            <Fragment>
              <Typography component={'span'} variant={'subtitle2'} color={'textSecondary'}>
                <Moment local>{row.last_modified_date}</Moment>
              </Typography>
              {' -- ' + row.bucket + ' -- '}
              <Typography component={'span'} variant={'subtitle2'} color={'textSecondary'}>
                <HumanReadableFileSize bytes={row.size} />
              </Typography>
            </Fragment>
          }
        />
      </ListItem>
    );
  };

  renderLoadTrackDialog = () => {
    const classes = this.props.classes;
    const { loadTrackDialogOpened, subject, subjectId } = this.state;
    const { results } = subject;

    const wgs = results.filter((r: any) => r.key.includes('WGS/'));
    const wts = results.filter((r: any) => r.key.includes('WTS/'));

    return (
      <Dialog
        open={loadTrackDialogOpened}
        onClose={this.handleLoadTrackDialogClose}
        scroll={'paper'}
        maxWidth={'lg'}
        fullWidth
        TransitionComponent={TransitionSlideUp}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant='h6' className={classes.title}>
              {subjectId} - Select BAM
            </Typography>
            <Button
              className={this.props.classes.menuButton}
              size={'medium'}
              autoFocus
              variant={'outlined'}
              color='inherit'
              onClick={this.handleLoadAllTracks}>
              Load All
            </Button>
            <Button
              disableElevation
              className={this.props.classes.menuButton}
              size={'medium'}
              variant={'outlined'}
              color='inherit'
              onClick={this.handleClearAllTracks}>
              Clear All
            </Button>
            <Button
              className={this.props.classes.menuButton}
              size={'medium'}
              variant={'outlined'}
              color='inherit'
              onClick={this.handleLoadTrackDialogClose}>
              Close
            </Button>
          </Toolbar>
        </AppBar>

        <List>
          <ListSubheader>WGS</ListSubheader>
          {wgs.map((row: any) => this.renderRowItem(row))}
          <ListSubheader>WTS</ListSubheader>
          {wts.map((row: any) => this.renderRowItem(row))}
        </List>
      </Dialog>
    );
  };

  renderAddExtTrackDialog = () => {
    const { addExtTrackDialogOpened } = this.state;
    return (
      <Dialog
        open={addExtTrackDialogOpened}
        onClose={this.handleAddExtTrackDialogClose}
        maxWidth={'md'}
        fullWidth
        aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Add Track</DialogTitle>
        <form onSubmit={this.handleAddExtTrackLoading}>
          <DialogContent>
            <DialogContentText>
              To add a track, please enter S3 or HTSGET path. Typically you get it by{' '}
              <Typography component={'span'} color={'primary'} display={'inline'}>
                Copy S3 Path
              </Typography>{' '}
              button when browsing through{' '}
              <Link component={RouterLink} to={'/'}>
                Subject data
              </Link>
              .
            </DialogContentText>
            <TextField
              type={'text'}
              onChange={this.handlePathInputChange}
              autoFocus
              margin='dense'
              id='path'
              name='path'
              label='Path'
              variant='filled'
              fullWidth
              multiline
              maxRows={8}
            />
          </DialogContent>
          <DialogActions>
            <Button size={'large'} type={'submit'} color='primary' variant={'contained'}>
              Load...
            </Button>
            <Button size={'large'} onClick={this.handleAddExtTrackDialogClose} variant={'outlined'}>
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  renderHelpDialog = () => {
    const { helpDialogOpened } = this.state;
    return (
      <Dialog
        open={helpDialogOpened}
        onClose={this.handleHelpDialogClose}
        maxWidth={'md'}
        fullWidth
        aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Help</DialogTitle>
        <DialogContent>
          <ul>
            <li>Add track by using button denotes with + icon.</li>
            <li>+Load... button is only available if you have selected a particular subject.</li>
            <li>
              +Add button can add any valid S3 (s3://) or HTSGET (htsget://) path as a track
              regardless of subject selected.
            </li>
            <li>
              Select chromosome number or enter locus at IGV toolbar panel. e.g. <em>KRAS</em>
            </li>
            <li>Click zoom in until the track is getting started loading spinning wheel.</li>
            <li>
              Select dropdown box to switch Reference Genome (Refseq Genes) track. Please refer{' '}
              <a
                rel='noreferrer'
                href='https://github.com/igvteam/igv.js/wiki/Reference-Genome'
                target='_blank'>
                wiki entry
              </a>{' '}
              for details and this{' '}
              <a
                rel='noreferrer'
                href='https://s3.amazonaws.com/igv.org.genomes/genomes.json'
                target='_blank'>
                JSON
              </a>{' '}
              contains locations of reference gene data used.
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button
            size={'large'}
            color={'primary'}
            onClick={this.handleHelpDialogClose}
            variant={'outlined'}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  render() {
    const { subject, subjectId, refGenome, browser } = this.state;
    return (
      <Fragment>
        <div>
          <FormControl className={this.props.classes.formControl}>
            <Select value={refGenome} variant='standard' onChange={this.handleRefGenomeChange}>
              <MenuItem value={'hg38'}>hg38</MenuItem>
              <MenuItem value={'hg38_1kg'}>hg38_1kg</MenuItem>
              <MenuItem value={'hg19'}>hg19</MenuItem>
              <MenuItem value={'hg18'}>hg18</MenuItem>
            </Select>
          </FormControl>
          <Button
            component={RouterLink}
            to={subject ? '/subjects/' + subjectId : '/'}
            className={this.props.classes.menuButton}
            variant={'outlined'}
            size={'medium'}
            color={'primary'}
            startIcon={<ExitToAppIcon />}>
            {subject ? subjectId : 'Select Subject'}
          </Button>
          <Button
            className={this.props.classes.menuButton}
            variant={'outlined'}
            size={'medium'}
            color={'primary'}
            startIcon={<AddIcon />}
            disabled={subject === null}
            onClick={this.handleLoadTrackDialogOpen}>
            Load...
          </Button>
          <Button
            disableElevation
            className={this.props.classes.menuButton}
            variant={'contained'}
            size={'medium'}
            color={'primary'}
            startIcon={<AddIcon />}
            onClick={this.handleAddExtTrackDialogOpen}>
            Add
          </Button>
          <Button
            disableElevation
            className={this.props.classes.menuButton}
            variant={'contained'}
            size={'medium'}
            startIcon={<DeleteSweepIcon />}
            onClick={this.handleClearAllTracks}>
            Clear
          </Button>
          <Button
            disableElevation
            className={this.props.classes.menuButton}
            variant={'contained'}
            size={'medium'}
            startIcon={<HelpIcon />}
            onClick={this.handleHelpDialogOpen}>
            Help
          </Button>
        </div>
        {!browser && <LinearProgress color='secondary' />}
        <div id='igvDiv' />
        {subject && this.renderLoadTrackDialog()}
        {this.renderAddExtTrackDialog()}
        {this.renderHelpDialog()}
        {this.renderErrorMessage()}
      </Fragment>
    );
  }

  openSnackbar = () => this.state.errorMessage !== null;

  handleCloseErrorMessage = () => {
    // Clear error message in the state
    this.setState({ errorMessage: null });
  };

  renderErrorMessage = () => {
    const { errorMessage } = this.state;

    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={this.openSnackbar()}
        onClose={this.handleCloseErrorMessage}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span>{errorMessage}</span>}
        action={[
          <IconButton
            key='close'
            aria-label='Close'
            color='inherit'
            className={this.props.classes.close}
            onClick={this.handleCloseErrorMessage}>
            <CloseIcon />
          </IconButton>,
        ]}
      />
    );
  };
}

export default withStyles(styles)(IGV);
