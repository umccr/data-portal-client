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

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
});

class Home extends Component {
    state = {
        data: {},
        filePath: '',
        fileExtension: '',
        searchRunning: false,
        tableInit: false,
        order: 'asc',
        orderBy: null,
        rowsPerPage: 20,
        errorMessage: null,
    };

    reloadData = async (extraParams = {}) => {
        this.setState({ searchRunning: true });

        if (this.state.fileExtension) {
            extraParams.fileExtension = this.state.fileExtension;
        }

        try {
            const extraParamsString = Object.keys(extraParams)
                .map(key => `&${key}=${extraParams[key]}`)
                .join('');
            const data = await API.get(
                'tables',
                `/tables?filePath=${this.state.filePath}${extraParamsString}`,
                {},
            );
            this.setState({
                data: data,
                tableInit: true,
            });
            this.setState({ errorMessage: 'aa' });
        } catch (e) {
            this.setState({ errorMessage: e });
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

        if (orderBy !== null) {
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

        this.setState({ errorMessage: null });
    };

    renderErrorMessage = message => (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            open={this.state.errorMessage}
            autoHideDuration={6000}
            onClose={this.handleCloseErrorMessage}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={message}
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

    renderTable = () => {
        const { order, orderBy, data, errorMessage } = this.state;
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
                                    colSpan={dataRows.length}
                                    style={{ textAlign: 'center' }}
                                >
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        )}
                        {!this.state.searchRunning &&
                            dataRows.map((row, index) => (
                                <TableRow>
                                    {row.map(col => (
                                        <TableCell key={index}>{col}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
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
                {this.renderErrorMessage(errorMessage)}
            </Paper>
        );
    };

    handleFilePathQueryChange = e => {
        this.setState({
            filePath: e.target.value,
            page: 0,
        });
    };

    handleFileExtensionQueryChange = e => {
        this.setState({
            fileExtension: e.target.value,
            page: 0,
        });
    };

    render() {
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
                    <Grid item sm={12} md={8}>
                        <TextField
                            name="query"
                            label="File Path"
                            placeholder="File Path"
                            margin="normal"
                            variant="filled"
                            fullWidth
                            value={this.state.filePath}
                            onChange={this.handleFilePathQueryChange}
                        />
                    </Grid>
                    <Grid item sm={6} md={2}>
                        <TextField
                            name="query"
                            label="File Extension"
                            placeholder="File Extension"
                            margin="normal"
                            variant="filled"
                            fullWidth
                            value={this.state.fileExtension}
                            onChange={this.handleFileExtensionQueryChange}
                        />
                    </Grid>
                    <Grid item sm={6} md={1}>
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
            </form>
        );
    }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
