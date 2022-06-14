// FIXME this file is to be deleted at some point
//  place holder here for v2 impl reference

import React, { Component, Fragment } from 'react';
import ReactGA from 'react-ga';
import * as PropTypes from 'prop-types';
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
import Routes from './Routes';
import { Link as RouterLink, Route, Switch } from 'react-router-dom';
import { Auth, Hub } from 'aws-amplify';
import { withOAuth } from 'aws-amplify-react';
import { connect } from 'react-redux';
import authUpdate from './actions/auth';
import AppBar from './containers/AppBar';
import StorageIcon from '@material-ui/icons/Storage';
import SearchIcon from '@material-ui/icons/Search';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './primeod.css';
import LandingPage from './containers/LandingPage';
import AssessmentIcon from '@material-ui/icons/Assessment';
import PolicyIcon from '@material-ui/icons/Policy';
import LaunchIcon from '@material-ui/icons/Launch';

const isProd = process.env.REACT_APP_STAGE === 'prod' ? true : false;
const umccrDomain = isProd ? '.umccr.org' : '.dev.umccr.org';

const drawerWidth = 240;

const styles = (theme) => ({
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
  toolbar: {
    minHeight: '48px',
    // ...theme.mixins.toolbar,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(1),
  },
  buttonIcon: {
    margin: theme.spacing(1),
  },
});

// Google Analytics
ReactGA.initialize('UA-134504725-2');
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
        case 'signIn': {
          const userInfo = await Auth.currentUserInfo();
          handleAuthUpdate({
            authState: 'signedIn',
            authUser: data,
            authUserInfo: userInfo,
          });
          break;
        }
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

  handleDrawerToggle = () => {
    this.setState((state) => ({ mobileOpen: !state.mobileOpen }));
  };

  async signOut() {
    try {
      await Auth.signOut();
      this.setState({ authState: 'signIn' });
    } catch (e) {
      console.log(e);
    }
  }

  handleSignOut = async () => {
    await this.signOut();
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
            direction='row'
            justifyContent='center'
            alignItems='center'
            style={{ height: '100%' }}>
            <Typography variant='h6'>UMCCR Data Portal</Typography>
          </Grid>
        </div>
        <Divider />
        <List>
          {authUser && (
            <Fragment>
              <ListItem button component={RouterLink} to='/'>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary='LIMS' />
              </ListItem>
              <ListItem button component={RouterLink} to='/igv'>
                <ListItemIcon>
                  <img src={'/igv.png'} alt='igv.png' width='24px' height='24px' />
                </ListItemIcon>
                <ListItemText primary='Genomics Viewer' />
              </ListItem>
              <ListItem button component={RouterLink} to='/search'>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary='Global Search' />
              </ListItem>
              <ListItem button component={RouterLink} to='/storage'>
                <ListItemIcon>
                  <StorageIcon />
                </ListItemIcon>
                <ListItemText primary='Storage Stat' />
              </ListItem>
              <ListItem
                button
                onClick={() => window.open(`https://status.data${umccrDomain}`, '_blank')}>
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText primary='Status Page' />
                <ListItemIcon>
                  <LaunchIcon style={{ fontSize: '1rem' }} />
                </ListItemIcon>
              </ListItem>
              <ListItem
                button
                onClick={() =>
                  window.open(`https://sscheck${umccrDomain}/sample-sheet-checker`, '_blank')
                }>
                <ListItemIcon>
                  <PolicyIcon />
                </ListItemIcon>
                <ListItemText primary='Sample Sheet Check' />
                <ListItemIcon>
                  <LaunchIcon style={{ fontSize: '1rem' }} />
                </ListItemIcon>
              </ListItem>
            </Fragment>
          )}
        </List>
      </Fragment>
    );
  };

  renderMainLayout() {
    const { classes, theme, authUserInfo } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          authUserInfo={authUserInfo}
          handleLogOutClicked={this.handleLogOutClicked}
          handleDrawerToggle={this.handleDrawerToggle}
          handleSignIn={() => Auth.federatedSignIn({ provider: 'Google' })}
          handleSignOut={this.handleSignOut}
          title={
            <Switch>
              <Route path='/' exact>
                Home
              </Route>
              <Route path='/login'>Login</Route>
              <Route path='/subjects'>Subject</Route>
              <Route path='/runs'>Run</Route>
              <Route path='/search'>Search</Route>
              <Route path='/storage'>Storage</Route>
              <Route path='/igv'>IGV</Route>
            </Switch>
          }
        />
        <nav className={classes.drawer}>
          <Hidden smUp implementation='css'>
            <Drawer
              container={this.props.container}
              variant='temporary'
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={this.state.mobileOpen}
              onClose={this.handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}>
              {this.renderDrawerContent(classes)}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation='css'>
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant='permanent'
              open>
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

  renderLanding() {
    return <LandingPage handleSignIn={() => Auth.federatedSignIn({ provider: 'Google' })} />;
  }

  render() {
    const { authUser } = this.props;

    return (
      <div>
        {authUser && this.renderMainLayout()}
        {authUser === null && this.renderLanding()}
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
  OAuthSignIn: PropTypes.func,
  container: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    authUser: state.authUser,
    authUserInfo: state.authUserInfo,
    authState: state.authState,
    authError: state.authError,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleAuthUpdate: (auth) => {
      dispatch(authUpdate(auth));
    },
  };
};

const ConnectApp = connect(mapStateToProps, mapDispatchToProps)(App);

export default withStyles(styles, { withTheme: true })(withOAuth(ConnectApp));
