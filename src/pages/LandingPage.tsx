// TODO implement v2 version of this page view here

import React, { Component, Fragment } from 'react';
import { CssBaseline, withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import * as PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';

const styles = (theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/user/umccr/likes)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
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
  renderCover() {
    const { classes } = this.props;
    return (
      <Grid container component='main' className={classes.root}>
        <CssBaseline />
        <Grid item xs={false} sm={4} md={8} className={classes.image} />
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
