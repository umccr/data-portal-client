import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import igv from 'igv';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';

const styles = theme => ({
    chartContainer: {
        height: '100%',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 200,
    },
    progress: {
        margin: theme.spacing.unit * 2,
    },
});


class IGV extends Component {
    state = {
        url: null
    };


    componentDidMount() {
        const values = queryString.parse(this.props.location.search);

        if (values.url) {
            this.setState({url: values.url});
        }
    }

    renderIgv = () => {
        const options =
            {
                genome: "hg38",
                tracks: [
                    {
                        "name": "HG00103",
                        "url": "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram",
                        "indexURL": "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai",
                        "format": "cram"
                    }
                ]
            };

        const igvDiv = document.getElementById("igv-div");
        igv.createBrowser(igvDiv, options);
    };

    render() {
        return (
            <div id="igv-div">
                {this.state.url ? this.renderIgv() : (
                    <div>
                        No url specified
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(withStyles(styles)(IGV));