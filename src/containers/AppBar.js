import { alpha } from '@material-ui/core/styles';
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
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Moment from 'react-moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Auth } from 'aws-amplify';

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
    syntax: 'source:[string]',
    description: '(LIMS) source, e.g FFPE, tissue, blood...',
  },
  {
    syntax: 'type:[string]',
    description: '(LIMS) sequencing type, eg: WGS, WTS',
  },
  {
    syntax: 'case:[boolean]',
    description: 'Case sensitivity (for string comparisons, default to false). e.g. case:true',
  },
  {
    syntax: 'linked:[boolean]',
    description: 'Linked with at least one LIMS Row. e.g. linked:true',
  },
];

const styles = (theme) => ({
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
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    marginRight: 20,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(9),
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
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(10),
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
    margin: theme.spacing(1),
  },
  searchHintContainer: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  searchHintTitle: {
    marginTop: 2 * theme.spacing(1),
    marginLeft: 2 * theme.spacing(1),
  },
  searchHintButton: {
    marginTop: theme.spacing(1),
  },
  searchHintTable: {
    maxWidth: 700,
  },
});

class AppBar extends Component {
  state = {
    userMenuOpen: false,
    openSearchHint: false,
    tokeDialogOpened: false,
    copied: false,
    signing: false,
    token: null,
    expires: null,
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

  generateNewToken = async () => {
    const cognitoUser = await Auth.currentAuthenticatedUser();
    const currentSession = cognitoUser.getSignInUserSession();
    cognitoUser.refreshSession(currentSession.getRefreshToken(), (err, session) => {
      const { idToken } = session;
      this.setState({
        token: idToken.getJwtToken(),
        expires: idToken.getExpiration(),
        signing: false,
      });
    });
  };

  handleToggleUserMenu = () => {
    this.setState((state) => ({ userMenuOpen: !state.userMenuOpen }));
  };

  handleCloseUserMenu = (event) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }

