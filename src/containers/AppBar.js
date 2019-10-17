import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core';
import DefaultAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import React, { Component, Fragment } from 'react';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import * as PropTypes from 'prop-types';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import InputIcon from '@material-ui/icons/Input';
import HelpIcon from '@material-ui/icons/Help';
import { connect } from 'react-redux';
import {
    beforeRunningSearchQuery,
    startRunningSearchQuery,
    updateSearchQueryPrams,
} from '../actions/search';
import { withRouter } from 'react-router-dom';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import queryString from 'query-string';

const drawerWidth = 240;

const querySyntax = [
    {
        syntax: '[string]',
        description: 'Default filter, equivalent to pathinc.',
    },
    {
        syntax: 'pathinc:[string]',
        description: 'File path (includes). e.g. pathinc:umccrised',
    },
    {
        syntax: 'ext:[string]',
        description: 'File extension. e.g. ext:csv',
    },
    {
        syntax: 'date:[comparator][date]',
        description: 'Last modified date. e.g. date:>2019-04-01',
    },
    {
        syntax: 'size:[comparator][integer]',
        description: 'File size. e.g. size:>=1000',
    },
    {
        syntax: 'subjectid:[string]',
        description: '(LIMS) SubjectID or ExternalSubjectId includes',
    },
    {
        syntax: 'sampleid:[string]',
        description: '(LIMS) SampleId includes',
    },
    {
        syntax: 'case:[boolean]',
        description:
            'Case sensitivity (for string comparisons, default to false). e.g. case:true',
    },
];

const styles = theme => ({
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
        },
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        marginRight: 20,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing.unit,
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing.unit * 9,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 10,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 120,
            '&:focus': {
                width: 200,
            },
        },
    },
    buttonIcon: {
        margin: theme.spacing.unit,
    },
    searchHintContainer: {
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    searchHintTitle: {
        marginTop: 2 * theme.spacing.unit,
        marginLeft: 2 * theme.spacing.unit,
    },
    searchHintButton: {
        marginTop: theme.spacing.unit,
    },
    searchHintTable: {
        maxWidth: 700,
    },
});

class AppBar extends Component {
    state = {
        userMenuOpen: false,
        openSearchHint: false,
    };

    async componentDidMount() {
        // Check whether we have query parameter,
        // if there is, trigger a search action
        if (this.props.location.pathname === '/search') {
            const values = queryString.parse(this.props.location.search);

            if (values.query) {
                const searchParams = { query: values.query };

                if (values.sortAsc !== undefined) {
                    searchParams.sortAsc = values.sortAsc === 'true';
                }

                if (values.sortCol) {
                    searchParams.sortCol = values.sortCol;
                }

                if (values.page !== undefined) {
                    searchParams.page = values.page;
                } else {
                    searchParams.page = 0;
                }

                if (values.rowsPerPage !== undefined) {
                    searchParams.rowsPerPage = values.rowsPerPage;
                } else {
                    searchParams.rowsPerPage = 20;
                }

                const { handleStartRunningSearchQuery } = this.props;

                await handleStartRunningSearchQuery(searchParams);
            }
        }
    }

    handleToggleUserMenu = () => {
        this.setState(state => ({ userMenuOpen: !state.userMenuOpen }));
    };

    handleCloseUserMenu = event => {
        if (this.anchorEl.contains(event.target)) {
            return;
        }

        this.setState({ userMenuOpen: false });
    };

    handleLogOutClicked = async event => {
        this.handleCloseUserMenu(event);
        this.props.handleSignOut();
    };

    renderUserButton = () => {
        const { classes, authUserInfo, handleSignIn } = this.props;
        const { userMenuOpen } = this.state;

        return (
            <Fragment>
                {authUserInfo === null && (
                    <Button color="inherit" onClick={handleSignIn}>
                        <InputIcon className={classes.buttonIcon} />
                        Login
                    </Button>
                )}
                {authUserInfo !== null && (
                    <Fragment>
                        <Button
                            color="inherit"
                            buttonRef={node => {
                                this.anchorEl = node;
                            }}
                            aria-owns={
                                userMenuOpen ? 'menu-list-grow' : undefined
                            }
                            aria-haspopup="true"
                            onClick={this.handleToggleUserMenu}
                        >
                            <AccountCircleIcon className={classes.buttonIcon} />
                            {authUserInfo.attributes.email}
                        </Button>
                    </Fragment>
                )}
            </Fragment>
        );
    };

