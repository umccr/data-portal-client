import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    container: {
        padding: theme.spacing.unit,
    },
});

class CustomTooltip extends Component {
    render() {
        const { active } = this.props;

        if (active) {
            const { payload, label, classes } = this.props;
            console.log(payload);
            return (
                <Paper className={classes.container}>
                    <Typography variant="subtitle2">{`${
                        payload[0].payload.fullPath
                    }`}</Typography>

                    {payload.map(p => {
                        if (p.name !== 'weight') {
                            return (
                                <Typography variant="body1">{`${p.name} : ${
                                    p.value
                                } ${p.unit}`}</Typography>
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
    type: PropTypes.string.isRequired,
    payload: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomTooltip);
