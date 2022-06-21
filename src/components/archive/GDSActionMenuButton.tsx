// TODO implement v2 version of this component here

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

class GDSActionMenuButton extends React.Component {
  state = {
    openBackdrop: false,
    open: false,
    signing: false,
    copied: false,
    url: null,
    expires: null,
    errorMessage: null,
    dialogMessage: null,
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
    });
  };

  handleOpenInBrowser = async (id) => {
    this.setState({ openBackdrop: true });
    const { error, signed_url } = await this.getPreSignedUrl(id);
    if (error) {
      this.setState({ errorMessage: error });
    } else {
      window.open(signed_url, '_blank');
    }
    this.setState({ openBackdrop: false });
  };

  handleOpenIGVLink = (index, file, name) => {
    const xhr = new XMLHttpRequest();
    const idx = encodeURIComponent(index);
    const enf = encodeURIComponent(file);
    const url = `http://localhost:60151/load?index=${idx}&file=${enf}&name=${name}`;
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

  handleGDSFileIGVOpening = async (volume_name, path, name, callback) => {
    this.setState({ openBackdrop: true });
    const gdsFile = this.getGDSPath(volume_name, path);
    let gdsFileIdx = gdsFile + '.bai';
    if (gdsFile.endsWith('vcf') || gdsFile.endsWith('vcf.gz')) {
      gdsFileIdx = gdsFile + '.tbi';
    }
    try {
      const { signed_urls } = await API.post('files', `/presign`, {
        body: [gdsFile, gdsFileIdx],
      });
      let file;
      let index;
      for (let signed_url of signed_urls) {
        const { volume, path, presigned_url } = signed_url;
        const gdsPath = this.getGDSPath(volume, path);
        if (gdsPath === gdsFile) {
          file = presigned_url;
        } else if (gdsPath === gdsFileIdx) {
          index = presigned_url;
        }
      }
      callback(index, file, name);
    } catch (e) {
      const { error } = e.response.data;
      this.setState({ errorMessage: error });
    } finally {
      this.setState({ openBackdrop: false });
    }
  };

  handleGeneratePreSignedUrl = async (id) => {
    this.setState({ signing: true, open: true });
    const { error, signed_url } = await this.getPreSignedUrl(id);
    if (error) {
      this.setState({ url: error });
      this.setState({ dialogMessage: 'ERROR' });
    } else {
      const url = signed_url;
      const params = this.parseUrlParams(url);
      const expires = params['X-Amz-Expires'];
      this.setState({ expires });
      this.setState({ url });
    }
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

  getPreSignedUrl = async (id) => {
    return await API.get('files', `/gds/${id}/presign`, {});
  };

  getGDSPath = (volume_name, path) => {
    return 'gds://' + volume_name + path;
  };

  renderMenu = (id, volume_name, path, name, popupState) => {
    return (
      <Menu {...bindMenu(popupState)}>
        {(path.endsWith('bam') || path.endsWith('vcf') || path.endsWith('vcf.gz')) && (
          <MenuItem onClick={popupState.close}>
            <List
              className={this.props.classes.root}
              component={'div'}
              onClick={() =>
                this.handleGDSFileIGVOpening(volume_name, path, name, this.handleOpenIGVLink)
              }>
              <ListItemIcon>
                <img src={'/igv.png'} alt='igv.png' width='24px' height='24px' />
              </ListItemIcon>
              <ListItemText>Open in IGV</ListItemText>
            </List>
          </MenuItem>
        )}

        <MenuItem onClick={popupState.close}>
          <CopyToClipboard text={this.getGDSPath(volume_name, path)}>
            <List className={this.props.classes.root} component={'div'} onClick={this.onClick}>
              <ListItemIcon>
                <FileCopyIcon />
              </ListItemIcon>
              <ListItemText>Copy GDS Path</ListItemText>
            </List>
          </CopyToClipboard>
        </MenuItem>

        {!path.endsWith('bam') && (
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

        {!path.endsWith('bam') && (path.endsWith('html') || path.endsWith('png')) && (
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
    const { data, dense } = this.props;
    const { id, volume_name, path, name } = data;
    const { open, openBackdrop } = this.state;
    const dateExpires = new Date();

    return (
      <div>
        <PopupState variant='popover' popupId={id.toString()}>
          {(popupState) => (
            <Fragment>
              <IconButton
                {...bindTrigger(popupState)}
                color='primary'
                size={dense ? 'small' : 'medium'}>
                <MenuIcon fontSize={dense ? 'small' : 'medium'} />
              </IconButton>
              {this.renderMenu(id, volume_name, path, name, popupState)}
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
                              <Moment add={{ seconds: this.state.expires }}>{dateExpires}</Moment>
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
                </Grid>
                {this.state.copied ? (
                  <Typography style={{ color: 'red' }} variant='body2' display='block' gutterBottom>
                    URL is copied into the clipboard!
                  </Typography>
                ) : null}
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

GDSActionMenuButton.propTypes = {
  classes: PropTypes.object,
  dense: PropTypes.bool,
  data: PropTypes.object.isRequired,
  authUserInfo: PropTypes.object.isRequired,
};

export default withStyles(styles)(GDSActionMenuButton);
