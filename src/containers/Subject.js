import React, { Component, Fragment } from 'react';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { API, Auth, Signer } from 'aws-amplify';
import {
  clearErrorMessage,
  startRunningSubjectQuery,
  updateSubjectQueryPrams,
  clearGDSErrorMessage,
  startRunningSubjectGDSQuery,
  updateSubjectGDSQueryPrams,
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
import GDSActionMenuButton from '../components/GDSActionMenuButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info';
import TableContainer from '@material-ui/core/TableContainer';
import { TabPanel, TabView } from 'primereact/tabview';
import { Panel } from 'primereact/panel';
import Link from '@material-ui/core/Link';
import Backdrop from '@material-ui/core/Backdrop';
import Typography from '@material-ui/core/Typography';
import config from '../config';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';

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

class Subject extends Component {
  state = {
    subject: null,
    subjectId: null,
    feature_content_url: null,
    redirect: false,
    dialogOpened: false,
    rowData: null,
    openBackdrop: false,
    clickedLinks: [],
  };

  async componentDidMount() {
    const { subjectId } = this.props.match.params;
    if (subjectId) {
      const subject = await API.get('files', '/subjects/' + subjectId, {});
      this.setState({ subject: subject, subjectId: subjectId });
      const { handleStartRunningSubjectQuery } = this.props;
      await handleStartRunningSubjectQuery(this.getBaseParams(), subjectId);
      const { handleStartRunningSubjectGDSQuery } = this.props;
      await handleStartRunningSubjectGDSQuery(this.getGDSBaseParams(), subjectId);
      const { features } = subject;
      if (Array.isArray(features) && features.length) {
        const feature_content_url = features[0];
        // const feature_content_url = await this.getContentSignedUrl(features[0].id);
        this.setState({ feature_content_url });
      }
    } else {
      this.setState({ redirect: true });
    }
  }

  // ---

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

  // ---

  reloadGDSData = async (params = {}) => {
    const { handleStartRunningSubjectGDSQuery } = this.props;
    await handleStartRunningSubjectGDSQuery(params, this.state.subject.id);
  };

  getGDSBaseParams = () => {
    return this.props.subjectGDSParams;
  };

  handleGDSPageChange = async (event, page) => {
    await this.reloadGDSData({
      ...this.getGDSBaseParams(),
      page: page + 1, // React pagination start at 0 whereas API start at 1
    });
  };

  handleGDSRowsPerPageChange = async (event) => {
    await this.reloadGDSData({
      ...this.getGDSBaseParams(),
      page: 1, // Reset page number if rows per page change
      rowsPerPage: event.target.value,
    });
  };

  handleGDSRequestSort = async (event, property) => {
    const sortCol = property;
    const { subjectGDSParams } = this.props;
    let sortAsc = subjectGDSParams.sortCol === sortCol && !subjectGDSParams.sortAsc;

    // Reset all other search params except query
    await this.reloadGDSData({
      ...this.getGDSBaseParams(),
      page: 1, // Reset page number if sorting change
      sortAsc,
      sortCol,
    });
  };

  handleSubjectGDSQueryChange = async (searchQuery) => {
    await this.props.handleSubjectGDSQueryParamsUpdate({
      search: searchQuery,
      page: 1,
    });
  };

  handleGDSSearchClicked = async () => {
    const { handleStartRunningSubjectGDSQuery, subjectGDSParams } = this.props;
    handleStartRunningSubjectGDSQuery(subjectGDSParams, this.state.subject.id);
  };

  // ---

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

  handleClose = () => {
    this.setState({
      openBackdrop: false,
    });
  };

  getPreSignedUrl = async (id) => {
    const { error, signed_url } = await API.get('files', `/s3/${id}/presign`, {});
    if (error) {
      return error;
    }
    return signed_url;
  };

  getContentSignedUrl = async (id, expiration = 3600) => {
    if (expiration > 604800 || expiration < 1) {
      expiration = 604800;
    }
    const content_endpoint = config.apiGateway.URL + `/s3/${id}/content`;
    const credentials = await Auth.currentCredentials();
    const serviceInfo = {
      region: config.apiGateway.REGION,
      service: 'execute-api',
    };
    const cred = {
      access_key: credentials.accessKeyId,
      secret_key: credentials.secretAccessKey,
      session_token: credentials.sessionToken,
    };
    const params = {
      url: content_endpoint,
      method: 'GET',
    };
    return Signer.signUrl(params, cred, serviceInfo, expiration);
  };

  handleOpenInBrowser = async (id) => {
    const { clickedLinks } = this.state;
    clickedLinks.push(id);
    this.setState({ clickedLinks: clickedLinks });
    this.setState({ openBackdrop: true });
    const url = await this.getPreSignedUrl(id);
    // const url = await this.getContentSignedUrl(id, 60);
    if (url) {
      let win = window.open(url, '_blank');
      win && win.focus();
    }
    this.setState({ openBackdrop: false });
  };

  renderClickableColumn = (data) => {
    const { clickedLinks, subject } = this.state;
    const { id, key } = data;
    const baseName = key.split('/')[key.split('/').length - 1];

    if (key.endsWith('html') || key.endsWith('png')) {
      return (
        <Link
          className={this.props.classes.linkCursorPointer}
          color={clickedLinks.includes(id) ? 'secondary' : 'primary'}
          onClick={() => this.handleOpenInBrowser(id)}>
          {baseName}
        </Link>
      );
    }

    if (subject && (key.endsWith('bam') || key.endsWith('vcf.gz') || key.endsWith('vcf'))) {
      return (
        <Link color={'primary'} component={RouterLink} to={'/igv/' + subject.id}>
          {baseName}
        </Link>
      );
    }

    return baseName;
  };

  renderSubjectView = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {this.renderSubjectLandingView()}
        </Grid>
        <Grid item xs={12}>
          <Panel header={'Subject Data'} toggleable={true}>
            <TabView>
              <TabPanel header={'S3'}>
                <TableContainer>
                  {this.renderChipFilterView()}
                  {this.renderSubjectS3View()}
                </TableContainer>
              </TabPanel>
              <TabPanel header={'GDS'}>
                <TableContainer>{this.renderSubjectGDSView()}</TableContainer>
              </TabPanel>
            </TabView>
          </Panel>
        </Grid>
      </Grid>
    );
  };

  renderSubjectLandingView = () => {
    const { results } = this.state.subject;
    const feature_content_url = this.state.feature_content_url;

    const wgs = results.filter((r) => r.key.includes('WGS/'));
    const wts = results.filter((r) => r.key.includes('WTS/'));
    const bams = wgs.filter((r) => r.key.endsWith('bam'));
    const vcfs = wgs.filter((r) => r.key.endsWith('vcf.gz') || r.key.endsWith('.maf'));
    const circos = wgs.filter((r) => r.key.endsWith('png'));
    const pcgr = wgs.filter((r) => r.key.endsWith('pcgr.html'));
    const cpsr = wgs.filter((r) => r.key.endsWith('cpsr.html'));
    const multiqc = wgs.filter(
      (r) => r.key.includes('umccrised') && r.key.endsWith('multiqc_report.html')
    );
    const cancer = wgs.filter(
      (r) => r.key.includes('umccrised') && r.key.endsWith('cancer_report.html')
    );
    const coverage = wgs.filter((r) => r.key.includes('cacao') && r.key.endsWith('html'));
    const wtsBams = wts.filter((r) => r.key.endsWith('bam'));
    const wtsQc = wts.filter((r) => r.key.endsWith('multiqc_report.html'));
    const rnasum = wts.filter((r) => r.key.endsWith('RNAseq_report.html'));

    return (
      <div className={'p-grid'}>
        <div className={'p-col-12 p-lg-5'}>
          <Panel header={'Overview'}>{this.renderSubjectLandingOverview()}</Panel>
          <Panel header={'Tools'} toggleable={true} style={{ marginTop: '1em' }}>
            {this.renderSubjectToolPanel()}
          </Panel>
          <Panel header={'Feature'} toggleable={true} style={{ marginTop: '1em' }}>
            {feature_content_url ? (
              <img src={feature_content_url} style={{ width: '100%', height: 'auto' }} alt={''} />
            ) : (
              <img
                src='data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='
                alt={''}
              />
            )}
          </Panel>
        </div>
        <div className={'p-col-12 p-lg-7'}>
          <Panel header={'Sample Info'} toggleable={true}>
            {this.renderSubjectSampleInfoView()}
          </Panel>
          <Panel header={'Analysis Results'} toggleable={true} style={{ marginTop: '1em' }}>
            <TabView>
              <TabPanel header='WGS'>
                <TableContainer>
                  <Paper elevation={0}>
                    <Table size={'small'} aria-label={'a dense table'}>
                      {this.renderResultTable('cancer report', cancer)}
                      {this.renderResultTable('pcgr', pcgr)}
                      {this.renderResultTable('cpsr', cpsr)}
                      {this.renderResultTable('qc report', multiqc)}
                      {this.renderResultTable('coverage report', coverage)}
                      {this.renderResultTable('vcf', vcfs)}
                      {this.renderResultTable('bam', bams)}
                      {this.renderResultTable('circos plot', circos)}
                    </Table>
                  </Paper>
                </TableContainer>
              </TabPanel>
              <TabPanel header='WTS'>
                <TableContainer>
                  <Paper elevation={0}>
                    <Table size={'small'} aria-label={'a dense table'}>
                      {this.renderResultTable('rnasum report', rnasum)}
                      {this.renderResultTable('qc report', wtsQc)}
                      {this.renderResultTable('bam', wtsBams)}
                    </Table>
                  </Paper>
                </TableContainer>
              </TabPanel>
              <TabPanel header={'TSO500'} disabled={true} />
              <TabPanel header={'ICA'} disabled={true} />
            </TabView>
          </Panel>
        </div>
      </div>
    );
  };

  renderSubjectLandingOverview = () => {
    const { lims } = this.state.subject;
    const columns = [
      { key: 'subject_id', sortable: true },
      { key: 'external_subject_id', sortable: true },
      { key: 'illumina_id', sortable: true },
      { key: 'run', sortable: true },
      { key: 'timestamp', sortable: true },
      { key: 'project_name', sortable: true },
      { key: 'project_owner', sortable: true },
    ];
    const d = lims[0];

    return (
      <TableContainer>
        <Paper elevation={0}>
          <Table size={'small'} aria-label={'a dense table'}>
            <TableBody>
              {d != null &&
                columns.map((col) => (
                  <TableRow key={col.key} className={this.props.classes.tableRow}>
                    <TableCell>{getDisplayTitle(col.key)}</TableCell>
                    {col.key === 'illumina_id' ? (
                      <TableCell>
                        <Link color='primary' component={RouterLink} to={'/runs/' + d[col.key]}>
                          {d[col.key]}
                        </Link>
                      </TableCell>
                    ) : (
                      <TableCell>{d[col.key]}</TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      </TableContainer>
    );
  };

  renderSubjectToolPanel = () => {
    const { subjectId } = this.state;
    return (
      <Fragment>
        <List>
          <ListItem button component={RouterLink} to={'/igv/' + subjectId}>
            <ListItemIcon>
              <img src={'/igv.png'} alt='igv.png' width='24px' height='24px' />
            </ListItemIcon>
            <ListItemText primary='Open Subject Data in Online Integrative Genomics Viewer' />
          </ListItem>
        </List>
      </Fragment>
    );
  };

  renderResultTable = (title, data, label) => {
    const columns = [
      { key: 'key', sortable: true },
      { key: 'actions', sortable: false },
      { key: 'size', sortable: true },
      { key: 'last_modified_date', sortable: true },
    ];

    return (
      <Fragment>
        <TableHead>
          <TableRow>
            <TableCell colSpan={columns.length + 1}>{title.toUpperCase()}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className={this.props.classes.tableRow}>
              <TableCell>{label ? label : ' '}</TableCell>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.key === 'actions' ? (
                    <ActionMenuButton data={row} authUserInfo={this.props.authUserInfo} />
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
      </Fragment>
    );
  };

  renderSubjectSampleInfoView = () => {
    const { dialogOpened, rowData } = this.state;
    const { id, lims } = this.state.subject;
    const columns = [
      { key: 'info', sortable: false },
      { key: 'type', sortable: true },
      { key: 'sample_id', sortable: true },
      { key: 'external_sample_id', sortable: true },
      { key: 'library_id', sortable: true },
      { key: 'phenotype', sortable: true },
      { key: 'assay', sortable: true },
    ];

    return (
      <TableContainer>
        <Paper elevation={0}>
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
                  <TableRow key={row.id} className={this.props.classes.tableRow}>
                    {columns.map((col) =>
                      col.key === 'info' ? (
                        <TableCell key={col.key}>
                          <Button aria-label='info' onClick={this.handleRowClick(row.id)}>
                            <InfoIcon color={'primary'} />
                          </Button>
                        </TableCell>
                      ) : col.key === 'illumina_id' ? (
                        <TableCell key={col.key}>
                          <Button
                            color='primary'
                            component={RouterLink}
                            to={'/runs/' + row[col.key]}>
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
          <LimsRowDetailsDialog
            dialogOpened={dialogOpened}
            rowData={rowData}
            onDialogClose={this.handleDialogClose}
          />
        </Paper>
      </TableContainer>
    );
  };

  renderChipFilterView = () => {
    const chipData = [
      { key: 0, label: 'reset', keyword: '', color: 'primary' },
      {
        key: 1,
        label: 'cancer report tables',
        keyword: 'umccrised cancer_report_tables .tsv.gz$',
        color: 'default',
      },
      {
        key: 2,
        label: 'cancer report',
        keyword: 'umccrised cancer_report.html$',
        color: 'default',
      },
      { key: 3, label: 'wgs bam', keyword: 'wgs ready .bam$', color: 'default' },
      {
        key: 4,
        label: 'vcf',
        keyword: 'umccrised/[^(work)*] small_variants/[^\\/]*(.vcf.gz$|.maf$)',
        color: 'default',
      },
      {
        key: 5,
        label: 'wgs qc',
        keyword: 'umccrised multiqc_report.html$',
        color: 'default',
      },
      {
        key: 6,
        label: 'pcgr cpsr',
        keyword: 'umccrised/[^\\/]*/[^\\/]*(pcgr|cpsr).html$',
        color: 'default',
      },
      {
        key: 7,
        label: 'coverage',
        keyword: 'umccrised/[^\\/]*/[^\\/]*(normal|tumor).cacao.html$',
        color: 'default',
      },
      {
        key: 8,
        label: 'circos',
        keyword: 'umccrised/[^(work)*] purple/ circos baf .png$',
        color: 'default',
      },
      { key: 9, label: 'wts bam', keyword: 'wts ready .bam$', color: 'default' },
      {
        key: 10,
        label: 'wts qc',
        keyword: 'wts multiqc/ multiqc_report.html$',
        color: 'default',
      },
      { key: 11, label: 'rnasum report', keyword: 'RNAseq_report.html$', color: 'default' },
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
    ];

    return (
      <Paper elevation={0}>
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

  // ---

  renderSubjectGDSView = () => {
    const { sortAsc, sortCol, search } = this.props.subjectGDSParams;
    const { loading, data } = this.props.subjectGDSResult;
    const { results, pagination } = data;
    const columns = [
      { key: 'volume_name', sortable: true },
      { key: 'path', sortable: true },
      { key: 'actions', sortable: false },
      { key: 'size', sortable: true, label: 'size_in_bytes' },
      { key: 'time_modified', sortable: true },
    ];

    return (
      <Paper elevation={0}>
        <Typography variant={'h6'} color={'secondary'}>
          THIS IS BETA FEATURE. PLEASE ASK FOR PRODUCTION USE IF ANY.
        </Typography>
        <Typography variant={'subtitle2'}>
          Data from Genomic Data Store (GDS) - Illumina Connected Analytics (ICA) Pipeline
        </Typography>
        <hr />

        <Toolbar>
          <Box width={1 / 3}>
            <TextField
              fullWidth
              label={'Search Filter'}
              type={'search'}
              value={search}
              onChange={(e) => this.handleSubjectGDSQueryChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && this.handleGDSSearchClicked()}
              InputProps={{
                endAdornment: (
                  <InputAdornment color={'primary'} position={'end'}>
                    <IconButton color='primary' onClick={this.handleGDSSearchClicked}>
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
            onRequestSort={this.handleGDSRequestSort}
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
                        <GDSActionMenuButton data={row} authUserInfo={this.props.authUserInfo} />
                      ) : col.key === 'size' ? (
                        <HumanReadableFileSize bytes={row[col.label]} />
                      ) : col.key === 'time_modified' ? (
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
                  onChangePage={this.handleGDSPageChange}
                  onChangeRowsPerPage={this.handleGDSRowsPerPageChange}
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
    const { redirect, subject, openBackdrop } = this.state;

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
  handleStartRunningSubjectGDSQuery: PropTypes.func.isRequired,
  handleSubjectGDSQueryParamsUpdate: PropTypes.func.isRequired,
  handleClearGDSErrorMessage: PropTypes.func.isRequired,
  subjectGDSParams: PropTypes.object.isRequired,
  subjectGDSResult: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    authUserInfo: state.authUserInfo,
    subjectParams: state.subjectParams,
    subjectResult: state.subjectResult,
    subjectGDSParams: state.subjectGDSParams,
    subjectGDSResult: state.subjectGDSResult,
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
    handleSubjectGDSQueryParamsUpdate: async (params) => {
      dispatch(updateSubjectGDSQueryPrams(params));
    },
    handleStartRunningSubjectGDSQuery: async (params, subjectId) => {
      dispatch(startRunningSubjectGDSQuery(params, subjectId));
    },
    handleClearGDSErrorMessage: () => {
      dispatch(clearGDSErrorMessage());
    },
  };
};

const ConnectSubject = connect(mapStateToProps, mapDispatchToProps)(Subject);

export default withStyles(styles)(ConnectSubject);
