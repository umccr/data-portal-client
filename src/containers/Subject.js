import React, { Component, Fragment } from 'react';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { API } from 'aws-amplify';
import {
  clearErrorMessage,
  startRunningSubjectQuery,
  updateSubjectQueryPrams,
} from '../actions/subject';

import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
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
import LinearProgress from '@material-ui/core/LinearProgress';
import Moment from 'react-moment';
import history from '../history';
import EnhancedTableHead, { getDisplayTitle } from '../components/EnhancedTableHead';
import HumanReadableFileSize from '../components/HumanReadableFileSize';
import Button from '@material-ui/core/Button';
import LimsRowDetailsDialog from '../components/LimsRowDetailsDialog';
import Chip from '@material-ui/core/Chip';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import ActionMenuButton from '../components/ActionMenuButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import MoreIcon from '@material-ui/icons/More';

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
});

class Subject extends Component {
  state = {
    subject: null,
    redirect: false,
    dialogOpened: false,
    rowData: null,
  };

  async componentDidMount() {
    const { subjectId } = this.props.match.params;
    if (subjectId) {
      const subject = await API.get('files', '/subjects/' + subjectId, {});
      this.setState({ subject });
      const { handleStartRunningSubjectQuery } = this.props;
      await handleStartRunningSubjectQuery(this.getBaseParams(), subjectId);
    } else {
      this.setState({ redirect: true });
    }
  }

  reloadData = async (params = {}) => {
    const { handleStartRunningSubjectQuery } = this.props;
    await handleStartRunningSubjectQuery(params, this.state.subject.id);
  };

  getBaseParams = () => {
    return this.props.subjectParams;
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
    const { subjectParams } = this.props;
    let sortAsc = subjectParams.sortCol === sortCol && !subjectParams.sortAsc;

    // Reset all other search params except query
    await this.reloadData({
      ...this.getBaseParams(),
      page: 1, // Reset page number if sorting change
      sortAsc,
      sortCol,
    });
  };

  handleSubjectQueryChange = async (searchQuery) => {
    await this.props.handleSubjectQueryParamsUpdate({
      search: searchQuery,
      page: 1,
    });
  };

  handleSearchClicked = async () => {
    const { handleStartRunningSubjectQuery, subjectParams } = this.props;
    handleStartRunningSubjectQuery(subjectParams, this.state.subject.id);
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

  renderSubjectView = () => {
    const { dialogOpened, rowData } = this.state;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {this.renderSubjectMetaDataView()}
        </Grid>
        <Grid item xs={12}>
          {this.renderChipFilterView()}
        </Grid>
        <Grid item xs={12}>
          {this.renderSubjectS3View()}
        </Grid>
        <LimsRowDetailsDialog
          dialogOpened={dialogOpened}
          rowData={rowData}
          onDialogClose={this.handleDialogClose}
        />
      </Grid>
    );
  };

  renderSubjectMetaDataView = () => {
    const { id, lims } = this.state.subject;
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
      <Paper>
        <Table size={'small'} aria-label={'a dense table'}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>{getDisplayTitle(col.key)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {id != null &&
              lims.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) =>
                    col.key === 'info' ? (
                      <TableCell key={col.key}>
                        <IconButton aria-label='info' onClick={this.handleRowClick(row.id)}>
                          <MoreIcon color={'primary'} />
                        </IconButton>
                      </TableCell>
                    ) : col.key === 'illumina_id' ? (
                      <TableCell key={col.key}>
                        <Button color='primary' component={RouterLink} to={'/runs/' + row[col.key]}>
                          {row[col.key]}
                        </Button>
                      </TableCell>
                    ) : (
                      <TableCell key={col.key}>{row[col.key]}</TableCell>
                    )
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  renderChipFilterView = () => {
    const chipData = [
      { key: 0, label: 'reset', keyword: '', color: 'primary' },
      { key: 1, label: 'wgs bam', keyword: 'wgs ready .bam$', color: 'default' },
      {
        key: 2,
        label: 'vcf',
        keyword: 'umccrised/[^(work)*] (somatic-ensemble|normal-ensemble-predispose_genes).vcf.gz$',
        color: 'default',
      },
      {
        key: 3,
        label: 'umccrised cancer report',
        keyword: 'umccrised cancer_report.html$',
        color: 'default',
      },
      {
        key: 4,
        label: 'umccrised multiqc report',
        keyword: 'umccrised multiqc_report.html$',
        color: 'default',
      },
      {
        key: 5,
        label: 'pcgr report',
        keyword: 'umccrised pcgr/ (pcgr|cpsr).html$',
        color: 'default',
      },
      {
        key: 6,
        label: 'coverage report',
        keyword: 'cacao html (cacao_normal|cacao_tumor)',
        color: 'default',
      },
      { key: 7, label: 'circos', keyword: 'work/ purple/ circos baf .png$', color: 'default' },
      { key: 8, label: 'wts bam', keyword: 'wts ready .bam$', color: 'default' },
      {
        key: 9,
        label: 'wts multiqc',
        keyword: 'wts multiqc/ multiqc_report.html$',
        color: 'default',
      },
      { key: 10, label: 'rnasum report', keyword: 'RNAseq_report.html$', color: 'default' },
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

  renderSubjectS3View = () => {
    const { sortAsc, sortCol, search } = this.props.subjectParams;
    const { loading, data } = this.props.subjectResult;
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
      <Paper elevation={1}>
        <Toolbar>
          <Box width={1 / 3}>
            <TextField
              fullWidth
              label={'Search Filter'}
              type={'search'}
              value={search}
              onChange={(e) => this.handleSubjectQueryChange(e.target.value)}
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
                        <ActionMenuButton data={row} authUserInfo={this.props.authUserInfo} />
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
              <TableRow>
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
    const { redirect, subject } = this.state;

    if (authUserInfo && redirect) {
      const homePath = '/';
      history.push(homePath);
      return <Redirect to={homePath} />;
    }

    return (
      <Fragment>
        {authUserInfo && !subject && <LinearProgress />}
        {authUserInfo && subject && this.renderSubjectView()}
        {this.renderErrorMessage()}
      </Fragment>
    );
  }

  handleCloseErrorMessage = () => {
    // Clear error message in the state
    const { handleClearErrorMessage } = this.props;
    handleClearErrorMessage();
  };

  // Show snackbar if we have an error message and it has not been hidden
  openSnackbar = () => this.props.subjectResult.errorMessage !== null;

  renderErrorMessage = () => {
    const { errorMessage } = this.props.subjectResult;

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

Subject.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object,
  authUserInfo: PropTypes.object.isRequired,
  handleStartRunningSubjectQuery: PropTypes.func.isRequired,
  handleSubjectQueryParamsUpdate: PropTypes.func.isRequired,
  handleClearErrorMessage: PropTypes.func.isRequired,
  subjectParams: PropTypes.object.isRequired,
  subjectResult: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    authUserInfo: state.authUserInfo,
    subjectParams: state.subjectParams,
    subjectResult: state.subjectResult,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSubjectQueryParamsUpdate: async (params) => {
      dispatch(updateSubjectQueryPrams(params));
    },
    handleStartRunningSubjectQuery: async (params, subjectId) => {
      dispatch(startRunningSubjectQuery(params, subjectId));
    },
    handleClearErrorMessage: () => {
      dispatch(clearErrorMessage());
    },
  };
};

const ConnectSubject = connect(
  mapStateToProps,
  mapDispatchToProps
)(Subject);

export default withStyles(styles)(ConnectSubject);
