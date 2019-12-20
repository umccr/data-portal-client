import React from 'react';
import * as PropTypes from 'prop-types';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const HIDDEN_COLS = ['key', 'bucket'];

export const isColVisible = (col) => !HIDDEN_COLS.includes(col);

const getDisplayTitle = (col) => {
  return col
    .split('_')
    .join(' ')
    .toUpperCase();
};

class EnhancedTableHead extends React.Component {
  createSortHandler = (property) => (event) => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { order, orderBy, columns } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columns.map(
            (col) =>
              isColVisible(col.key) && (
                <TableCell key={col.key} sortDirection={orderBy === col.key ? order : false}>
                  {col.sortable ? (
                    <Tooltip
                      title='Sort'
                      placement={col.sortable ? 'bottom-end' : 'bottom-start'}
                      enterDelay={300}>
                      <TableSortLabel
                        active={orderBy === col.key}
                        direction={order}
                        onClick={this.createSortHandler(col.key)}>
                        {getDisplayTitle(col.key)}
                      </TableSortLabel>
                    </Tooltip>
                  ) : (
                    getDisplayTitle(col.key)
                  )}
                </TableCell>
              ),
            this
          )}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string,
  columns: PropTypes.array.isRequired,
};

export default EnhancedTableHead;
