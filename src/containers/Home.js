import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {Button} from "@material-ui/core";
import React, { Component } from "react";
import {API} from "aws-amplify";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import LinearProgress from "@material-ui/core/LinearProgress";
import TablePagination from "@material-ui/core/TablePagination";
import TableFooter from "@material-ui/core/TableFooter";
import {TablePaginationActionsWrapped} from "../components/TablePagniationActionsWrapped";

class Home extends Component {
    state = {
        data: {},
        queryString: '',
        searchRunning: false,
    };

    async componentDidMount() {

    }

    onSearchClicked = async () => {
        this.setState({searchRunning: true});

        try {
            const data = await API.get("tables", `/tables?query=${this.state.queryString}`, {});
            this.setState({ data: data });
        } catch (e) {
            alert(e);
        }

        this.setState({searchRunning: false});
    };

    onPageChange = async (event, page) => {
        this.setState({searchRunning: true});

        try {
            const data = await API.get("tables", `/tables?query=${this.state.queryString}&page=${page}`, {});
            this.setState({ data: data });
        } catch (e) {
            alert(e);
        }

        this.setState({searchRunning: false});
    };

    renderTable = () => {
        const headerRow = this.state.data.rows.headerRow;
        const dataRows = this.state.data.rows.dataRows;
        const metaData = this.state.data.meta;

        return (
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            { headerRow.map(col => (
                                <TableCell>
                                    {col}
                                </TableCell>
                            )) }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { dataRows.map(row => (
                            <TableRow>
                                { row.map(col => (
                                    <TableCell>
                                        {col}
                                    </TableCell>
                                )) }
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[metaData.size]}
                                colSpan={3}
                                count={metaData.totalRows}
                                rowsPerPage={metaData.size}
                                page={metaData.page - 1}
                                SelectProps={{
                                    native: true,
                                }}
                                onChangePage={this.onPageChange}
                                // onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActionsWrapped}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </Paper>
        )
    };

    onFilenameQueryChange = e => {
        this.setState({
            queryString: e.target.value,
            page: 0
        })
    };

    render() {
        return (
            <form>
                <Grid container xs={12} direction="row" alignItems="center">
                <TextField
                    name="query"
                    placeholder="Search"
                    margin="normal"
                    variant="outlined"
                    value={this.state.queryString}
                    onChange={this.onFilenameQueryChange}
                />
                <Button onClick={this.onSearchClicked}>
                Search
                </Button>
                </Grid>
                <Paper>
                    { this.state.searchRunning && ( <LinearProgress /> ) }
                    { this.state.data.rows && this.renderTable()}
                </Paper>
            </form>
        )
    }
}

export default Home;