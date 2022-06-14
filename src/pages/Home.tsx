// TODO implement v2 version of this page view here

import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableFooter from '@material-ui/core/TableFooter';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import { TablePaginationActionsWrapped } from '../components/TablePagniationActionsWrapped';
import CircularProgress from '@material-ui/core/CircularProgress';
import { clearErrorMessage, startRunningHomeQuery, updateHomeQueryPrams } from '../actions/home';
import * as PropTypes from 'prop-types';
import { API } from 'aws-amplify';
import EnhancedTableHead from '../components/EnhancedTableHead';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import LimsRowDetailsDialog from '../components/LimsRowDetailsDialog';
import { Link as RouterLink } from 'react-router-dom';
import InfoIcon from '@material-ui/icons/Info';
import Link from '@material-ui/core/Link';
import ImageSearchIcon from '@material-ui/icons/ImageSearch';

const styles = (theme) => ({
  close: {
    padding: theme.spacing(0.5),
  },
});

class Home extends Component {
  state = {
    dialogOpened: false,
    rowData: null,
  };

  async componentDidMount() {
    const { handleStartRunningHomeQuery } = this.props;
    await handleStartRunningHomeQuery(this.getBaseParams());
  }

  reloadData = async (params = {}) => {
    const { handleStartRunningHomeQuery } = this.props;
    await handleStartRunningHomeQuery(params);
  };

  getBaseParams = () => {
    return this.props.homeParams;
  };

  handlePageChange = async (event, page) => {
    await this.reloadData({
      ...this.getBaseParams(),
      page: page + 1, // React pagination start at 0 whereas API start at 1
    });
  };

  handleRowsPerPageChange = async (event) => {
    await this.reloadData({
      ...this.getBaseParams(),
      page: 1, // Reset page number if rows per page change
      rowsPerPage: event.target.value,
    });
  };

  handleRequestSort = async (event, property) => {
    const sortCol = property;
    const { homeParams } = this.props;
    let sortAsc = homeParams.sortCol === sortCol && !homeParams.sortAsc;

    // Reset all other search params except query
    await this.reloadData({
      ...this.getBaseParams(),
      page: 1, // Reset page number if sorting change
      sortAsc,
      sortCol,
    });
  };

  handleHomeQueryChange = async (searchQuery) => {
    await this.props.handleHomeQueryParamsUpdate({
      search: searchQuery,
      page: 1,
    });
  };

  handleSearchClicked = async () => {
    const { handleStartRunningHomeQuery, homeParams } = this.props;
    handleStartRunningHomeQuery(homeParams);
  };

  handleRowClick = (id) => {
    return () => {
      this.handleDialogOpen(id);
    };
  };

  handleDialogOpen = (id) => {
    const dialogOpened = true;
    this.setState({ dialogOpened }, () => this.processRowDetails(id));
  };

  handleDialogClose = () => {
    const dialogOpened = false;
    const rowData = null;
    this.setState({ dialogOpened, rowData });
  };

  processRowDetails = async (id) => {
    const rowData = await API.get('files', `/lims/${id}/`, {});
    this.setState({ rowData });
  };

  renderHomeView = () => {
    const { sortAsc, sortCol, search } = this.props.homeParams;
    const { loading, data } = this.props.homeResult;
    const { results, pagination } = data;
    const { dialogOpened, rowData } = this.state;
    const columns = [
      { key: 'info', sortable: false },
      { key: 'file_viewer', sortable: false },
      { key: 'illumina_id', sortable: true },
      { key: 'type', sortable: true },
      { key: 'timestamp', sortable: true },
      { key: 'subject_id', sortable: true },
      { key: 'sample_id', sortable: true },
      { key: 'library_id', sortable: true },
      { key: 'external_subject_id', sortable: true },
      { key: 'external_sample_id', sortable: true },
      { key: 'phenotype', sortable: true },
      { key: 'project_name', sortable: true },
      // { key: 'results', sortable: true },
    ];

    return (
      <Paper>
        <Toolbar>
          <Box width={1 / 4}>
            <TextField
              fullWidth
              label={'Search Filter'}
              type={'search'}
              value={search}
              onChange={(e) => this.handleHomeQueryChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && this.handleSearchClicked()}
              InputProps={{
                endAdornment: (
                  <InputAdornment color={'primary'} position={'end'}>
                    <IconButton color='primary' onClick={this.handleSearchClicked}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Toolbar>

        <Table size='small' aria-label='a dense table'>
          <EnhancedTableHead
            onRequestSort={this.handleRequestSort}
            order={sortAsc ? 'asc' : 'desc'}
            orderBy={sortCol === null ? '' : sortCol}
            columns={columns}
          />
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              results != null &&
              results.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) =>
                    col.key === 'info' ? (
                      <TableCell key={col.key}>
                        <Button aria-label='info' onClick={this.handleRowClick(row.id)}>
                          <InfoIcon color={'primary'} />
                        </Button>
                      </TableCell>
                    ) : col.key === 'illumina_id' ? (
                      <TableCell key={col.key}>
                        <Link color='primary' component={RouterLink} to={'/runs/' + row[col.key]}>
                          {row[col.key]}
                        </Link>
                      </TableCell>
                    ) : col.key === 'subject_id' ? (
                      <TableCell key={col.key}>
                        {row[col.key] && (
                          <Link
                            color='primary'
                            component={RouterLink}
                            to={'/subjects/' + row[col.key]}>
                            {row[col.key]}
                          </Link>
                        )}
                      </TableCell>
                    ) : col.key === 'file_viewer' ? (
                      <TableCell key={col.key}>
                        <IconButton
                          disabled={row.subject_id ? false : true}
                          component={RouterLink}
                          aria-label='file_viewer'
                          to={`/files/${row.subject_id}`}>
                          <ImageSearchIcon color={row.subject_id ? 'action' : 'disabled'} />
                        </IconButton>
                      </TableCell>
                    ) : (
                      <TableCell key={col.key}>{row[col.key]}</TableCell>
                    )
                  )}
                </TableRow>
              ))}
          </TableBody>
          {pagination != null && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={7}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  count={pagination.count}
                  rowsPerPage={pagination.rowsPerPage}
                  page={pagination.page - 1}
                  SelectProps={{
                    native: true,
                  }}
                  onPageChange={this.handlePageChange}
                  onRowsPerPageChange={this.handleRowsPerPageChange}
                  ActionsComponent={TablePaginationActionsWrapped}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>

        <LimsRowDetailsDialog
          dialogOpened={dialogOpened}
          rowData={rowData}
          onDialogClose={this.handleDialogClose}
        />
      </Paper>
    );
  };

  render() {
    const { authUserInfo } = this.props;
    return <Fragment>{authUserInfo && this.renderHomeView()}</Fragment>;
  }
}

Home.propTypes = {
  authUserInfo: PropTypes.object.isRequired,
  handleStartRunningHomeQuery: PropTypes.func.isRequired,
  handleHomeQueryParamsUpdate: PropTypes.func.isRequired,
  homeParams: PropTypes.object.isRequired,
  homeResult: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    authUserInfo: state.authUserInfo,
    homeParams: state.homeParams,
    homeResult: state.homeResult,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleHomeQueryParamsUpdate: async (params) => {
      dispatch(updateHomeQueryPrams(params));
    },
    handleStartRunningHomeQuery: async (params) => {
      dispatch(startRunningHomeQuery(params));
    },
    handleClearErrorMessage: () => {
      dispatch(clearErrorMessage());
    },
  };
};

const ConnectHome = connect(mapStateToProps, mapDispatchToProps)(Home);

export default withStyles(styles)(ConnectHome);
