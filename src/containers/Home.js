import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableFooter from '@material-ui/core/TableFooter';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableHead from '@material-ui/core/TableHead';
import { TablePaginationActionsWrapped } from '../components/TablePagniationActionsWrapped';
import CircularProgress from '@material-ui/core/CircularProgress';
import { clearErrorMessage, startRunningHomeQuery, updateHomeQueryPrams } from '../actions/home';
import * as PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { API } from 'aws-amplify';

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
});

class Home extends Component {

    state = {
        dialog_open: false,
        row_id: null,
        row_data: null,
    };

    async componentDidMount() {
        const { handleStartRunningHomeQuery } = this.props;
        await handleStartRunningHomeQuery(this.getBaseParams());
    }

    reloadData = async (params = {}) => {
        // React pagination start at 0 whereas API start at 1, see also below for rowsPerPage
        params.page += 1;

        const { handleStartRunningHomeQuery } = this.props;
        await handleStartRunningHomeQuery(params);
    };

    getBaseParams = () => {
        return this.props.homeParams;
    };

    handlePageChange = async (event, page) => {
        await this.reloadData({
            ...this.getBaseParams(),
            page: page,
        });
    };

    handleRowsPerPageChange = async event => {
        await this.reloadData({
            ...this.getBaseParams(),
            page: 0, // Reset page number if rows per page change
            rowsPerPage: event.target.value,
        });
    };

    handleCloseErrorMessage = (event, reason) => {
        // Clear error message in the state
        const { handleClearErrorMessage } = this.props;

        handleClearErrorMessage();
    };

    handleRowClick = (id) => {
      return (event) => {
          this.handleDialogOpen(id);
      }
    };

    handleDialogOpen = (id) => {
        const dialog_open = true;
        const row_id = id;
        this.setState({dialog_open});
        this.setState({row_id}, () => this.processRowDetails());
    };

    handleDialogClose = () => {
        const dialog_open = false;
        const row_data = null;
        this.setState({dialog_open, row_data});
    };

    processRowDetails = async () => {
        const row_id = this.state.row_id;
        const row_data = await API.get('files', `/lims/${row_id}/`, {});
        this.setState({row_data});
    };

    renderPublicLanding = () => {
        return (
            <div>
                <Typography variant="body1" gutterBottom>
                    Led by Professor Sean Grimmond, the UMCCR aims to foster
                    innovation and integration in cancer care, research,
                    education and training to achieve a world-leading cancer
                    centre and workforce.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The UMCCR focuses on improving the molecular detection and
                    diagnosis of cancer, improving therapeutic decisions for
                    patients through computational oncology, and enabling
                    innovative programs in personalised cancer care.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Based at the Victorian Comprehensive Cancer Centre (VCCC),
                    the UMCCR facilitates the sharing of infrastructure and
                    supports collaboration within the Melbourne Biomedical
                    Precinct and the wider VCCC alliance.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The UMCCR works in a wide variety of cancers including
                    breast, ovarian, prostate, colorectal, pancreatic,
                    neuroendocrine, gastric, oesophageal and melanoma, but
                    recalcitrant cancers – for which the standard of care has
                    changed little over the last 30 years – is an emerging
                    theme.
                </Typography>
            </div>
        )
    };

    renderHomeView = () => {
        const { loading, data } = this.props.homeResult;
        const { results, pagination } = data;
        const { dialog_open, row_id, row_data } = this.state;

        return (
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>RN</TableCell>
                            <TableCell>RUN</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Subject ID</TableCell>
                            <TableCell>External Subject ID</TableCell>
                            <TableCell>Sample Name</TableCell>
                            <TableCell>Sample ID</TableCell>
                            <TableCell>External Sample ID</TableCell>
                            <TableCell>Library ID</TableCell>
                            <TableCell>Results</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    style={{ textAlign: 'center' }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && results != null && results.map((row, idx) =>
                            <TableRow key={row.rn} onClick={this.handleRowClick(row.rn)}>
                                <TableCell>
                                    {row.rn}
                                </TableCell>
                                <TableCell>
                                    {row.run}
                                </TableCell>
                                <TableCell>
                                    {row.type}
                                </TableCell>
                                <TableCell>
                                    {row.timestamp}
                                </TableCell>
                                <TableCell>
                                    {row.subject_id}
                                </TableCell>
                                <TableCell>
                                    {row.external_subject_id}
                                </TableCell>
                                <TableCell>
                                    {row.sample_name}
                                </TableCell>
                                <TableCell>
                                    {row.sample_id}
                                </TableCell>
                                <TableCell>
                                    {row.external_sample_id}
                                </TableCell>
                                <TableCell>
                                    {row.library_id}
                                </TableCell>
                                <TableCell>
                                    {row.results}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {pagination != null && (
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[10, 20, 50]}
                                colSpan={8}
                                count={pagination.count}
                                rowsPerPage={pagination.rowsPerPage}
                                page={pagination.page - 1}
                                SelectProps={{
                                    native: true,
                                }}
                                onChangePage={this.handlePageChange}
                                onChangeRowsPerPage={
                                    this.handleRowsPerPageChange
                                }
                                ActionsComponent={
                                    TablePaginationActionsWrapped
                                }
                            />
                        </TableRow>
                    </TableFooter>
                    )}
                </Table>

                <Dialog
                    open={dialog_open}
                    onClose={this.handleDialogClose}
                    scroll={'paper'}
                    maxWidth={'lg'}
                >
                    <DialogTitle>
                        {row_data != null ?
                            (row_data.subject_id ? row_data.subject_id : row_data.sample_id) : 'Loading... ' + row_id}
                    </DialogTitle>
                    <DialogContent>
                        <Table>
                            <TableBody>
                                {row_data === null && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            style={{ textAlign: 'center' }}
                                        >
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {row_data != null && Object.keys(row_data)
                                    .filter(function (k) { return k !== 'url';})
                                    .map((k) =>
                                    <TableRow key={k}>
                                        <TableCell>{k.toUpperCase()}</TableCell>
                                        <TableCell>{row_data[k]}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DialogContent>
                </Dialog>

            </Paper>
        )
    };

    render() {
        const { authUserInfo } = this.props;

        return (
            <Fragment>
                {authUserInfo != null ? this.renderHomeView() : this.renderPublicLanding()}
            </Fragment>
        );
    }
}

Home.proTypes = {
    authUserInfo: PropTypes.object.isRequired,
    handleStartRunningHomeQuery: PropTypes.func.isRequired,
    handleHomeQueryParamsUpdate: PropTypes.func.isRequired,
    homeParams: PropTypes.object.isRequired,
    homeResult: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        authUserInfo: state.authUserInfo,
        homeParams: state.homeParams,
        homeResult: state.homeResult,
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        handleHomeQueryParamsUpdate: async params => {
            dispatch(updateHomeQueryPrams(params));
        },
        handleStartRunningHomeQuery: async params => {
            dispatch(startRunningHomeQuery(params));
        },
        handleClearErrorMessage: () => {
            dispatch(clearErrorMessage());
        },
    };
};

const ConnectHome = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Home);

export default withStyles(styles)(ConnectHome);
