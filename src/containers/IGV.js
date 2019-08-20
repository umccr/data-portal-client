import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import igv from 'igv/dist/igv.esm';

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

const options =
    {
        genome: "hg38",
        locus: "chr8:127,736,588-127,739,371",
        tracks: [
            {
                "name": "HG00103",
                "url": "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram",
                "indexURL": "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai",
                "format": "cram"
            }
        ]
    };


class IGV extends Component {
    componentDidMount() {
        const igvDiv = document.getElementById("igv-div");
        igv.createBrowser(igvDiv, options);
    }

    render() {
        return (
            <div id="igv-div">
            </div>
        );
    }
}

export default withStyles(styles)(IGV);