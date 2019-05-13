import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Button, withStyles } from '@material-ui/core';
import React, { Component } from 'react';
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
import Fab from '@material-ui/core/Fab';
import SearchIcon from '@material-ui/icons/Search';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import * as PropTypes from 'prop-types';
import GetAppIcon from '@material-ui/icons/GetApp';
import InfoIcon from '@material-ui/icons/Info';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';

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
        data: {},
        searchQuery: '',
        searchRunning: false,
        tableInit: false,
        order: 'asc',
        orderBy: '',
        rowsPerPage: 20,
        errorMessage: null,
        openSnackbar: false,
    };

    reloadData = async (extraParams = {}) => {
        this.setState({ searchRunning: true });

        try {
            const extraParamsString = Object.keys(extraParams)
                .map(key => `&${key}=${extraParams[key]}`)
                .join('');
            const data = await API.get(
                'files',
                `/files?query=${this.state.searchQuery}${extraParamsString}`,
                {},
            );
            this.setState({
                data: data,
                tableInit: true,
            });
        } catch (e) {
            let errorMessage;

            if (e.response) {
                errorMessage = e.response.data.errors;
            } else {
                errorMessage = e.message;
            }

            console.log(errorMessage);
            this.setState({
                errorMessage: `Query failed: ${errorMessage}`,
                openSnackbar: true,
            });
        }

        this.setState({ searchRunning: false });
    };

    getBaseParams = () => {
        return {
            rowsPerPage: this.state.rowsPerPage,
            ...this.getSortParams(),
        };
    };

    getSortParams = () => {
        const { orderBy, order } = this.state;

        if (orderBy) {
            return {
                sortCol: orderBy,
                sortAsc: order === 'asc',
            };
        }

        return {};
    };

    handleSearchClicked = async () => {
        await this.reloadData(this.getBaseParams());
    };

    handlePageChange = async (event, page) => {
        await this.reloadData({
            page: page,
            ...this.getBaseParams(),
        });
    };

    handleRowsPerPageChange = async event => {
        this.setState(
            {
                rowsPerPage: event.target.value,
            },
            async () => {
                await this.reloadData(this.getBaseParams());
            },
        );
    };

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({ order, orderBy }, async () => {
            await this.reloadData(this.getSortParams());
        });
    };

    handleCloseErrorMessage = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ errorMessage: null, openSnackbar: false });
    };

    renderErrorMessage = () => (
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
            message={<span>{this.state.errorMessage}</span>}
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
        const { order, orderBy, data } = this.state;
        const headerRow = data.rows.headerRow;
        const dataRows = data.rows.dataRows;
        const metaData = data.meta;

        return (
            <Paper>
                <Table>
                    <EnhancedTableHead
                        columns={headerRow}
                        onRequestSort={this.handleRequestSort}
                        order={order}
                        orderBy={orderBy}
                    />
                    <TableBody>
                        {this.state.searchRunning && (
                            <TableRow>
                                <TableCell
                                    colSpan={headerRow.length}
                                    style={{ textAlign: 'center' }}
                                >
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        )}
                        {!this.state.searchRunning && dataRows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={headerRow.length}
                                    style={{ textAlign: 'center' }}
                                >
                                    No record found
                                </TableCell>
                            </TableRow>
                        )}
                        {!this.state.searchRunning &&
                            dataRows.map((row, rowIndex) => {
                                return this.renderRow(headerRow, row, rowIndex);
                            })}
                    </TableBody>
                    {!this.state.searchRunning && (
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[20, 50]}
                                    colSpan={3}
                                    count={metaData.totalRows}
                                    rowsPerPage={metaData.size}
                                    page={metaData.page - 1}
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

    renderQuerySyntaxButton = () => {
        const { classes } = this.props;

        return (
            <IconButton color="default" size="small">
                <HelpOutlineIcon
                    size="small"
                    onClick={this.handleSearchQuerySyntaxClick}
                />
            </IconButton>
        );
    };

    handleSearchQueryChange = e => {
        this.setState({
            searchQuery: e.target.value,
            page: 0,
        });
    };

    render() {
        const { classes } = this.props;
        const { openSearchHint } = this.state;
        const searchHintPopperId = openSearchHint ? 'popper-search-hint' : null;

        return (
            <form>
                <Grid
                    container
                    item
                    xs={12}
                    direction="row"
                    alignItems="center"
                    spacing={16}
                >
                    <Grid item container sm={12} md={10}>
                        <TextField
                            name="query"
                            label="Search"
                            placeholder="Type in search query"
                            margin="normal"
                            variant="filled"
                            fullWidth
                            value={this.state.searchQuery}
                            onChange={this.handleSearchQueryChange}
                            InputProps={{
                                endAdornment: this.renderQuerySyntaxButton(),
                            }}
                        />
                    </Grid>
                    <Grid item sm={12} md={2}>
                        <Fab
                            color="primary"
                            size="medium"
                            aria-label="Search"
                            onClick={this.handleSearchClicked}
                        >
                            <SearchIcon />
                        </Fab>
                    </Grid>
                </Grid>
                <Paper>
                    {this.state.searchRunning && !this.state.tableInit && (
                        <LinearProgress />
                    )}
                    {this.state.data.rows && this.renderTable()}
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
            </form>
        );
    }
}

Search.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Search);
