import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import igv from 'igv';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import getFileSignedURL from '../utils/signedURL';
import * as PropTypes from 'prop-types';

const styles = (theme) => ({
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

const urlConversionMap = {
  '.bam': {
    index: '.bam.bai',
    format: 'bam',
  },
  '.cram': {
    index: '.cram.crai',
    format: 'cram',
  },
  '.vcf': {
    index: '.vcf.tbi',
    format: 'vcf',
  },
  '.vcf.gz': {
    index: '.vcf.gz.tbi',
    format: 'vcf',
  },
};

/**
 * Given a S3 file key, determine whether it is a valid source filename for IGV
 * @param key
 * @returns {boolean}
 */
export const isValidIGVSourceKey = (key) => {
  for (let ext of Object.keys(urlConversionMap)) {
    if (key.endsWith(ext)) {
      return true;
    }
  }

  return false;
};

class IGV extends Component {
  state = {
    filename: null,
    s3Bucket: null,
    s3Key: null,
    signedURL: null,
    signedIndexURL: null,
    format: null,
    htsget_req: null,
  };

  async componentDidMount() {
    const values = queryString.parse(this.props.location.search);
    //if (values.bucket && values.key) {
    //  this.directS3IGVAccess(values.bucket, values.key);
    //} else if (values.htsget) {
    this.htsgetAccess(values.htsget);
    //}
  }

  async htsgetAccess(htsget_req) {
    this.setState(
      {
        htsget: htsget_req,
      },
      () => {
        console.log(this.state);
      }
    );
  }

  async directS3IGVAccess(bucket, key) {
    // Find the supported file extension and set up IGV config
    for (let [extension, conversion] of Object.entries(urlConversionMap)) {
      if (key.endsWith(extension)) {
        // Replace extension with the corresponding index extension
        const s3IndexKey = key.replace(extension, conversion.index);
        const filename = key.split('/')[-1];

        this.setState(
          {
            name: filename,
            s3Bucket: bucket,
            s3Key: key,
            signedURL: await getFileSignedURL(bucket, key),
            signedIndexURL: await getFileSignedURL(bucket, s3IndexKey),
            format: conversion.format,
          },
          () => {
            console.log(this.state);
          }
        );

        return;
      }
    }
  }

  renderIgv = () => {
    const options = {
      genome: 'hg19',
      locus: 'chr8:128,747,267-128,754,546',
      tracks: [
        {
          type: 'alignment',
          sourceType: 'htsget',
          url: 'http://htsget.dev.umccr.org',
          endpoint: '/reads/',
          id: 'tabulamuris.A1-B000126-3_39_F-1-1_R2',
          name: 'NA12878',
        },
      ],
    };

    const igvDiv = document.getElementById('igv-div');

    igv.createBrowser(igvDiv, options).then(function (browser) {
      console.log('Creating IGV browser');
      igv.browser = browser;
      console.log('Created IGV browser');
    });
  };

  render() {
    return (
      <div id='igv-div'>
        {/* {this.state.signedURL ? this.renderIgv() : <div>No url specified</div>} */}
        {this.renderIgv()}
      </div>
    );
  }
}

IGV.propTypes = {
  location: PropTypes.object,
};

export default withRouter(withStyles(styles)(IGV));
