import React from 'react';
import * as PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import CircularProgress from '@material-ui/core/CircularProgress';

class LimsRowDetailsDialog extends React.Component {
  render() {
    const { dialogOpened, rowData } = this.props;
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
                  .filter(function (k) {
                    return k !== 'id';
                  })
                  .map((k) => (
                    <TableRow key={k}>
                      <TableCell>{k.toUpperCase()}</TableCell>
                      <TableCell>{rowData[k]}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    );
  }
}

LimsRowDetailsDialog.propTypes = {
  dialogOpened: PropTypes.bool,
  rowData: PropTypes.object,
  onDialogClose: PropTypes.func,
};

export default LimsRowDetailsDialog;
