export function showDisplayText(text: string) {
  return text.replaceAll('-', ' ').replaceAll('_', ' ');
}

/**
 * Convert bytes to Human Readable byte size
 */
const suffixes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
export const getStringReadableBytes = (bytes: number | null) => {
  if (!bytes) {
    return '0 Bytes';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1000));
  return (!bytes && '0 Bytes') || (bytes / Math.pow(1000, i)).toFixed(2) + ' ' + suffixes[i];
};

/**
 * Parse URL
 */

export const parseUrlParams = (url: string) => {
  return new URL(url).searchParams
    .toString()
    .split('&')
    .reduce((previous: Record<string, string>, current: string) => {
      const [key, value] = current.split('=');
      previous[key] = value;
      return previous;
    }, {});
};
