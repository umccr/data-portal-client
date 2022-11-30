import React, { Component, Fragment } from 'react';
import { CssBaseline, LinearProgress, withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import * as PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import { createApi } from 'unsplash-js';

const clientId = process.env.REACT_APP_UNSPLASH_CLIENT_ID;

const styles = (theme) => ({
  root: {
    height: '100vh',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

function Copyright() {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      {'© '}
      <Link color='inherit' href='https://umccr.org'>
        UMCCR
      </Link>{' '}
      {new Date().getFullYear()}
    </Typography>
  );
}

class LandingPage extends Component {
  state = {
    imageUrl: null,
    imageLink: '',
    userName: '',
    userLink: '',
  };

  componentDidMount() {
    const unsplashApi = createApi({
      apiUrl: 'https://api.unsplash.com',
      headers: { Authorization: 'Client-ID ' + clientId },
    });

    unsplashApi.photos
      .getRandom({
        collectionIds: ['ce-IsXyySA4'],
        count: 1,
      })
      .then((result) => {
        if (result.errors) {
          // console.log('error occurred: ', result.errors[0]);
          this.setState({ imageUrl: 'iStock-529081597-2.jpg' });
        } else {
          const randoms = result.response;
          this.setState({
            imageUrl: randoms[0].urls.regular,
            imageLink: randoms[0].links.html,
            userName: randoms[0].user.username,
            userLink: randoms[0].user.links.html,
          });
        }
      })
      // eslint-disable-next-line no-unused-vars
      .catch((err) => {
        // console.log('fetch error occurred: ', err);
        this.setState({ imageUrl: 'iStock-529081597-2.jpg' });
      });
  }

  renderCover() {
    const { classes } = this.props;
    return (
      <Grid container component='main' className={classes.root}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={8}
          style={{
            backgroundImage: 'url(' + this.state.imageUrl + ')',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'grey',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          {!this.state.imageUrl && <LinearProgress color='primary' />}
          {this.state.userLink && (
            <Typography
              variant='body2'
              style={{
                color: 'white',
                padding: '20px',
                position: 'fixed',
                bottom: 0,
              }}>
              {'Photo by '}
              <Link
                color='inherit'
                target={'_blank'}
                href={this.state.userLink + '?utm_source=umccr_data_portal&utm_medium=referral'}>
                {this.state.userName}
              </Link>
              {' on '}
              <Link
                color='inherit'
                target={'_blank'}
                href={this.state.imageLink + '?utm_source=umccr_data_portal&utm_medium=referral'}>
                Unsplash
              </Link>
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={8} md={4} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <img
              src={'/uomlogo.png'}
              alt='uomlogo.png'
              style={{ width: '20%', height: 'auto' }}
              className={classes.avatar}
            />
            <Typography component='h1' variant='h5'>
              UMCCR Data Portal
            </Typography>
            <Typography variant='caption' display='block' gutterBottom className={classes.submit}>
              Led by Professor Sean Grimmond, the UMCCR aims to foster innovation and integration in
              cancer care, research, education and training to achieve a world-leading cancer centre
              and workforce.
            </Typography>
            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              onClick={this.props.handleSignIn}
              size={'large'}
              className={classes.submit}>
              Sign In
            </Button>
            <Box mt={5}>
              <Copyright />
            </Box>
          </div>
        </Grid>
      </Grid>
    );
  }

  render() {
    return <Fragment>{this.renderCover()}</Fragment>;
  }
}

LandingPage.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSignIn: PropTypes.func.isRequired,
};

export default withStyles(styles)(LandingPage);
