import * as React from 'react';
import * as PropTypes from 'prop-types';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { Fragment } from 'react';
import { API } from 'aws-amplify';
import { Button, withStyles } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import List from '@material-ui/core/List';
import LinkIcon from '@material-ui/icons/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import Moment from 'react-moment';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme) => ({
  close: {
    padding: theme.spacing(0.5),
  },
  root: {
    display: 'flex',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
});

class ActionMenuButton extends React.Component {
  state = {
    openBackdrop: false,
    open: false,
    signing: false,
    copied: false,
    url: null,
    expires: null,
    errorMessage: null,
    dialogMessage: null,
    archived: false,
    restore: false,
    restoredMessage: null,
  };

  handleClose = () => {
    this.setState({
      openBackdrop: false,
      open: false,
      signing: false,
      copied: false,
      url: null,
      expires: null,
      errorMessage: null,
      dialogMessage: null,
      archived: false,
      restore: false,
      restoredMessage: null,
    });
  };

  handleOpenInBrowser = async (id) => {
    this.setState({ openBackdrop: true });
    const url = await this.getPreSignedUrl(id);
    window.open(url, '_blank');
    this.setState({ openBackdrop: false });
  };

  handleOpenIGVLink = (id, bucket, key) => {
    if (this.state.archived) return;
    const xhr = new XMLHttpRequest();
    const tokens = key.split('/');
    const filename = tokens[tokens.length - 1];
    const file = `s3://${bucket + '/' + key}`;
    const url = `http://localhost:60151/load?file=${encodeURIComponent(file)}&name=${filename}`;
    xhr.open('GET', url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 0) {
        const dialogMessage =
          'Cannot open automatically in IGV. Please make sure you have opened IGV app and try again. ' +
          'Otherwise please click "Copy" button and open the URL in browser new tab.';
        this.setState({ dialogMessage: dialogMessage });
        this.setState({ open: true, url: url });
      }
    };
    xhr.send();
  };

  handleGeneratePreSignedUrl = async (id) => {
    this.setState({ signing: true, open: true });
    const url = await this.getPreSignedUrl(id);
    const params = this.parseUrlParams(url);
    const expires = params['Expires'];
    this.setState({ expires });
    this.setState({ url });
    this.setState({ signing: false });
  };

  parseUrlParams = (url) => {
    return new URL(url).searchParams
      .toString()
      .split('&')
      .reduce((previous, current) => {
        const [key, value] = current.split('=');
        previous[key] = value;
        return previous;
      }, {});
  };

  checkS3ObjectStatus = async (id, callback) => {
    this.setState({ openBackdrop: true });
    const data = await API.get('files', `/s3/${id}/status`, {});
    const { bucket, key, head_object } = data;
    if (head_object) {
      // NOTE: head_object contains S3 API response as described follows
      // https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Client.head_object

      // head request has raised some error
      const { error } = head_object;
      if (error) {
        this.setState({ errorMessage: error });
      }

      // check if we have archive header
      const archived = head_object['StorageClass'] === 'DEEP_ARCHIVE';
      if (archived) {
        // check if we have Restore header
        const restore_header = head_object['Restore'];
        if (restore_header) {
          if (!restore_header.includes('expiry-date')) {
            // restore in progress
            const dialogMessage =
              'The requested file is restoring in progress from archival storage (Glacier Deep Archive). ' +
              'Please try again later. Retrieval may take up to 48 hours.';
            this.setState({ dialogMessage: dialogMessage, archived: archived });
            this.setState({ open: true, url: this.getS3Path(bucket, key) });
          }
        } else {
          const dialogMessage =
            'The requested file is in archival storage (Glacier Deep Archive). ' +
            'Please request to restore the file before accessing. Retrieval may take up to 48 hours.';
          this.setState({ dialogMessage: dialogMessage, archived: archived, restore: true });
          this.setState({ open: true, url: this.getS3Path(bucket, key) });
        }
      }
    }
    this.setState({ openBackdrop: false });
    callback(id, bucket, key);
  };

  handleRestoreClicked = async (id) => {
    this.setState({ restore: false }); // eagerly disable restore button

    // TODO allow specify days parameter?
    const data = await API.get('files', `/s3/${id}/restore?days=90`, {});
    const { error } = data;

    if (error) {
      this.setState({ errorMessage: error });
    } else {
      const restoredMessage = 'Successfully submitted restore request!';
      this.setState({ restoredMessage: restoredMessage });
    }
  };

  getPreSignedUrl = async (id) => {
    const { error, signed_url } = await API.get('files', `/s3/${id}/presign`, {});
    if (error) {
      return error;
    }
    return signed_url;
  };

  getS3Path = (bucket, key) => {
    return 's3://' + bucket + '/' + key;
  };

  renderMenu = (id, bucket, key, popupState) => {
    return (
      <Menu {...bindMenu(popupState)}>
        {(key.endsWith('bam') || key.endsWith('vcf') || key.endsWith('vcf.gz')) && (
          <MenuItem onClick={popupState.close}>
            <List
              className={this.props.classes.root}
              component={'div'}
              onClick={() => this.checkS3ObjectStatus(id, this.handleOpenIGVLink)}>
              <ListItemIcon>
                <img src={'/igv.png'} alt='igv.png' width='24px' height='24px' />
              </ListItemIcon>
              <ListItemText>Open in IGV</ListItemText>
            </List>
          </MenuItem>
        )}

        <MenuItem onClick={popupState.close}>
          <CopyToClipboard text={this.getS3Path(bucket, key)}>
            <List className={this.props.classes.root} component={'div'} onClick={this.onClick}>
              <ListItemIcon>
                <FileCopyIcon />
              </ListItemIcon>
              <ListItemText>Copy S3 Path</ListItemText>
            </List>
          </CopyToClipboard>
        </MenuItem>

        {!key.endsWith('bam') && (
          <MenuItem onClick={popupState.close}>
            <List
              className={this.props.classes.root}
              component={'div'}
              onClick={() => this.handleGeneratePreSignedUrl(id)}>
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <ListItemText>Generate Download Link</ListItemText>
            </List>
          </MenuItem>
        )}

        {!key.endsWith('bam') && (key.endsWith('html') || key.endsWith('png')) && (
          <MenuItem onClick={popupState.close}>
            <List
              className={this.props.classes.root}
              component={'div'}
              onClick={() => this.handleOpenInBrowser(id)}>
              <ListItemIcon>
                <OpenInBrowserIcon />
              </ListItemIcon>
              <ListItemText>Open in Browser</ListItemText>
            </List>
          </MenuItem>
        )}
      </Menu>
    );
  };

  render() {
    const { data } = this.props;
    const { id, bucket, key } = data;
    const { open, openBackdrop } = this.state;
    return (
      <div>
        <PopupState variant='popover' popupId={id.toString()}>
          {(popupState) => (
            <Fragment>
              <Button {...bindTrigger(popupState)} color='primary'>
                <MenuIcon />
              </Button>
              {this.renderMenu(id, bucket, key, popupState)}
            </Fragment>
          )}
        </PopupState>
        <Dialog open={open} onClose={this.handleClose} scroll={'paper'} maxWidth={'lg'}>
          <DialogTitle>{this.state.expires ? 'Download Link' : 'Message'}</DialogTitle>
          <DialogContent>
            {this.state.signing && (
              <div align={'center'}>
                <Typography variant='button' display='block' gutterBottom noWrap>
                  Generating, Please wait...
                </Typography>
                <CircularProgress />
              </div>
            )}
            {this.state.url && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Table size={'small'} aria-label={'a dense table'}>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Typography variant='button' display='block' gutterBottom noWrap>
                            {this.state.expires ? 'EXPIRES IN' : 'Info'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {this.state.expires ? (
                            <Typography variant='button' display='block' gutterBottom>
                              <Moment unix>{this.state.expires}</Moment>
                            </Typography>
                          ) : (
                            this.state.dialogMessage
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant='button' display='block' gutterBottom>
                            URL
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' gutterBottom>
                            {this.state.url}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={3}>
                  <CopyToClipboard
                    text={this.state.url}
                    onCopy={() => this.setState({ copied: true })}>
                    <Button fullWidth variant='contained' color='primary' onClick={this.onClick}>
                      Copy
                    </Button>
                  </CopyToClipboard>
                  {this.state.copied ? (
                    <Typography
                      style={{ color: 'red' }}
                      variant='body2'
                      display='block'
                      gutterBottom>
                      URL is copied into the clipboard!
                    </Typography>
                  ) : null}
                </Grid>
                {/*<Grid item xs={3}>*/}
                {/*  <Button*/}
                {/*    fullWidth*/}
                {/*    variant='contained'*/}
                {/*    color='secondary'*/}
                {/*    disabled={!this.state.restore}*/}
                {/*    onClick={() => this.handleRestoreClicked(id)}>*/}
                {/*    Restore*/}
                {/*  </Button>*/}
                {/*  {this.state.restoredMessage != null ? (*/}
                {/*    <Typography*/}
                {/*      style={{ color: 'red' }}*/}
                {/*      variant='body2'*/}
                {/*      display='block'*/}
                {/*      gutterBottom>*/}
                {/*      {this.state.restoredMessage}*/}
                {/*    </Typography>*/}
                {/*  ) : null}*/}
                {/*</Grid>*/}
              </Grid>
            )}
          </DialogContent>
        </Dialog>
        <Backdrop
          className={this.props.classes.backdrop}
          open={openBackdrop}
          onAbort={this.handleClose}
          timeout={500}>
          <CircularProgress color='inherit' />
        </Backdrop>
        {this.renderErrorMessage()}
      </div>
    );
  }

  handleCloseErrorMessage = () => {
    // Clear error message in the state
    this.setState({ errorMessage: null });
  };

  // Show snackbar if we have an error message and it has not been hidden
  openSnackbar = () => this.state.errorMessage !== null;

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

ActionMenuButton.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object,
};

export default withStyles(styles)(ActionMenuButton);
