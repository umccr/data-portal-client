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
import { connect } from 'react-redux';
import {
    beforeRunningSearchQuery,
    startRunningSearchQuery,
    updateSearchQueryPrams,
} from '../actions/search';
import { withRouter } from 'react-router-dom';

const drawerWidth = 240;

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
});

class AppBar extends Component {
    state = {
        userMenuOpen: false,
    };

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

    handleSearchQueryChange = e => {
        this.props.handleSearchQueryParamsUpdate({
            query: e.target.value,
            page: 0,
        });
    };

    handleSearchClicked = async e => {
        const {
            handleBeforeRunningSearchQuery,
            handleStartRunningSearchQuery,
            searchParams,
            history,
        } = this.props;

        // First mark we have started searching
        await handleBeforeRunningSearchQuery(searchParams);

        // Start searching asynchronously (which allows us to jump to next action)
        handleStartRunningSearchQuery(searchParams);

        // Go to search result page and wait for search running there
        history.push('/search');
    };

    render() {
        const {
            title,
            classes,
            authUserInfo,
            handleDrawerToggle,
            searchParams,
        } = this.props;
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
                        {authUserInfo && (
                            <div className={classes.search}>
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
                                    onChange={this.handleSearchQueryChange}
                                    onKeyPress={e =>
                                        e.key === 'Enter' &&
                                        this.handleSearchClicked(e)
                                    }
                                />
                            </div>
                        )}
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
