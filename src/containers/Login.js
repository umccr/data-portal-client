import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Auth } from 'aws-amplify';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await Auth.signIn(this.state.username, this.state.password);
      alert('Logged in');
    } catch (e) {
      alert(e.message);
    }
  };

  render() {
    return (
      <div className='Login'>
        <form onSubmit={this.handleSubmit}>
          <Grid container direction='column'>
            <Grid>
              <TextField
                id='username'
                label='Username'
                type='text'
                name='username'
                autoComplete='username'
                margin='normal'
                variant='outlined'
                value={this.state.username}
                onChange={this.handleChange}
              />
            </Grid>
            <Grid>
              <TextField
                id='password'
                label='Password'
                type='password'
                name='password'
                autoComplete='password'
                margin='normal'
                variant='outlined'
                value={this.state.password}
                onChange={this.handleChange}
              />
            </Grid>
            <Grid>
              <Button type='submit'>Login</Button>
            </Grid>
          </Grid>
        </form>
      </div>
    );
  }
}

export default Login;
