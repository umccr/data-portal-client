import { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { igv } from '../lib'

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

var igvDiv = document.getElementById("igv-div");
var options =
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
    }


class IGV extends Component {
    render() {
        return igv.createBrowser(igvDiv, options);
    }
}

export default withStyles(styles)(IGV);