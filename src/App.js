import React, { Component, Fragment } from 'react';
import * as PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import HomeIcon from '@material-ui/icons/Home';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import MenuIcon from '@material-ui/icons/Menu';
import InputIcon from '@material-ui/icons/Input';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Routes from './Routes';
import { Link as RouterLink, Route, Switch } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { Auth, Hub } from 'aws-amplify';
import { withOAuth } from 'aws-amplify-react';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import authUpdate from './actions/auth';
import Home from './containers/Home';
import Login from './containers/Login';
import Search from './containers/Search';

const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
        },
    },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
    },
    button: {
        margin: theme.spacing.unit,
    },
    buttonIcon: {
        margin: theme.spacing.unit,
    },
});

class App extends Component {
    constructor(props) {
        super(props);

        this.signOut = this.signOut.bind(this);

        this.state = {
            mobileOpen: false,
            userMenuOpen: false,
        };
    }

    async componentDidMount() {
        const { handleAuthUpdate } = this.props;

        Hub.listen('auth', async ({ payload: { event, data } }) => {
            switch (event) {
                case 'signIn':
                    const userInfo = await Auth.currentUserInfo();
                    handleAuthUpdate({
                        authState: 'signedIn',
                        authUser: data,
                        authUserInfo: userInfo,
                    });
                    break;
                case 'signIn_failure':
                    handleAuthUpdate({
                        authState: 'signIn',
                        authUser: null,
                        authUserInfo: null,
                        authError: data,
                    });
                    break;
                case 'signOut':
                    handleAuthUpdate({
                        authState: 'signedOut',
                        authUser: null,
                        authUserInfo: null,
                    });
                    break;
                default:
                //
            }
        });

        try {
            const user = await Auth.currentAuthenticatedUser();
            const userInfo = await Auth.currentUserInfo();
            handleAuthUpdate({
                authState: 'signedIn',
                authUser: user,
                authUserInfo: userInfo,
            });
        } catch (e) {
            console.log('not logged in');
        }
    }

    async signOut() {
        try {
            await Auth.signOut();
            this.setState({ authState: 'signIn' });
        } catch (e) {
            console.log(e);
        }
    }

    handleDrawerToggle = () => {
        this.setState(state => ({ mobileOpen: !state.mobileOpen }));
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
        await this.signOut();
    };

    renderUserButton = () => {
        const { classes, authUserInfo } = this.props;
        const { userMenuOpen } = this.state;

        return (
            <Fragment>
                {authUserInfo === null && (
                    <Button color="inherit" onClick={this.props.OAuthSignIn}>
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
                            <AccountCircleIcon classes={classes.buttonIcon} />
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

    renderDrawerContent = () => {
        const { classes, authUser } = this.props;

        return (
            <Fragment>
                <div className={classes.toolbar}>
                    <Grid
                        container
                        item
                        xs={12}
                        direction="row"
                        justify="center"
                        alignItems="center"
                        style={{ height: '100%' }}
                    >
                        <Typography variant="title">
                            UMCCR Data Portal
                        </Typography>
                    </Grid>
                </div>
                <Divider />
                <List>
                    <ListItem button component={RouterLink} to="/">
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItem>
                    {authUser && (
                        <ListItem button component={RouterLink} to="/search">
                            <ListItemIcon>
                                <SearchIcon />
                            </ListItemIcon>
                            <ListItemText primary="Search" />
                        </ListItem>
                    )}
                </List>
            </Fragment>
        );
    };

    render() {
        const { classes, theme, authUserInfo } = this.props;

        const { userMenuOpen } = this.state;

        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={this.handleDrawerToggle}
                            className={classes.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            color="inherit"
                            className={classes.grow}
                        >
                            <Switch>
                                <Route path="/" exact>
                                    Home
                                </Route>
                                <Route path="/login">Login</Route>
                                <Route path="/search">Search</Route>
                            </Switch>
                        </Typography>
                        {this.renderUserButton(classes, authUserInfo)}
                        {this.renderUserMenu(classes, userMenuOpen)}
                    </Toolbar>
                </AppBar>
                <nav className={classes.drawer}>
                    <Hidden smUp implementation="css">
                        <Drawer
                            container={this.props.container}
                            variant="temporary"
                            anchor={
                                theme.direction === 'rtl' ? 'right' : 'left'
                            }
                            open={this.state.mobileOpen}
                            onClose={this.handleDrawerToggle}
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                        >
                            {this.renderDrawerContent(classes)}
                        </Drawer>
                    </Hidden>
                    <Hidden xsDown implementation="css">
                        <Drawer
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            variant="permanent"
                            open
                        >
                            {this.renderDrawerContent(classes)}
                        </Drawer>
                    </Hidden>
                </nav>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Switch>
                        <Routes />
                    </Switch>{' '}
                </main>
            </div>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    handleAuthUpdate: PropTypes.func.isRequired,
    authUser: PropTypes.object,
    authUserInfo: PropTypes.object,
    authState: PropTypes.string.isRequired,
    authError: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
    return {
        authUser: state.authUser,
        authUserInfo: state.authUserInfo,
        authState: state.authState,
        authError: state.authError,
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        handleAuthUpdate: auth => {
            dispatch(authUpdate(auth));
        },
    };
};

const ReduxApp = connect(
    mapStateToProps,
    mapDispatchToProps,
)(App);

export default withStyles(styles, { withTheme: true })(withOAuth(ReduxApp));
