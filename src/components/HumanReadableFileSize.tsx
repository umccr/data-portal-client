// TODO implement v2 version of this component here

import * as React from 'react';
import * as PropTypes from 'prop-types';

const suffixes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const getBytes = (bytes) => {
  const i = Math.floor(Math.log(bytes) / Math.log(1000));
  return (!bytes && '0 Bytes') || (bytes / Math.pow(1000, i)).toFixed(2) + ' ' + suffixes[i];
};

const HumanReadableFileSize = ({ bytes }) => <span>{getBytes(bytes)}</span>;

HumanReadableFileSize.propTypes = {
  bytes: PropTypes.number,
};

export default HumanReadableFileSize;