    renderUserMenu = () => {
        const { userMenuOpen } = this.state;

        return (
            <Popper
                open={userMenuOpen}
                anchorEl={this.anchorEl}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        id="menu-list-grow"
                        style={{
                            transformOrigin:
                                placement === 'bottom'
                                    ? 'center top'
                                    : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener
                                onClickAway={this.handleCloseUserMenu}
                            >
                                <MenuList>
                                    <MenuItem
                                        onClick={this.handleLogOutClicked}
                                    >
                                        Logout
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        );
    };

    handleSearchQueryChange = async newQuery => {
        await this.props.handleSearchQueryParamsUpdate({
            query: newQuery,
            page: 0,
        });
    };

    handleSearchQuerySyntaxClick = event => {
        const { currentTarget } = event;
        this.setState(state => ({
            searchHintAnchorEl: currentTarget,
            openSearchHint: !state.openSearchHint,
        }));
    };

    handleSearchClicked = async () => {
        const {
            handleStartRunningSearchQuery,
            searchParams,
            history
        } = this.props;

        history.push('/search');

        // Start searching asynchronously (which allows us to jump to next action)
        handleStartRunningSearchQuery(searchParams);
    };

    renderSearchBox = () => {
        const { classes, searchParams } = this.props;

        return (
            <div className={classes.search}>
                {this.renderSearchHint()}
                <div className={classes.searchIcon}>
                    <SearchIcon />
                </div>
                <InputBase
                    placeholder="Search…"
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    value={searchParams.query}
                    onChange={(e) => this.handleSearchQueryChange(e.target.value)}
                    onKeyPress={e =>
                        e.key === 'Enter' && this.handleSearchClicked()
                    }
                    endAdornment={
                        <div>
                            <IconButton
                                style={{ color: 'white' }}
                                onClick={this.handleSearchQuerySyntaxClick}
                            >
                                <HelpIcon />
                            </IconButton>
                        </div>
                    }
                />
            </div>
        );
    };

    renderSearchHintTable = () => {
        const { classes } = this.props;
        return (
            <Table size="small" className={classes.searchHintTable}>
                <TableHead>
                    <TableRow>
                        <TableCell>Tag Syntax</TableCell>
                        <TableCell>Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {querySyntax.map(s => (
                        <TableRow>
                            <TableCell>{s.syntax}</TableCell>
                            <TableCell>{s.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    renderSearchHint = () => {
        const { classes } = this.props;
        const { openSearchHint } = this.state;
        const searchHintPopperId = openSearchHint ? 'popper-search-hint' : null;

        return (
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
                                <Typography
                                    variant="subheading"
                                    className={classes.searchHintTitle}
                                >
                                    Search Query Syntax
                                </Typography>
                                {this.renderSearchHintTable()}

                                <Grid
                                    container
                                    sm={12}
                                    justify="flex-end"
                                    className={classes.searchHintButton}
                                >
                                    <Button
                                        color="default"
                                        size="small"
                                        onClick={
                                            this.handleSearchQuerySyntaxClick
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
        );
    };

    /**
     * Flags whether we are on storage page
     * @returns {boolean}
     */
    notOnStoragePage = () => {
        return this.props.location.pathname !== '/storage';
    };

    render() {
        const { title, classes, authUserInfo, handleDrawerToggle } = this.props;
        const { userMenuOpen } = this.state;

        return (
            <Fragment>
                <DefaultAppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={handleDrawerToggle}
                            className={classes.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit">
                            {title}
                        </Typography>
                        <div className={classes.grow} />
                        {authUserInfo && this.notOnStoragePage() && this.renderSearchBox()}
                        {this.renderUserButton(classes, authUserInfo)}
                        {this.renderUserMenu(classes, userMenuOpen)}
                    </Toolbar>
                </DefaultAppBar>
            </Fragment>
        );
    }
}

AppBar.defaultProps = {
    authUserInfo: null,
};

AppBar.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    title: PropTypes.node.isRequired,
    authUserInfo: PropTypes.object,
    handleDrawerToggle: PropTypes.func.isRequired,
    handleBeforeRunningSearchQuery: PropTypes.func.isRequired,
    handleStartRunningSearchQuery: PropTypes.func.isRequired,
    handleSearchQueryParamsUpdate: PropTypes.func.isRequired,
    handleSignOut: PropTypes.func.isRequired,
    handleSignIn: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        searchParams: state.searchParams,
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        handleBeforeRunningSearchQuery: params => {
            dispatch(beforeRunningSearchQuery(params));
        },
        handleStartRunningSearchQuery: params => {
            dispatch(startRunningSearchQuery(params));
        },
        handleSearchQueryParamsUpdate: params => {
            dispatch(updateSearchQueryPrams(params));
        },
    };
};

const ConnectedAppBar = connect(
    mapStateToProps,
    mapDispatchToProps,
)(AppBar);

export default withRouter(
    withStyles(styles, { withTheme: true })(ConnectedAppBar),
);
