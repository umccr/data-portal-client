import config from '../../../config';
import { GDSRow, constructGDSUrl } from '../../../api/gds';
import igv, { IGVBrowser, ITrack } from 'igv';
import { post } from 'aws-amplify/api';
import { constructIgvNameParameter } from '../../../components/OpenInIgvDialog';
import genomes from './genomes';
import { SubjectApiRes } from '../../../api/subject';
import { S3Row } from '../../../api/s3';

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

export type RequiredS3RowType = Pick<S3Row, 'key' | 'bucket'>;
export const convertS3RowToHtsgetIgvTrack = ({
  s3Row,
  igvName,
}: {
  s3Row: RequiredS3RowType;
  igvName: string;
}): ITrack => {
  const { key, bucket } = s3Row;

  // we have umccr specific rule about how our htsget ids are constructed
  const id = bucket + '/' + key;

  if (key.endsWith('bam')) {
    return {
      type: 'alignment',
      format: 'bam',
      sourceType: 'htsget',
      url: config.htsget.URL,
      endpoint: config.htsget.ENDPOINT_READS,
      id: id.replace('.bam', ''),
      name: igvName,
      removable: false,
    };
  } else if (key.endsWith('vcf') || key.endsWith('vcf.gz')) {
    return {
      type: 'variant',
      format: 'vcf',
      sourceType: 'htsget',
      url: config.htsget.URL,
      endpoint: config.htsget.ENDPOINT_VARIANTS,
      id: id.replace('.vcf', '').replace('.gz', ''),
      name: igvName,
      removable: false,
      visibilityWindow: -1,
    };
  } else {
    throw new Error('Unsupported FileType');
  }
};

export type RequiredGDSRowType = Pick<GDSRow, 'volume_name' | 'path'>;
export const convertGdsRowToIgvTrack = async ({
  gdsRow,
  igvName,
}: {
  gdsRow: RequiredGDSRowType;
  igvName: string;
}): Promise<igv.ITrack | undefined> => {
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
    console.debug('No index file for this file');
    return;
  }

  const fileGdsUrl = constructGDSUrl({ volume_name: volume_name, path: path });
  const idxFileGdsUrl = constructGDSUrl({ volume_name: volume_name, path: idxFilePath });

  const response = await post({
    apiName: 'portal',
    path: `/presign`,
    options: {
      body: [fileGdsUrl, idxFileGdsUrl],
    },
  }).response;
  const { signed_urls } = (await response.body.json()) as any;

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
  if (path.endsWith('vcf') || path.endsWith('vcf.gz')) {
    return {
      type: 'variant',
      format: 'vcf',
      sourceType: 'file',
      url: filePresignUrl,
      indexURL: idxFilePresignUrl,
      id: fileGdsUrl,
      name: igvName,
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
      name: igvName,
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
      name: igvName,
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
