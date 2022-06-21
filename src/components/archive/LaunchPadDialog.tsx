// TODO implement v2 version of this component here

import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

class LaunchPadDialog extends React.Component {
  render() {
    const { dialogOpened, rowData, confirmed } = this.props;
    return (
      <Dialog
        open={dialogOpened}
        onClose={this.props.onDialogClose}
        scroll={'paper'}
        maxWidth={'lg'}>
        <DialogTitle>
          {rowData != null
            ? rowData['subject_id']
              ? rowData['subject_id']
              : rowData['sample_id']
            : 'Loading... '}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Table size='small' aria-label='a dense table'>
                <TableBody>
                  {rowData === null && (
                    <TableRow>
                      <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {rowData != null &&
                    Object.keys(rowData)
                      .filter((k) => k !== 'id')
                      .map((k) => (
                        <TableRow key={k}>
                          <TableCell>
                            <Typography
                              style={k === 'error' ? { color: 'red' } : { color: 'default' }}
                              variant='body2'
                              display='block'
                              gutterBottom>
                              {k.toUpperCase()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              style={k === 'error' ? { color: 'red' } : { color: 'default' }}
                              variant='body2'
                              display='block'
                              gutterBottom>
                              {rowData[k]}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={4}>
              {rowData != null && confirmed && (
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  disabled={!confirmed}
                  onClick={this.props.onLaunchPadDialogConfirm}>
                  Confirm
                </Button>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}

LaunchPadDialog.propTypes = {
  dialogOpened: PropTypes.bool,
  rowData: PropTypes.object,
  onDialogClose: PropTypes.func,
  confirmed: PropTypes.bool,
  onLaunchPadDialogConfirm: PropTypes.func,
};

export default LaunchPadDialog;
