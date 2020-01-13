import * as React from 'react';
import * as PropTypes from 'prop-types';

const suffixes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const getBytes = (bytes) => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (!bytes && '0 Bytes') || (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + suffixes[i];
};

const HumanReadableFileSize = ({ bytes }) => <span>{getBytes(bytes)}</span>;

HumanReadableFileSize.propTypes = {
  bytes: PropTypes.number,
};

export default HumanReadableFileSize;
