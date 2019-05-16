import Grid from '@material-ui/core/Grid';
import { Button, withStyles } from '@material-ui/core';
import React, { Component, Fragment } from 'react';
import { API } from 'aws-amplify';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import TablePagination from '@material-ui/core/TablePagination';
import TableFooter from '@material-ui/core/TableFooter';
import { TablePaginationActionsWrapped } from '../components/TablePagniationActionsWrapped';
import EnhancedTableHead from '../components/EnhancedTableHead';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import * as PropTypes from 'prop-types';
import GetAppIcon from '@material-ui/icons/GetApp';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import {
    startRunningSearchQuery,
    updateSearchQueryPrams,
} from '../actions/search';

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
    searchHintContainer: {
        padding: theme.spacing.unit,
    },
});

class Search extends Component {
    state = {
        headerRow: null,
        openSnackbar: false,
        openSearchHint: false,
    };

    reloadData = async (params = {}) => {
        const { handleStartRunningSearchQuery } = this.props;

        // First submit our search query
        await handleStartRunningSearchQuery(params);

        const { searchResult } = this.props;

        // If have received an error message, display it on snackbar.
        if (searchResult.errorMessage) {
            this.setState({
                openSnackbar: true,
            });
        }

        // Once we have got a result, we can save a copy of the header row
        this.setState({
            headerRow: {
                ...searchResult.data.headerRow,
            },
        });
    };

    getBaseParams = () => {
        const { rowsPerPage, query } = this.props.search.params;

        return {
            rowsPerPage,
            query,
            ...this.getSortParams(),
        };
    };

    getSortParams = () => {
        const { sortCol, sortAsc } = this.props.search.params;

        return { sortCol, sortAsc };
    };

    handleSearchQueryChange = e => {
        this.props.handleSearchQueryParamsUpdate({
            query: e.target.value,
        });
    };