    this.setState({ userMenuOpen: false });
  };

  handleLogOutClicked = async (event) => {
    this.handleCloseUserMenu(event);
    this.props.handleSignOut();
  };

  handleTokenClicked = async () => {
    this.setState({
      signing: true,
      tokeDialogOpened: true,
    });

    await this.generateNewToken();
  };

  handleTokenDialogClose = () => {
    this.setState({
      tokeDialogOpened: false,
      signing: false,
      copied: false,
      token: null,
      expires: null,
    });
  };

  renderTokenDialog = () => {
    const { tokeDialogOpened } = this.state;
    return (
      <Dialog
        open={tokeDialogOpened}
        onClose={this.handleTokenDialogClose}
        scroll={'paper'}
        maxWidth={'lg'}>
        <DialogTitle>{'Token'}</DialogTitle>
        <DialogContent>
          {this.state.signing && (
            <div align={'center'}>
              <Typography variant='button' display='block' gutterBottom noWrap>
                Generating, Please wait...
              </Typography>
              <CircularProgress />
            </div>
          )}
          {this.state.token && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Table size={'small'} aria-label={'a dense table'}>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography
                          variant='button'
                          display='block'
                          color={'secondary'}
                          gutterBottom
                          noWrap>
                          Warning: This is your Personal Access Token (PAT). You should not share
                          with any third party.
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant='button' display='block' gutterBottom noWrap>
                          {'EXPIRES IN'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='button' display='block' gutterBottom>
                          <Moment unix>{this.state.expires}</Moment>
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant='button' display='block' gutterBottom>
                          JWT
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' gutterBottom>
                          {this.state.token}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={3}>
                <CopyToClipboard
                  text={this.state.token}
                  onCopy={() => this.setState({ copied: true })}>
                  <Button fullWidth variant='contained' color='primary' onClick={this.onClick}>
                    Copy
                  </Button>
                </CopyToClipboard>
              </Grid>
              {this.state.copied ? (
                <Typography style={{ color: 'red' }} variant='body2' display='block' gutterBottom>
                  Token is copied into the clipboard!
                </Typography>
              ) : null}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  renderUserButton = () => {
    const { classes, authUserInfo, handleSignIn } = this.props;
    const { userMenuOpen } = this.state;

    return (
      <Fragment>
        {authUserInfo === null && (
          <Button color='inherit' onClick={handleSignIn}>
            <InputIcon className={classes.buttonIcon} />
            Login
          </Button>
        )}
        {authUserInfo !== null && (
          <Fragment>
            <Button
              color='inherit'
              ref={(node) => {
                this.anchorEl = node;
              }}
              aria-owns={userMenuOpen ? 'menu-list-grow' : undefined}
              aria-haspopup='true'
              onClick={this.handleToggleUserMenu}>
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
      <Popper open={userMenuOpen} anchorEl={this.anchorEl} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            id='menu-list-grow'
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}>
            <Paper>
              <ClickAwayListener onClickAway={this.handleCloseUserMenu}>
                <MenuList>
                  <MenuItem onClick={this.handleTokenClicked}>Token</MenuItem>
                  <MenuItem onClick={this.handleLogOutClicked}>Logout</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    );
  };

  handleSearchQueryChange = async (newQuery) => {
    await this.props.handleSearchQueryParamsUpdate({
      query: newQuery,
      page: 0,
    });
  };

  handleSearchQuerySyntaxClick = (event) => {
    const { currentTarget } = event;
    this.setState((state) => ({
      searchHintAnchorEl: currentTarget,
      openSearchHint: !state.openSearchHint,
    }));
  };

  handleSearchClicked = async () => {
    const { handleStartRunningSearchQuery, searchParams, history } = this.props;

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
          placeholder='Search…'
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          value={searchParams.query}
          onChange={(e) => this.handleSearchQueryChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && this.handleSearchClicked()}
          endAdornment={
            <div>
              <IconButton style={{ color: 'white' }} onClick={this.handleSearchQuerySyntaxClick}>
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
      <Table size='small' className={classes.searchHintTable}>
        <TableHead>
          <TableRow>
            <TableCell>Tag Syntax</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {querySyntax.map((s, idx) => (
            <TableRow key={idx}>
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
        transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Grid container className={classes.searchHintContainer} direction='column'>
                <Typography variant='h6' className={classes.searchHintTitle}>
                  Search Query Syntax
                </Typography>
                {this.renderSearchHintTable()}

                <Grid item sm={12} className={classes.searchHintButton}>
                  <Button color='default' size='small' onClick={this.handleSearchQuerySyntaxClick}>
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
  notOnHomePage = () => {
    return this.props.location.pathname !== '/';
  };
  notOnSubjectPage = () => {
    return !this.props.location.pathname.startsWith('/subjects');
  };
  notOnRunPage = () => {
    return !this.props.location.pathname.startsWith('/runs');
  };
  notOnIGVPage = () => {
    return !this.props.location.pathname.startsWith('/igv');
  };

  render() {
    const { title, classes, authUserInfo, handleDrawerToggle } = this.props;
    const { userMenuOpen } = this.state;

    return (
      <Fragment>
        <DefaultAppBar position='fixed' className={classes.appBar}>
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='Open drawer'
              onClick={handleDrawerToggle}
              className={classes.menuButton}>
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' color='inherit'>
              {title}
            </Typography>
            <div className={classes.grow} />
            {authUserInfo &&
              this.notOnStoragePage() &&
              this.notOnHomePage() &&
              this.notOnSubjectPage() &&
              this.notOnRunPage() &&
              this.notOnIGVPage() &&
              this.renderSearchBox()}
            {this.renderUserButton(classes, authUserInfo)}
            {this.renderUserMenu(classes, userMenuOpen)}
            {authUserInfo && this.renderTokenDialog()}
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
  location: PropTypes.object,
  searchParams: PropTypes.object,
  history: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    searchParams: state.searchParams,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleBeforeRunningSearchQuery: (params) => {
      dispatch(beforeRunningSearchQuery(params));
    },
    handleStartRunningSearchQuery: (params) => {
      dispatch(startRunningSearchQuery(params));
    },
    handleSearchQueryParamsUpdate: (params) => {
      dispatch(updateSearchQueryPrams(params));
    },
  };
};

const ConnectedAppBar = connect(mapStateToProps, mapDispatchToProps)(AppBar);

export default withRouter(withStyles(styles, { withTheme: true })(ConnectedAppBar));
