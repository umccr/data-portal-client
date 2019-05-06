import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
});

class Home extends Component {
    render() {
        return (
            <div>
                <Typography variant="body1" gutterBottom>
                    Led by Professor Sean Grimmond, the UMCCR aims to foster
                    innovation and integration in cancer care, research,
                    education and training to achieve a world-leading cancer
                    centre and workforce.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The UMCCR focuses on improving the molecular detection and
                    diagnosis of cancer, improving therapeutic decisions for
                    patients through computational oncology, and enabling
                    innovative programs in personalised cancer care.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Based at the Victorian Comprehensive Cancer Centre (VCCC),
                    the UMCCR facilitates the sharing of infrastructure and
                    supports collaboration within the Melbourne Biomedical
                    Precinct and the wider VCCC alliance.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The UMCCR works in a wide variety of cancers including
                    breast, ovarian, prostate, colorectal, pancreatic,
                    neuroendocrine, gastric, oesophageal and melanoma, but
                    recalcitrant cancers – for which the standard of care has
                    changed little over the last 30 years – is an emerging
                    theme.
                </Typography>
            </div>
        );
    }
}

export default withStyles(styles)(Home);
