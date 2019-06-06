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
import EnhancedTableHead, {
    isColVisible,
} from '../components/EnhancedTableHead';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import * as PropTypes from 'prop-types';
import GetAppIcon from '@material-ui/icons/GetApp';
import { connect } from 'react-redux';
import {
    startRunningSearchQuery,
    updateSearchQueryPrams,
} from '../actions/search';

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
});

class Search extends Component {
    state = {
        hideSnackbar: false,
    };

    reloadData = async (params = {}) => {
        const { handleStartRunningSearchQuery } = this.props;

        // First submit our search query
        await handleStartRunningSearchQuery(params);
    };

    getBaseParams = () => {
        return this.props.searchParams;
    };

    handleSearchQueryChange = e => {
        this.props.handleSearchQueryParamsUpdate({
            query: e.target.value,
        });
    };

    handleSearchClicked = async () => {
        const { query } = this.props.searchParams;

        await this.reloadData({
            query, // Keep query only (starting new search)
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
            page: 0, // Reset page number if rows per page change
            rowsPerPage: event.target.value,
        });
    };

    handleRequestSort = async (event, property) => {
        const sortCol = property;
        const { searchParams } = this.props;
        let sortAsc = searchParams.sortCol === sortCol && !searchParams.sortAsc;

        // Reset all other search params except query
        await this.reloadData({
            sortAsc,
            sortCol,
            query: searchParams.query,
        });
    };

    handleCloseErrorMessage = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ hideSnackbar: true });
    };

    // Show snackbar if we have an error message and it has not been hidden
    openSnackbar = () =>
        this.props.searchResult.errorMessage && !this.state.hideSnackbar;

    renderErrorMessage = () => {
        const { errorMessage } = this.props.searchResult;

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.openSnackbar()}
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
                const key = row[headers.findIndex(h => h.key === 'key')];
                return (
                    isColVisible(headers[colIndex].key) && (
                        <TableCell key={colIndex}>
                            {col}
                            {headers[colIndex].key === 'path' && (
                                <Button
                                    color="primary"
                                    onClick={() =>
                                        this.handleDownloadFile(bucket, key)
                                    }
                                >
                                    <GetAppIcon />
                                </Button>
                            )}
                        </TableCell>
                    )
                );
            })}
        </TableRow>
    );

    renderTable = () => {
        const { searchResultHeaderRow } = this.props;
        const { sortAsc, sortCol } = this.props.searchParams;
        const { data, loading } = this.props.searchResult;
        const { rows, meta } = data;

        const dataRows = rows ? rows.dataRows : [];
        const headerRow = searchResultHeaderRow;

        return (
            <Paper>
                <Table>
                    <EnhancedTableHead
                        columns={headerRow}
                        onRequestSort={this.handleRequestSort}
                        order={sortAsc ? 'asc' : 'desc'}
                        orderBy={sortCol === null ? '' : sortCol}
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
                    {!loading && meta !== null && (
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

    render() {
        const { searchResult, searchResultHeaderRow } = this.props;

        const { loading, data } = searchResult;
        const tableInit = searchResultHeaderRow !== null;

        return (
            <Fragment>
                <Paper>
                    {loading && !tableInit && <LinearProgress />}
                    {(data.rows || tableInit) && this.renderTable()}
                </Paper>

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
    searchResultHeaderRow: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => {
    return {
        authUserInfo: state.authUserInfo,
        searchParams: state.searchParams,
        searchResult: state.searchResult,
        searchResultHeaderRow: state.searchResultHeaderRow,
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
