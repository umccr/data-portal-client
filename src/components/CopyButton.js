import * as React from 'react';
import * as PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Fragment } from 'react';

const CopyButton = ({ url }) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const copyToClipboard = () => {
    const textField = document.createElement('textarea');
    textField.innerText = url;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    handleClick();
  };

  return (
    <div>
      <button onClick={copyToClipboard}>Copy</button>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message='S3 path is copied to the clipboard.'
        action={
          <Fragment>
            <IconButton size='small' aria-label='close' color='inherit' onClick={handleClose}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Fragment>
        }
      />
    </div>
  );
};

CopyButton.propTypes = {
  url: PropTypes.string,
};

export default CopyButton;
