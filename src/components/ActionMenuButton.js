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
  };

  handleClose = () => {
    this.setState({
      openBackdrop: false,
      open: false,
      signing: false,
      copied: false,
      url: null,
      expires: null,
    });
  };

  handleOpenInBrowser = async (bucket, key) => {
    this.setState({ openBackdrop: true });
    const url = await this.getPreSignedUrl(bucket, key);
    window.open(url, '_blank');
    this.setState({ openBackdrop: false });
  };

  handleOpenIGVLink = (bucket, key) => {
    const xhr = new XMLHttpRequest();
    const tokens = key.split('/');
    const filename = tokens[tokens.length - 1];
    const file = `s3://${bucket + '/' + key}`;
    const url = `http://localhost:60151/load?file=${encodeURIComponent(file)}&name=${filename}`;
    xhr.open('GET', url);
    xhr.send();
  };

  handleGeneratePreSignedUrl = async (bucket, key) => {
    this.setState({ signing: true, open: true });
    const url = await this.getPreSignedUrl(bucket, key);
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

  getPreSignedUrl = async (bucket, key) => {
    return await API.get('files', `/file-signed-url?bucket=${bucket}&key=${key}`, {});
  };

  getS3Path = (bucket, key) => {
    return 's3://' + bucket + '/' + key;
  };

  renderMenu = (bucket, key, popupState) => {
    return (
      <Menu {...bindMenu(popupState)}>
        {(key.endsWith('bam') || key.endsWith('vcf')) && (
          <MenuItem onClick={popupState.close}>
            <List
              className={this.props.classes.root}
              component={'div'}
              onClick={() => this.handleOpenIGVLink(bucket, key)}>
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
              onClick={() => this.handleGeneratePreSignedUrl(bucket, key)}>
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
              onClick={() => this.handleOpenInBrowser(bucket, key)}>
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
              {this.renderMenu(bucket, key, popupState)}
            </Fragment>
          )}
        </PopupState>
        <Dialog open={open} onClose={this.handleClose} scroll={'paper'} maxWidth={'lg'}>
          <DialogTitle>Download Link</DialogTitle>
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
                            EXPIRES IN
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='button' display='block' gutterBottom>
                            <Moment unix>{this.state.expires}</Moment>
                          </Typography>
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
                <Grid item xs={3}>
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
              </Grid>
            )}
          </DialogContent>
        </Dialog>
        <Backdrop
          className={this.props.classes.backdrop}
          open={openBackdrop}
          onAbort={this.handleClose}>
          <CircularProgress color='inherit' />
        </Backdrop>
      </div>
    );
  }
}

ActionMenuButton.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object,
};

export default withStyles(styles)(ActionMenuButton);
