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
  Snackbar,
  TextField,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import igv from 'igv';
import { oauth as igvOAuth } from 'igv-utils';
import { getJwtToken } from '../utils/signer';
import config from '../config';
import * as PropTypes from 'prop-types';
import { API } from 'aws-amplify';
import Moment from 'react-moment';
import HumanReadableFileSize from '../components/HumanReadableFileSize';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HelpIcon from '@material-ui/icons/Help';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import genomes from '../utils/genomes';

const styles = (theme) => ({
  appBar: {
    position: 'relative',
  },
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

class IGV extends Component {
  state = {
    refGenome: 0,
    loadTrackDialogOpened: false,
    addExtTrackDialogOpened: false,
    helpDialogOpened: false,
    subject: null,
    subjectId: null,
    loadedTracks: [],
    extTrackPath: '',
    errorMessage: null,
    showLoading: false,
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
    this.setState({ showLoading: true });
    const igvDiv = document.getElementById('igvDiv');
    const options = {
      reference: genomes[this.state.refGenome],
    };
    igv.createBrowser(igvDiv, options).then((browser) => {
      igv.browser = browser;
      this.setState({ showLoading: false });
    });
    // See https://github.com/igvteam/igv.js/issues/1344
    // igv.oauth.setToken(getJwtToken, '*htsget*');
    igvOAuth.setToken(getJwtToken, '*htsget*');
  };

  getBaseName = (key) => {
    return key.split('/')[key.split('/').length - 1];
  };

  loadTrackInIgvJs = async (data) => {
    const { loadedTracks } = this.state;
    const { bucket, key } = data;
    const baseName = this.getBaseName(key);
    const id = bucket + '/' + key;

    if (loadedTracks.includes(baseName)) {
      return;
    }

    if (key.endsWith('bam')) {
      igv.browser
        .loadTrack({
          type: 'alignment',
          format: 'bam',
          sourceType: 'htsget',
          url: config.htsget.URL,
          endpoint: config.htsget.ENDPOINT_READS,
          id: id,
          name: baseName,
          removable: false,
        })
        .then((bamTrack) => {
          loadedTracks.push(bamTrack.name); // BAMTrack
          this.setState({ loadedTracks: loadedTracks });
        });
    } else if (key.endsWith('vcf') || key.endsWith('vcf.gz')) {
      // TODO
      //  Is the variants endpoint of htsget protocol supported? NOooOo...
      //  https://github.com/igvteam/igv.js/issues/1187

      // igv.browser.loadTrack({
      //   type: 'variant',
      //   format: 'vcf',
      //   sourceType: 'htsget',
      //   url: config.htsget.URL,
      //   endpoint: config.htsget.ENDPOINT_VARIANTS,
      //   id: id,
      //   name: baseName,
      // });

      this.setState({ errorMessage: 'Variant call track is not supported yet!' });
    } else {
      this.setState({ errorMessage: 'Unsupported file type!' });
    }
  };

  handleLoadAllTracks = () => {
    const { results } = this.state.subject;
    results.map((row) => this.loadTrackInIgvJs(row));
  };

  handleClearAllTracks = () => {
    const { loadedTracks } = this.state;
    loadedTracks.map((trackName) => igv.browser.removeTrackByName(trackName));
    this.setState({ loadedTracks: [] });
  };

  handlePathInputChange = (event) => {
    this.setState({
      extTrackPath: event.target.value,
    });
  };

  handleRefGenomeChange = (event) => {
    event.preventDefault();
    const refGenome = event.target.value;
    this.setState({ refGenome: refGenome });
    igv.browser.loadGenome(genomes[refGenome]);
  };

  handleAddExtTrackLoading = async (event) => {
    event.preventDefault();
    const { extTrackPath } = this.state;

    if (extTrackPath === null) {
      this.handleAddExtTrackDialogClose();
      return;
    }

    if (extTrackPath.startsWith('s3://')) {
      const basePath = extTrackPath.split('s3://')[1];
      const bucket = basePath.split('/')[0];
      const key = basePath.replace(bucket + '/', '');
      const data = {
        bucket: bucket,
        key: key,
      };
      await this.loadTrackInIgvJs(data);
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

  renderRowItem = (row) => {
    const { loadedTracks } = this.state;
    return (
      <ListItem key={row.id} button onClick={() => this.loadTrackInIgvJs(row)}>
        <ListItemText
          primary={
            loadedTracks.includes(this.getBaseName(row.key)) ? (
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

    const wgs = results.filter((r) => r.key.includes('WGS/'));
    const wts = results.filter((r) => r.key.includes('WTS/'));

    return (
      <Dialog
        open={loadTrackDialogOpened}
        onClose={this.handleLoadTrackDialogClose}
        scroll={'paper'}
        maxWidth={'lg'}
        fullWidth
        TransitionComponent={Transition}>
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
          {wgs.map((row) => this.renderRowItem(row))}
          <ListSubheader>WTS</ListSubheader>
          {wts.map((row) => this.renderRowItem(row))}
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
              To add a track, please enter S3 path. Typically you get it by{' '}
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
              rowsMax={8}
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
              +Add button can add any valid S3 path as a track regardless of subject selected.
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
    const { subject, subjectId, refGenome, showLoading } = this.state;
    return (
      <Fragment>
        <div>
          <FormControl className={this.props.classes.formControl}>
            <Select value={refGenome} variant='standard' onChange={this.handleRefGenomeChange}>
              <MenuItem value={0}>hg38</MenuItem>
              <MenuItem value={1}>hg38_1kg</MenuItem>
              <MenuItem value={2}>hg19</MenuItem>
              <MenuItem value={3}>hg18</MenuItem>
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
        {showLoading && <LinearProgress color='secondary' />}
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

IGV.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object,
};

export default withStyles(styles)(IGV);
