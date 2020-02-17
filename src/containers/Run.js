import React, { Component, Fragment } from 'react';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { API } from 'aws-amplify';
import { clearErrorMessage, startRunQuery, updateRunQueryPrams } from '../actions/run';
import {
  clearRunMetaErrorMessage,
  startRunMetaQuery,
  updateRunMetaQueryPrams,
} from '../actions/runmeta';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import { TablePaginationActionsWrapped } from '../components/TablePagniationActionsWrapped';
import Grid from '@material-ui/core/Grid';
import Moment from 'react-moment';
import history from '../history';
import EnhancedTableHead from '../components/EnhancedTableHead';
import HumanReadableFileSize from '../components/HumanReadableFileSize';
import Button from '@material-ui/core/Button';
import LimsRowDetailsDialog from '../components/LimsRowDetailsDialog';
import Chip from '@material-ui/core/Chip';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import ActionMenuButton from '../components/ActionMenuButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import MoreIcon from '@material-ui/icons/More';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { defaultRunMetaParams, defaultRunParams } from '../reducers';
import Backdrop from '@material-ui/core/Backdrop';

const styles = (theme) => ({
  close: {
    padding: theme.spacing(0.5),
  },
  root: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  heading: {
    fontSize: theme.typography.pxToRem(18),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  expSummaryExpanded: {
    backgroundColor: '#E0E0E0',
  },
  expSummaryRoot: {
    backgroundColor: '#E0E0E0',
  },
  expDetailsRoot: {
    padding: '8px 24px 8px 24px',
  },
  expExpandIcon: {
    order: -1,
  },
  linkCursorPointer: {
    cursor: 'pointer',
  },
  tableRow: {
    '&:last-child th, &:last-child td': {
      borderBottom: 0,
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
});

class Run extends Component {
  state = {
    runId: null,
    redirect: false,
    dialogOpened: false,
    rowData: null,
    openBackdrop: false,
    clickedLinks: [],
  };

  async componentDidMount() {
    const { runId } = this.props.match.params;
    if (runId) {
      this.setState({ runId: runId });
      const { handleStartRunMetaQuery } = this.props;
      await handleStartRunMetaQuery(defaultRunMetaParams, runId);
      const { handleStartRunQuery } = this.props;
      await handleStartRunQuery(defaultRunParams, runId);
    } else {
      this.setState({ redirect: true });
    }
  }

  reloadData = async (params = {}) => {
    const { handleStartRunQuery } = this.props;
    await handleStartRunQuery(params, this.state.runId);
  };

  getBaseParams = () => {
    return this.props.runParams;
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
    const { runParams } = this.props;
    let sortAsc = runParams.sortCol === sortCol && !runParams.sortAsc;

    // Reset all other search params except query
    await this.reloadData({
      ...this.getBaseParams(),
      page: 1, // Reset page number if sorting change
      sortAsc,
      sortCol,
    });
  };

  handleQueryParamsChange = async (searchQuery) => {
    await this.props.handleRunQueryParamsUpdate({
      search: searchQuery,
      page: 1,
    });
  };

  handleSearchClicked = async () => {
    const { handleStartRunQuery, runParams } = this.props;
    handleStartRunQuery(runParams, this.state.runId);
  };

  reloadRunMetaData = async (params = {}) => {
    const { handleStartRunMetaQuery } = this.props;
    await handleStartRunMetaQuery(params, this.state.runId);
  };

  getRunMetaBaseParams = () => {
    return this.props.runMetaParams;
  };

  handleRunMetaPageChange = async (event, page) => {
    await this.reloadRunMetaData({
      ...this.getRunMetaBaseParams(),
      page: page + 1, // React pagination start at 0 whereas API start at 1
    });
  };

  handleRunMetaRowsPerPageChange = async (event) => {
    await this.reloadRunMetaData({
      ...this.getRunMetaBaseParams(),
      page: 1, // Reset page number if rows per page change
      rowsPerPage: event.target.value,
    });
  };

  handleRunMetaRequestSort = async (event, property) => {
    const sortCol = property;
    const { runMetaParams } = this.props;
    let sortAsc = runMetaParams.sortCol === sortCol && !runMetaParams.sortAsc;

    // Reset all other search params except query
    await this.reloadRunMetaData({
      ...this.getRunMetaBaseParams(),
      page: 1, // Reset page number if sorting change
      sortAsc,
      sortCol,
    });
  };

  handleRunMetaQueryParamsChange = async (searchQuery) => {
    await this.props.handleRunMetaQueryParamsUpdate({
      search: searchQuery,
      page: 1,
    });
  };

  handleRunMetaSearchClicked = async () => {
    const { handleStartRunMetaQuery, runMetaParams } = this.props;
    handleStartRunMetaQuery(runMetaParams, this.state.runId);
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

  handleChipClick = (selected) => {
    return async () => {
      await this.handleChipFilter(selected);
    };
  };

  handleChipFilter = async (selected) => {
    await this.reloadData({
      ...this.getBaseParams(),
      search: selected['keyword'],
      page: 1,
    });
  };

  renderRunView = () => {
    const { classes } = this.props;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ExpansionPanel elevation={3} defaultExpanded>
            <ExpansionPanelSummary
              classes={{
                expanded: classes.expSummaryExpanded,
                root: classes.expSummaryRoot,
                expandIcon: classes.expExpandIcon,
              }}
              IconButtonProps={{ edge: 'start' }}
              expandIcon={<ExpandMoreIcon />}
              id='panel1-header'>
              <Typography className={classes.heading}>Run Data</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails classes={{ root: classes.expDetailsRoot }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  {this.renderChipFilterView()}
                </Grid>
                <Grid item xs={12}>
                  {this.renderRunS3View()}
                </Grid>
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        <Grid item xs={12}>
          <ExpansionPanel elevation={3}>
            <ExpansionPanelSummary
              classes={{
                expanded: classes.expSummaryExpanded,
                root: classes.expSummaryRoot,
                expandIcon: classes.expExpandIcon,
              }}
              IconButtonProps={{ edge: 'start' }}
              expandIcon={<ExpandMoreIcon />}
              id='panel2-header'>
              <Typography className={classes.heading}>LIMS Metadata</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails classes={{ root: classes.expDetailsRoot }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  {this.renderRunMetaDataView()}
                </Grid>
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
      </Grid>
    );
  };

  renderRunMetaDataView = () => {
    const { sortAsc, sortCol, search } = this.props.runMetaParams;
    const { loading, data } = this.props.runMetaResult;
    const { results, pagination } = data;
    const { dialogOpened, rowData } = this.state;

    const columns = [
      { key: 'info', sortable: false },
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
      { key: 'results', sortable: true },
    ];

    return (
      <Paper elevation={0}>
        <Toolbar>
          <Box width={1 / 4}>
            <TextField
              fullWidth
              label={'Search Filter'}
              type={'search'}
              value={search}
              onChange={(e) => this.handleRunMetaQueryParamsChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && this.handleRunMetaSearchClicked()}
              InputProps={{
                endAdornment: (
                  <InputAdornment color={'primary'} position={'end'}>
                    <IconButton color='primary' onClick={this.handleRunMetaSearchClicked}>
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
            onRequestSort={this.handleRunMetaRequestSort}
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
                        <IconButton aria-label='info' onClick={this.handleRowClick(row.id)}>
                          <MoreIcon color={'primary'} />
                        </IconButton>
                      </TableCell>
                    ) : col.key === 'subject_id' ? (
                      <TableCell key={col.key}>
                        {row[col.key] && (
                          <Button
                            color='primary'
                            component={RouterLink}
                            to={'/subjects/' + row[col.key]}>
                            {row[col.key]}
                          </Button>
                        )}
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
              <TableRow className={this.props.classes.tableRow}>
                <TablePagination
                  colSpan={8}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  count={pagination.count}
                  rowsPerPage={pagination.rowsPerPage}
                  page={pagination.page - 1}
                  SelectProps={{
                    native: true,
                  }}
                  onChangePage={this.handleRunMetaPageChange}
                  onChangeRowsPerPage={this.handleRunMetaRowsPerPageChange}
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

  renderChipFilterView = () => {
    const chipData = [
      { key: 0, label: 'reset', keyword: '', color: 'primary' },
      { key: 1, label: 'qc reports', keyword: '.html$', color: 'default' },
    ];

    return (
      <div className={this.props.classes.root}>
        {chipData.map((data) => {
          return (
            <Chip
              key={data.key}
              label={data.label}
              onClick={this.handleChipClick(data)}
              className={this.props.classes.chip}
              color={data.color}
              icon={data.key === 0 ? <EmojiEmotionsIcon /> : undefined}
            />
          );
        })}
      </div>
    );
  };

  handleClose = () => {
    this.setState({
      openBackdrop: false,
    });
  };

  getPreSignedUrl = async (bucket, key) => {
    return await API.get('files', `/file-signed-url?bucket=${bucket}&key=${key}`, {});
  };

  handleOpenInBrowser = async (bucket, key, id) => {
    const { clickedLinks } = this.state;
    clickedLinks.push(id);
    this.setState({ clickedLinks: clickedLinks });
    this.setState({ openBackdrop: true });
    const url = await this.getPreSignedUrl(bucket, key);
    window.open(url, '_blank');
    this.setState({ openBackdrop: false });
  };

  renderClickableColumn = (data) => {
    const { clickedLinks } = this.state;
    const { bucket, key, id } = data;

    if (key.endsWith('html')) {
      return (
        <Link
          className={this.props.classes.linkCursorPointer}
          color={clickedLinks.includes(id) ? 'secondary' : 'primary'}
          onClick={() => this.handleOpenInBrowser(bucket, key, id)}>
          {key}
        </Link>
      );
    }
    return key;
  };

  renderRunS3View = () => {
    const { sortAsc, sortCol, search } = this.props.runParams;
    const { loading, data } = this.props.runResult;
    const { results, pagination } = data;
    const columns = [
      { key: 'bucket', sortable: true },
      { key: 'key', sortable: true },
      { key: 'actions', sortable: false },
      { key: 'size', sortable: true },
      { key: 'last_modified_date', sortable: true },
      { key: 'e_tag', sortable: true },
    ];

    return (
      <Paper elevation={0}>
        <Toolbar>
          <Box width={1 / 4}>
            <TextField
              fullWidth
              label={'Search Filter'}
              type={'search'}
              value={search}
              onChange={(e) => this.handleQueryParamsChange(e.target.value)}
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
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.key === 'actions' ? (
                        <ActionMenuButton data={row} />
                      ) : col.key === 'key' ? (
                        this.renderClickableColumn(row)
                      ) : col.key === 'size' ? (
                        <HumanReadableFileSize bytes={row[col.key]} />
                      ) : col.key === 'last_modified_date' ? (
                        <Moment local>{row[col.key]}</Moment>
                      ) : (
                        row[col.key]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
          {pagination != null && (
            <TableFooter>
              <TableRow className={this.props.classes.tableRow}>
                <TablePagination
                  colSpan={columns.length * 0.5}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  count={pagination.count}
                  rowsPerPage={pagination.rowsPerPage}
                  page={pagination.page - 1}
                  SelectProps={{
                    native: true,
                  }}
                  onChangePage={this.handlePageChange}
                  onChangeRowsPerPage={this.handleRowsPerPageChange}
                  ActionsComponent={TablePaginationActionsWrapped}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Paper>
    );
  };

  render() {
    const { authUserInfo } = this.props;
    const { redirect, openBackdrop } = this.state;

    if (authUserInfo && redirect) {
      const homePath = '/';
      history.push(homePath);
      return <Redirect to={homePath} />;
    }

    return (
      <Fragment>
        {authUserInfo && this.renderRunView()}
        {this.renderErrorMessage()}
        <Backdrop
          className={this.props.classes.backdrop}
          open={openBackdrop}
          onAbort={this.handleClose}
          timeout={500}>
          <CircularProgress color='inherit' />
        </Backdrop>
      </Fragment>
    );
  }

  handleCloseErrorMessage = () => {
    // Clear error message in the state
    const { handleClearErrorMessage } = this.props;
    handleClearErrorMessage();
  };

  // Show snackbar if we have an error message and it has not been hidden
  openSnackbar = () => this.props.runResult.errorMessage !== null;

  renderErrorMessage = () => {
    const { errorMessage } = this.props.runResult;

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

Run.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object,
  authUserInfo: PropTypes.object.isRequired,
  handleStartRunQuery: PropTypes.func.isRequired,
  handleRunQueryParamsUpdate: PropTypes.func.isRequired,
  handleClearErrorMessage: PropTypes.func.isRequired,
  runParams: PropTypes.object.isRequired,
  runResult: PropTypes.object.isRequired,
  handleStartRunMetaQuery: PropTypes.func.isRequired,
  handleRunMetaQueryParamsUpdate: PropTypes.func.isRequired,
  handleRunMetaClearErrorMessage: PropTypes.func.isRequired,
  runMetaParams: PropTypes.object.isRequired,
  runMetaResult: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    authUserInfo: state.authUserInfo,
    runParams: state.runParams,
    runResult: state.runResult,
    runMetaParams: state.runMetaParams,
    runMetaResult: state.runMetaResult,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleRunQueryParamsUpdate: async (params) => {
      dispatch(updateRunQueryPrams(params));
    },
    handleStartRunQuery: async (params, runId) => {
      dispatch(startRunQuery(params, runId));
    },
    handleClearErrorMessage: () => {
      dispatch(clearErrorMessage());
    },
    handleRunMetaQueryParamsUpdate: async (params) => {
      dispatch(updateRunMetaQueryPrams(params));
    },
    handleStartRunMetaQuery: async (params, runId) => {
      dispatch(startRunMetaQuery(params, runId));
    },
    handleRunMetaClearErrorMessage: () => {
      dispatch(clearRunMetaErrorMessage());
    },
  };
};

const ConnectRun = connect(
  mapStateToProps,
  mapDispatchToProps
)(Run);

export default withStyles(styles)(ConnectRun);
