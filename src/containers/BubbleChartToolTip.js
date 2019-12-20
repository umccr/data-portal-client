import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  container: {
    padding: theme.spacing(1),
  },
});

class CustomTooltip extends Component {
  render() {
    const { active } = this.props;

    if (active) {
      const { payload, classes } = this.props;

      return (
        <Paper className={classes.container}>
          <Typography variant='subtitle2'>{`${payload[0].payload.fullPath}`}</Typography>

          {payload.map((p) => {
            if (p.name !== 'weight') {
              return (
                <Typography variant='body1' key={p.name}>{`${p.name} : ${p.value} ${
                  p.unit
                }`}</Typography>
              );
            }
            return null;
          })}
        </Paper>
      );
    }

    return null;
  }
}

CustomTooltip.propTypes = {
  payload: PropTypes.array.isRequired,
  active: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomTooltip);
