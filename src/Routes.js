import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Home from './containers/Home';
import Login from './containers/Login';
import Search from './containers/Search';

class Routes extends Component {
    render() {
        const { authUser } = this.props;
        console.log(authUser);
        return (
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/login" component={Login} />
                {authUser !== null && (
                    <Route path="/search" component={Search} />
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

const mapStateToProps = state => {
    return {
        authUser: state.authUser,
    };
};

const ReduxRoutes = connect(mapStateToProps)(Routes);

export default ReduxRoutes;
