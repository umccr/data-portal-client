import config from '../../../config';
import { getBaseNameFromKey } from '../../../api/utils';
import { constructGDSUrl } from '../../../api/gds';
import igv, { IGVBrowser, ITrack } from 'igv';
import API from '@aws-amplify/api';
import genomes from './genomes';

/**
 * IGV OPERATIONS
 */

export const initIgv = async (props: { initRefGenome: string; oAuthToken: string }) => {
  const { initRefGenome, oAuthToken } = props;

  igv.removeAllBrowsers();
  const igvDiv = document.getElementById('igv-div');
  const options = {
    genomeList: genomes,
    genome: initRefGenome,
  };
  const igvBrowser: IGVBrowser = await igv.createBrowser(igvDiv, options);
  igv.setOauthToken(oAuthToken, '*htsget*');
  return igvBrowser;
};

export type RequiredS3RowType = {
  key: string;
  bucket: string;
} & Record<string, string | number>;
export const convertS3RowToHtsgetIgvTrack = (s3row: RequiredS3RowType): ITrack => {
  const { key, bucket } = s3row;
  const baseName = getBaseNameFromKey(key);

  // we have a umccr specific rule about how our htsget ids are constructed
  const id = bucket + '/' + key;

  if (key.endsWith('bam')) {
    return {
      type: 'alignment',
      format: 'bam',
      sourceType: 'htsget',
      url: config.htsget.URL,
      endpoint: config.htsget.ENDPOINT_READS,
      id: id,
      name: baseName,
      removable: false,
    };
  } else if (key.endsWith('vcf') || key.endsWith('vcf.gz')) {
    return {
      type: 'variant',
      format: 'vcf',
      sourceType: 'htsget',
      url: config.htsget.URL,
      endpoint: config.htsget.ENDPOINT_VARIANTS,
      id: id,
      name: baseName,
      removable: false,
      visibilityWindow: -1,
    };
  } else {
    throw new Error('Unsupported FileType');
  }
};

export type RequiredGDSRowType = {
  volume_name: string;
  path: string;
} & Record<string, string | number | boolean | null>;
export const convertGdsRowToIgvTrack = async (
  gdsRow: RequiredGDSRowType
): Promise<igv.ITrack | undefined> => {
  const { volume_name, path } = gdsRow;
  // Find gds index path
  let idxFilePath: string;
  if (path.endsWith('bam')) {
    idxFilePath = path + '.bai';
  } else if (path.endsWith('vcf') || path.endsWith('vcf.gz')) {
    idxFilePath = path + '.tbi';
  } else if (path.endsWith('cram')) {
    idxFilePath = path + '.crai';
  } else {
    console.log('No index file for this file');
    return;
  }

  const fileGdsUrl = constructGDSUrl({ volume_name: volume_name, path: path });
  const idxFileGdsUrl = constructGDSUrl({ volume_name: volume_name, path: idxFilePath });

  const { signed_urls } = await API.post('portal', `/presign`, {
    body: [fileGdsUrl, idxFileGdsUrl],
  });

  // Find which presign is which
  let filePresignUrl = '';
  let idxFilePresignUrl = '';
  for (const signed_url of signed_urls) {
    const { volume, path, presigned_url } = signed_url;
    const gdsUrl = constructGDSUrl({ volume_name: volume, path: path });
    if (gdsUrl === fileGdsUrl) {
      filePresignUrl = presigned_url;
    } else if (gdsUrl === idxFileGdsUrl) {
      idxFilePresignUrl = presigned_url;
    }
  }

  const baseName = getBaseNameFromKey(path);
  if (path.endsWith('vcf') || path.endsWith('vcf.gz')) {
    return {
      type: 'variant',
      format: 'vcf',
      sourceType: 'file',
      url: filePresignUrl,
      indexURL: idxFilePresignUrl,
      id: fileGdsUrl,
      name: baseName,
      removable: false,
      visibilityWindow: -1,
    };
  } else if (path.endsWith('bam')) {
    return {
      type: 'alignment',
      format: 'bam',
      sourceType: 'file',
      url: filePresignUrl,
      indexURL: idxFilePresignUrl,
      id: fileGdsUrl,
      name: baseName,
      removable: false,
    };
  } else if (path.endsWith('cram')) {
    return {
      type: 'alignment',
      format: 'cram',
      sourceType: 'file',
      url: filePresignUrl,
      indexURL: idxFilePresignUrl,
      id: fileGdsUrl,
      name: baseName,
      removable: false,
    };
  }
};

export const removeIgvLoadTrackFromName = (props: {
  trackNameList: string[];
  igvBrowser: IGVBrowser;
}): void => {
  const { trackNameList, igvBrowser } = props;
  for (const trackName of trackNameList) {
    igvBrowser.removeTrackByName(trackName);
  }
};

export const addIgvLoadTrackFromITrackList = async (props: {
  iTrackList: ITrack[];
  igvBrowser: IGVBrowser;
}): Promise<void> => {
  const { iTrackList, igvBrowser } = props;
  for (const newTrack of iTrackList) {
    await igvBrowser.loadTrack(newTrack);
  }
};