    handleSearchClicked = async () => {
        const { query } = this.props.search.params;

        await this.reloadData({
            query,
        });
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
            rowsPerPage: event.target.value,
        });
    };

    handleRequestSort = async (event, property) => {
        const sortCol = property;
        const { params } = this.props.search;
        let sortAsc = params.sortCol === property && params.sortAsc === 'desc';

        await this.reloadData({
            sortAsc,
            sortCol,
            query: params.query,
        });
    };

    handleCloseErrorMessage = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ openSnackbar: false });
    };

    renderErrorMessage = () => {
        const { errorMessage } = this.props.searchResult;

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.state.openSnackbar}
                autoHideDuration={6000}
                onClose={this.handleCloseErrorMessage}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span>{errorMessage}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        className={this.props.classes.close}
                        onClick={this.handleCloseErrorMessage}
                    >
                        <CloseIcon />
                    </IconButton>,
                ]}
            />
        );
    };

    handleDownloadFile = async (bucket, key) => {
        try {
            const url = await API.get(
                'files',
                `/file-signed-url?bucket=${bucket}&key=${key}`,
                {},
            );

            window.open(url, '_blank');
        } catch (e) {
            this.setState({ errorMessage: e });
        }
    };

    renderRow = (headers, row, rowIndex) => (
        <TableRow key={rowIndex}>
            {row.map((col, colIndex) => {
                const bucket = row[headers.findIndex(h => h.key === 'bucket')];
                return (
                    <TableCell key={colIndex}>
                        {col}
                        {headers[colIndex].key === 'key' && (
                            <Button
                                color="primary"
                                onClick={() =>
                                    this.handleDownloadFile(bucket, col)
                                }
                            >
                                <GetAppIcon />
                            </Button>
                        )}
                    </TableCell>
                );
            })}
        </TableRow>
    );

    renderTable = () => {
        const { sortAsc, sortCol } = this.props.searchParams;
        const { data, loading } = this.props.searchResult;
        const { rows, meta } = data;

        const headerRow = rows.headerRow;
        const dataRows = rows.dataRows;

        return (
            <Paper>
                <Table>
                    <EnhancedTableHead
                        columns={headerRow}
                        onRequestSort={this.handleRequestSort}
                        order={sortAsc ? 'asc' : 'desc'}
                        orderBy={sortCol}
                    />
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell
                                    colSpan={headerRow.length}
                                    style={{ textAlign: 'center' }}
                                >
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && dataRows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={headerRow.length}
                                    style={{ textAlign: 'center' }}
                                >
                                    No record found
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            dataRows.map((row, rowIndex) => {
                                return this.renderRow(headerRow, row, rowIndex);
                            })}
                    </TableBody>
                    {!loading && (
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[20, 50]}
                                    colSpan={3}
                                    count={meta.totalRows}
                                    rowsPerPage={meta.size}
                                    page={meta.page - 1}
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
            </Paper>
        );
    };

    handleSearchQuerySyntaxClick = event => {
        const { currentTarget } = event;
        this.setState(state => ({
            searchHintAnchorEl: currentTarget,
            openSearchHint: !state.openSearchHint,
        }));
    };

    render() {
        const { classes, searchParams, searchResult } = this.props;
        const { openSearchHint } = this.state;
        const searchHintPopperId = openSearchHint ? 'popper-search-hint' : null;

        return (
            <Fragment>
                {/*<Grid*/}
                {/*    container*/}
                {/*    item*/}
                {/*    xs={12}*/}
                {/*    direction="row"*/}
                {/*    alignItems="center"*/}
                {/*    spacing={16}*/}
                {/*>*/}
                {/*    <Grid item container sm={12}>*/}
                {/*        <TextField*/}
                {/*            name="query"*/}
                {/*            label="Search"*/}
                {/*            placeholder="Type in search query"*/}
                {/*            margin="normal"*/}
                {/*            variant="filled"*/}
                {/*            fullWidth*/}
                {/*            value={searchParams.query}*/}
                {/*            onChange={this.handleSearchQueryChange}*/}
                {/*            InputProps={{*/}
                {/*                endAdornment: this.renderQuerySyntaxButton(),*/}
                {/*            }}*/}
                {/*            onKeyPress={e =>*/}
                {/*                e.key === 'Enter' && this.handleSearchClicked()*/}
                {/*            }*/}
                {/*        />*/}
                {/*    </Grid>*/}
                {/*</Grid>*/}
                <Paper>
                    {searchResult.loading && !this.state.tableInit && (
                        <LinearProgress />
                    )}
                    {searchResult.data.rows && this.renderTable()}
                </Paper>
                <Popper
                    id={searchHintPopperId}
                    open={this.state.openSearchHint}
                    anchorEl={this.state.searchHintAnchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transition
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={350}>
                            <Paper>
                                <Grid
                                    container
                                    className={classes.searchHintContainer}
                                    direction="column"
                                >
                                    <Typography variant="subheading">
                                        Search Query Syntax
                                    </Typography>
                                    <Typography>
                                        [file path includes] // default filter{' '}
                                        <br />
                                        pathinc:[file path includes] // specify
                                        a filter - pathinc <br />
                                        ext:[file extension] // e.g. ext:csv
                                        <br />
                                        date:[operator][last modified date] //
                                        e.g. date:>2011-01-01 <br />
                                        size:[operator][file size]
                                    </Typography>
                                    <Grid container sm={12} justify="flex-end">
                                        <Button
                                            color="default"
                                            size="small"
                                            onClick={
                                                this
                                                    .handleSearchQuerySyntaxClick
                                            }
                                        >
                                            Okay
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
                {this.renderErrorMessage()}
            </Fragment>
        );
    }
}

Search.propTypes = {
    classes: PropTypes.object.isRequired,
    authUserInfo: PropTypes.object,
    handleStartRunningSearchQuery: PropTypes.func.isRequired,
    handleSearchQueryParamsUpdate: PropTypes.func.isRequired,
    searchParams: PropTypes.object.isRequired,
    searchResult: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        authUserInfo: state.authUserInfo,
        searchParams: state.searchParams,
        searchResult: state.searchResult,
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        handleSearchQueryParamsUpdate: async params => {
            dispatch(updateSearchQueryPrams(params));
        },
        handleStartRunningSearchQuery: async params => {
            dispatch(startRunningSearchQuery(params));
        },
    };
};

const ConnectSearch = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Search);

export default withStyles(styles)(ConnectSearch);
