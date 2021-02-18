import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Home from './containers/Home';
import Login from './containers/Login';
import Search from './containers/Search';
import Storage from './containers/Storage';
import LandingPage from './containers/LandingPage';
import Subject from './containers/Subject';
import Run from './containers/Run';
import IGV from './containers/IGV';

class Routes extends Component {
  render() {
    const { authUser } = this.props;
    return (
      <Switch>
        {authUser === null && (
          <Fragment>
            <Route path='/' exact component={LandingPage} />
            <Route path='/login' component={Login} />
          </Fragment>
        )}
        {authUser !== null && (
          <Fragment>
            <Route path='/' exact component={Home} />
            <Route path='/subjects/' exact component={Subject} />
            <Route path='/subjects/:subjectId' exact component={Subject} />
            <Route path='/runs/' exact component={Run} />
            <Route path='/runs/:runId' exact component={Run} />
            <Route path='/search' component={Search} />
            <Route path='/storage' component={Storage} />
            <Route path='/igv' exact component={IGV} />
            <Route path='/igv/:subjectId' exact component={IGV} />
          </Fragment>
        )}
      </Switch>
    );
  }
}

Routes.defaultProps = {
  authUser: null,
};

Routes.propTypes = {
  authUser: PropTypes.instanceOf(Object),
};

const mapStateToProps = (state) => {
  return {
    authUser: state.authUser,
  };
};

const ReduxRoutes = connect(mapStateToProps)(Routes);

export default ReduxRoutes;
