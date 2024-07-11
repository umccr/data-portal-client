import React, { useRef, useState } from 'react';
import moment from 'moment';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getStringReadableBytes } from '../../../utils/util';
import FilePreviewButton from '../../../components/FilePreviewButton';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import DataActionButton, { DataAction } from '../../utils/DataActionButton';
import { usePortalSubjectDataAPI } from '../../../api/subject';
import { getS3PreSignedUrl, S3Row } from '../../../api/s3';
import { GDSRow, getGDSPreSignedUrl } from '../../../api/gds';
import { Button } from 'primereact/button';
import { BlockUI } from 'primereact/blockui';
import {
  DATA_TYPE_SUPPORTED,
  isRequestInlineContentDisposition,
} from '../../../components/ViewPresignedUrl';
import { Toast } from 'primereact/toast';
import mime from 'mime';
import { Message } from 'primereact/message';

// Creating Table
type AnalysisResultGDSTableProps = {
  title: string;
  data: GDSRow[];
};
type AnalysisResultS3TableProps = {
  isDisableObjectRestore?: boolean;
  enforceIgvPresignedMode?: boolean;
  title: string;
  data: S3Row[];
};

const filenameTemplate = (rowData: S3Row | GDSRow) => {
  const toast = useRef(null);
  const [blockedPanel, setBlockedPanel] = useState<boolean>(false);
  let filename;
  if ('path' in rowData && rowData.path) filename = rowData.path.split('/').pop();
  if ('key' in rowData && rowData.key) filename = rowData.key.split('/').pop();
  const split_path = filename ? filename.split('.') : [];
  const filetype = split_path[split_path.length - 1].toLowerCase();

  const handleOpenInBrowser = async (rowData: S3Row | GDSRow) => {
    setBlockedPanel(true);
    if ('path' in rowData && rowData.path) {
      try {
        const signed_url = await getGDSPreSignedUrl(rowData.id, {
          headers: {
            'Content-Disposition': isRequestInlineContentDisposition(filetype)
              ? 'inline'
              : 'attachment',
            'Content-Type': mime.getType(rowData.path),
          },
        });
        window.open(signed_url, '_blank');
      } catch (e) {
        setBlockedPanel(false);
        const msg = (e as Error).message;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        toast.current.show({
          severity: 'error',
          summary: 'Invalid URL',
          detail: msg,
        });
        // throw e;
      }
    }
    if ('key' in rowData && rowData.key) {
      try {
        const signed_url = await getS3PreSignedUrl(rowData.id);
        window.open(signed_url, '_blank');
      } catch (e) {
        setBlockedPanel(false);
        const msg = (e as Error).message;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        toast.current.show({
          severity: 'error',
          summary: 'Invalid URL',
          detail: msg,
        });
        // throw e;
      }
    }
    setBlockedPanel(false);
  };

  if (
    filename &&
    (filename.endsWith('html') || filename.endsWith('png') || filename.endsWith('pdf'))
  ) {
    return (
      <>
        <Toast ref={toast} position='bottom-left' />
        <BlockUI
          blocked={blockedPanel}
          template={<i className='pi pi-spin pi-spinner' style={{ fontSize: '2em' }} />}>
          <Button className='p-button-link' onClick={() => handleOpenInBrowser(rowData)}>
            {filename}
          </Button>
        </BlockUI>
      </>
    );
  }

  return <div className='white-space-nowrap'>{filename}</div>;
};

/**
 * The following some template to view column data.
 * Note that the variable naming might be specific to S3 or GDS.
 */

const portalRunIdTemplate = (rowData: S3Row | GDSRow) => {
  let portalRunId;
  if ('key' in rowData && rowData.key) portalRunId = getPortalRunIdFromS3Key(rowData.key);
  if ('path' in rowData && rowData.path) portalRunId = rowData.path.split('/')[4];
  return (
    <div className='white-space-nowrap overflow-visible' style={{ width: '130x' }}>
      {portalRunId}
    </div>
  );
};

// Fix: cttsov2 have one more layer than other data in the s3 key
const getPortalRunIdFromS3Key = (key: string) => {
  const tmp = key.split('/')[3];
  // if tmp not shtart with 8 digits, then it is the extra layer
  return /^\d{8}/.test(tmp) ? tmp : key.split('/')[4];
};

const downloadTemplate = ({
  id,
  keyOrPath,
  getPresignedUrl,
}: {
  id: number;
  keyOrPath: string;
  getPresignedUrl: (id: number) => Promise<string>;
}) => {
  /**
   * For now download option is the special case that only offer within Analysis Results summary panel.
   * Whether we extend this to S3 or elsewhere is T.B.D  ~victor
   */
  const toast = useRef(null);
  const [blockedPanel, setBlockedPanel] = useState<boolean>(false);
  const filename = keyOrPath.split('/').pop() ?? keyOrPath;
  // const fileSizeInBytes = rowData.size_in_bytes;
  const filetype = filename.split('.').pop();
  const allowFileTypes = ['vcf', 'gz', 'maf', ...DATA_TYPE_SUPPORTED];
  const allowDownload = allowFileTypes.includes(filetype as string);

  const handleDownload = async () => {
    setBlockedPanel(true);
    if (keyOrPath) {
      try {
        const signed_url = await getPresignedUrl(id);
        window.open(signed_url, '_blank');
      } catch (e) {
        setBlockedPanel(false);
        const msg = (e as Error).message;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        toast.current.show({
          severity: 'error',
          summary: 'Invalid URL',
          detail: msg,
        });
        // throw e;
      }
    }
    setBlockedPanel(false);
  };

  return (
    <>
      {allowDownload && (
        <>
          <Toast ref={toast} position='bottom-left' />
          <BlockUI
            blocked={blockedPanel}
            template={<i className='pi pi-spin pi-spinner' style={{ fontSize: '2em' }} />}>
            <div className='cursor-pointer pi pi-download' onClick={() => handleDownload()} />
          </BlockUI>
        </>
      )}
    </>
  );
};

function AnalysisResultGDSTable(prop: AnalysisResultGDSTableProps) {
  const { title, data } = prop;

  const actionGDSTemplate = (rowData: GDSRow) => {
    return (
      <DataActionButton
        type='gds'
        pathOrKey={rowData.path}
        id={rowData.id}
        bucketOrVolume={rowData.volume_name}
      />
    );
  };

  const fileSizeGDSTemplate = (rowData: GDSRow) => {
    const readableSize = getStringReadableBytes(rowData.size_in_bytes);
    return (
      <div className='white-space-nowrap overflow-visible' style={{ width: '75px' }}>
        {readableSize}
      </div>
    );
  };

  const timeModifiedGDSTemplate = (rowData: GDSRow) => {
    return (
      <div className='white-space-nowrap' style={{ width: '300px' }}>
        {moment(rowData.time_modified).toString()}
      </div>
    );
  };

  const previewGDSTemplate = (rowData: GDSRow) => {
    const filename = rowData.path.split('/').pop() ?? rowData.path;
    const fileSizeInBytes = rowData.size_in_bytes;

    return (
      <div style={{ width: '15px' }}>
        <FilePreviewButton
          id={rowData.id}
          filename={filename}
          fileSizeInBytes={fileSizeInBytes}
          type='gds'
        />
      </div>
    );
  };

  // An adapter for GDS and S3 row before passing in through the download template
  const downloadGDSTemplate = (rowData: GDSRow) => {
    return downloadTemplate({
      id: rowData.id,
      keyOrPath: rowData.path,
      getPresignedUrl: getGDSPreSignedUrl,
    });
  };

  return (
    <div>
      <DataTable
        value={data}
        header={<div className='uppercase'>{title}</div>}
        tableClassName={data.length == 0 ? 'hidden' : ''}>
        {/* Column field determined by the prefix of body Template */}
        <Column body={filenameTemplate} bodyClassName='w-12' headerStyle={{ display: 'none' }} />
        <Column body={portalRunIdTemplate} headerStyle={{ display: 'none' }} />
        <Column body={downloadGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={previewGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={actionGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={fileSizeGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={timeModifiedGDSTemplate} headerStyle={{ display: 'none' }} />
      </DataTable>
    </div>
  );
}

function AnalysisResultS3Table(prop: AnalysisResultS3TableProps) {
  const { title, data, enforceIgvPresignedMode, isDisableObjectRestore } = prop;

  const fileSizeS3Template = (rowData: S3Row) => {
    const readableSize = getStringReadableBytes(rowData.size);
    return (
      <div className='white-space-nowrap overflow-visible' style={{ width: '75px' }}>
        {readableSize}
      </div>
    );
  };

  const downloadS3Template = (rowData: S3Row) => {
    return downloadTemplate({
      id: rowData.id,
      keyOrPath: rowData.key,
      getPresignedUrl: getS3PreSignedUrl,
    });
  };

  const previewS3Template = (rowData: S3Row) => {
    const filename = rowData.key.split('/').pop() ?? rowData.key;
    const fileSizeInBytes = rowData.size;

    return (
      <div style={{ width: '15px' }}>
        <FilePreviewButton
          fileSizeInBytes={fileSizeInBytes}
          id={rowData.id}
          filename={filename}
          type='s3'
        />
      </div>
    );
  };

  const actionS3Template = (rowData: S3Row) => {
    return (
      <DataActionButton
        type='s3'
        pathOrKey={rowData.key}
        id={rowData.id}
        bucketOrVolume={rowData.bucket}
        enforceIgvPresignedMode={enforceIgvPresignedMode}
        isDisableObjectRestore={isDisableObjectRestore}
      />
    );
  };

  const timeModifiedS3Template = (rowData: S3Row) => {
    const readableTimeStamp = moment(rowData.last_modified_date).toString();
    return (
      <div className='white-space-nowrap' style={{ width: '300px' }}>
        {readableTimeStamp}
      </div>
    );
  };

  return (
    <div>
      <DataTable
        value={data}
        header={<div className='uppercase'>{title}</div>}
        tableClassName={data.length == 0 ? 'hidden' : ''}>
        {/* Column field determined by the prefix of body Template */}
        <Column body={filenameTemplate} bodyClassName='w-12' headerStyle={{ display: 'none' }} />
        <Column body={portalRunIdTemplate} headerStyle={{ display: 'none' }} />
        <Column body={downloadS3Template} headerStyle={{ display: 'none' }} />
        <Column body={previewS3Template} headerStyle={{ display: 'none' }} />
        <Column body={actionS3Template} headerStyle={{ display: 'none' }} />
        <Column body={fileSizeS3Template} headerStyle={{ display: 'none' }} />
        <Column body={timeModifiedS3Template} headerStyle={{ display: 'none' }} />
      </DataTable>
    </div>
  );
}

type Props = { subjectId: string };

function AnalysisResultsTable({ subjectId }: Props) {
  const { isFetching, isLoading, data } = usePortalSubjectDataAPI(subjectId);

  if (isLoading || isFetching) {
    return <CircularLoaderWithText text='Fetching data, please wait...' />;
  }

  let groupedData;
  if (data) {
    groupedData = groupResultsData({
      results_gds: data.results_gds,
      results_s3: data.results,
      results_sash: data.results_sash,
      results_cttsov2: data.results_cttsov2,
    });

    return (
      <TabView renderActiveOnly panelContainerClassName='px-0'>
        <TabPanel header='WGS'>
          <AnalysisResultGDSTable title='cancer report' data={groupedData.wgsCancer} />
          <AnalysisResultGDSTable title='pcgr' data={groupedData.wgsPcgr} />
          <AnalysisResultGDSTable title='cpsr' data={groupedData.wgsCpsr} />
          <AnalysisResultGDSTable title='gpl report' data={groupedData.wgsGpl} />
          <AnalysisResultGDSTable title='qc report' data={groupedData.wgsMultiqc} />
          <AnalysisResultGDSTable title='coverage report' data={groupedData.wgsCoverage} />
          <AnalysisResultGDSTable title='vcf' data={groupedData.wgsVcfs} />
          <AnalysisResultGDSTable title='circos plot' data={groupedData.wgsCircos} />
          <AnalysisResultGDSTable title='bam' data={groupedData.wgsBams} />
        </TabPanel>
        <TabPanel header='WTS'>
          <AnalysisResultGDSTable title='rnasum report' data={groupedData.wtsRNAsum} />
          <AnalysisResultGDSTable title='qc report' data={groupedData.wtsMultiqc} />
          <AnalysisResultGDSTable title='fusions report' data={groupedData.wtsFusionsIca} />
          <AnalysisResultGDSTable title='bam' data={groupedData.wtsBamsIca} />
        </TabPanel>
        <TabPanel header='TSO500'>
          <AnalysisResultGDSTable title='tsv' data={groupedData.tsoCtdnaTsv} />
          <AnalysisResultGDSTable title='vcf' data={groupedData.tsoCtdnaVcfs} />
          <AnalysisResultGDSTable title='bam' data={groupedData.tsoCtdnaBams} />
        </TabPanel>
        <TabPanel header='TSO500 (V2)'>
          <AnalysisResultS3Table
            title='tsv'
            data={groupedData.cttsov2Tsv}
            enforceIgvPresignedMode={true}
            isDisableObjectRestore={true}
          />
          <AnalysisResultS3Table
            title='csv'
            data={groupedData.cttsov2Csv}
            enforceIgvPresignedMode={true}
            isDisableObjectRestore={true}
          />
          <AnalysisResultS3Table
            title='vcf'
            data={groupedData.cttsov2Vcfs}
            enforceIgvPresignedMode={true}
            isDisableObjectRestore={true}
          />
          <AnalysisResultS3Table
            title='json'
            data={groupedData.cttsov2Json}
            enforceIgvPresignedMode={true}
            isDisableObjectRestore={true}
          />
          <AnalysisResultS3Table
            title='bam'
            data={groupedData.cttsov2Bams}
            enforceIgvPresignedMode={true}
            isDisableObjectRestore={true}
          />
        </TabPanel>
        <TabPanel header='WGS (bcbio)'>
          <AnalysisResultS3Table title='cancer report' data={groupedData.cancer} />
          <AnalysisResultS3Table title='pcgr' data={groupedData.pcgr} />
          <AnalysisResultS3Table title='cpsr' data={groupedData.cpsr} />
          <AnalysisResultS3Table title='gpl report' data={groupedData.gplReport} />
          <AnalysisResultS3Table title='qc report' data={groupedData.multiqc} />
          <AnalysisResultS3Table title='coverage report' data={groupedData.coverage} />
          <AnalysisResultS3Table title='vcf' data={groupedData.vcfs} />
          <AnalysisResultS3Table title='circos plot' data={groupedData.circos} />
          <AnalysisResultS3Table title='bam' data={groupedData.bams} />
        </TabPanel>
        <TabPanel header='WTS (bcbio)'>
          <AnalysisResultS3Table title='rnasum report' data={groupedData.rnasum} />
          <AnalysisResultS3Table title='qc report' data={groupedData.wtsQc} />
          <AnalysisResultS3Table title='fusions report' data={groupedData.wtsFusions} />
          <AnalysisResultS3Table title='bam' data={groupedData.wtsBams} />
        </TabPanel>
        <TabPanel header='WGS (sash)'>
          <div className='bg-yellow-100 p-3'>
            <Message
              className='w-full mb-3 bg-yellow-100'
              severity='warn'
              text='RESEARCH USE ONLY'
              pt={{ text: { className: 'font-bold' } }}
            />

            <AnalysisResultS3Table title='cancer report' data={groupedData.sash.cancer} />
            <AnalysisResultS3Table title='pcgr' data={groupedData.sash.pcgr} />
            <AnalysisResultS3Table title='cpsr' data={groupedData.sash.cpsr} />
            <AnalysisResultS3Table title='linx report' data={groupedData.sash.linx} />
            <AnalysisResultS3Table title='qc report' data={groupedData.sash.multiqc} />
            <AnalysisResultS3Table title='vcf' data={groupedData.sash.vcfs} />
            <AnalysisResultS3Table title='circos plot' data={groupedData.sash.circos} />
            <AnalysisResultGDSTable title='bam' data={groupedData.sash.gdsWgsBams} />
          </div>
        </TabPanel>
      </TabView>
    );
  }

  return <div className='pi pi-exclamation-triangle text-xl' />;
}

export default AnalysisResultsTable;

function groupResultsData({
  results_s3,
  results_gds,
  results_sash,
  results_cttsov2,
}: {
  results_s3: S3Row[];
  results_gds: GDSRow[];
  results_sash: S3Row[];
  results_cttsov2: S3Row[];
}) {
  const wgs = results_s3.filter((r) => r.key.includes('WGS/'));
  const wts = results_s3.filter((r) => r.key.includes('WTS/'));

  // WGS
  const bams = wgs.filter((r) => r.key.endsWith('bam'));
  const vcfs = wgs.filter((r) => r.key.endsWith('vcf.gz') || r.key.endsWith('.maf'));
  const circos = wgs.filter((r) => r.key.endsWith('png'));
  const pcgr = wgs.filter((r) => r.key.endsWith('pcgr.html'));
  const cpsr = wgs.filter((r) => r.key.endsWith('cpsr.html'));
  const multiqc = wgs.filter(
    (r) => r.key.includes('umccrised') && r.key.endsWith('multiqc_report.html')
  );
  const cancer = wgs.filter(
    (r) => r.key.includes('umccrised') && r.key.endsWith('cancer_report.html')
  );
  const coverage = wgs.filter((r) => r.key.includes('cacao') && r.key.endsWith('html'));
  const gplReport = wgs.filter(
    (r) => r.key.includes('gridss_purple_linx') && r.key.endsWith('linx.html')
  );

  // WTS
  const wtsBams = wts.filter((r) => r.key.endsWith('bam'));
  const wtsQc = wts.filter((r) => r.key.endsWith('multiqc_report.html'));
  const wtsFusions = wts.filter((r) => r.key.endsWith('fusions.pdf'));
  const rnasum = wts.filter((r) => r.key.endsWith('RNAseq_report.html'));

  // gds ICA
  const wgsBams = results_gds.filter(
    (r) => r.path.includes('wgs_tumor_normal') && r.path.endsWith('bam')
  );
  const wgsVcfs = results_gds.filter(
    (r) =>
      (r.path.includes('umccrise') || r.path.includes('wgs_tumor_normal')) &&
      (r.path.endsWith('vcf.gz') || r.path.endsWith('.maf'))
  );
  const wgsCircos = results_gds.filter(
    (r) => r.path.includes('umccrise') && r.path.endsWith('png')
  );
  const wgsPcgr = results_gds.filter(
    (r) => r.path.includes('umccrise') && r.path.endsWith('pcgr.html')
  );
  const wgsCpsr = results_gds.filter(
    (r) => r.path.includes('umccrise') && r.path.endsWith('cpsr.html')
  );
  const wgsMultiqc = results_gds.filter(
    (r) => r.path.includes('umccrise') && r.path.endsWith('multiqc_report.html')
  );
  const wgsCancer = results_gds.filter(
    (r) => r.path.includes('umccrise') && r.path.endsWith('cancer_report.html')
  );
  const wgsCoverage = results_gds.filter(
    (r) => r.path.includes('cacao') && r.path.endsWith('html')
  );

  const wgsGpl = results_gds.filter(
    (r) => r.path.includes('gridss_purple_linx') && r.path.endsWith('linx.html')
  );

  const wtsBamsIca = results_gds.filter(
    (r) => r.path.includes('wts_tumor_only') && r.path.endsWith('bam')
  );
  const wtsMultiqc = results_gds.filter(
    (r) => r.path.includes('wts_tumor_only') && r.path.endsWith('multiqc.html')
  );
  const wtsFusionsIca = results_gds.filter(
    (r) => r.path.includes('wts_tumor_only') && r.path.endsWith('fusions.pdf')
  );
  const wtsRNAsum = results_gds.filter((r) => r.path.endsWith('RNAseq_report.html'));

  const tsoCtdnaBams = results_gds.filter(
    (r) => r.path.includes('tso_ctdna') && r.path.endsWith('bam')
  );
  const tsoCtdnaVcfs = results_gds.filter(
    (r) => r.path.includes('tso_ctdna') && (r.path.endsWith('vcf') || r.path.endsWith('vcf.gz'))
  );
  const tsoCtdnaTsv = results_gds.filter(
    (r) => r.path.includes('tso_ctdna') && r.path.endsWith('tsv')
  );

  // CTTSOV2 results
  const cttsov2Bams = results_cttsov2.filter(
    (r) => r.key.includes('cttsov2') && r.key.endsWith('bam')
  );
  const cttsov2Vcfs = results_cttsov2.filter(
    (r) =>
      r.key.includes('cttsov2') &&
      (r.key.endsWith('.vcf') ||
        r.key.endsWith('.gvcf') ||
        r.key.endsWith('.vcf.gz') ||
        r.key.endsWith('.gvcf.gz'))
  );
  const cttsov2Tsv = results_cttsov2.filter(
    (r) => r.key.includes('cttsov2') && r.key.endsWith('tsv')
  );
  const cttsov2Csv = results_cttsov2.filter(
    (r) => r.key.includes('cttsov2') && r.key.endsWith('csv')
  );
  const cttsov2Json = results_cttsov2.filter(
    (r) => r.key.includes('cttsov2') && (r.key.endsWith('json') || r.key.endsWith('json.gz'))
  );

  // Sash results
  const sashGrouped = {
    // The input bam
    gdsWgsBams: wgsBams,
    // The rest of the output needed to show
    vcfs: results_sash.filter((r) => r.key.endsWith('vcf.gz') || r.key.endsWith('.maf')),
    circos: results_sash.filter((r) => r.key.includes('circos') && r.key.endsWith('.png')),
    pcgr: results_sash.filter((r) => r.key.endsWith('pcgr.html')),
    cpsr: results_sash.filter((r) => r.key.endsWith('cpsr.html')),
    multiqc: results_sash.filter((r) => r.key.includes('multiqc') && r.key.endsWith('.html')),
    cancer: results_sash.filter((r) => r.key.endsWith('cancer_report.html')),
    linx: results_sash.filter((r) => r.key.endsWith('linx.html')),
  };

  return {
    // S3 - bcbio
    wgs: wgs,
    wts: wts,
    bams: bams,
    vcfs: vcfs,
    circos: circos,
    pcgr: pcgr,
    cpsr: cpsr,
    multiqc: multiqc,
    cancer: cancer,
    coverage: coverage,
    gplReport: gplReport,
    wtsBams: wtsBams,
    wtsQc: wtsQc,
    wtsFusions: wtsFusions,
    rnasum: rnasum,

    // Gds
    wgsBams: wgsBams,
    wgsVcfs: wgsVcfs,
    wgsCircos: wgsCircos,
    wgsPcgr: wgsPcgr,
    wgsCpsr: wgsCpsr,
    wgsMultiqc: wgsMultiqc,
    wgsCancer: wgsCancer,
    wgsCoverage: wgsCoverage,
    wgsGpl: wgsGpl,
    wtsBamsIca: wtsBamsIca,
    wtsMultiqc: wtsMultiqc,
    wtsFusionsIca: wtsFusionsIca,
    wtsRNAsum: wtsRNAsum,
    tsoCtdnaBams: tsoCtdnaBams,
    tsoCtdnaVcfs: tsoCtdnaVcfs,
    tsoCtdnaTsv: tsoCtdnaTsv,

    // CTTSOV2
    cttsov2Bams: cttsov2Bams,
    cttsov2Vcfs: cttsov2Vcfs,
    cttsov2Tsv: cttsov2Tsv,
    cttsov2Csv: cttsov2Csv,
    cttsov2Json: cttsov2Json,

    // S3 - Sash
    sash: sashGrouped,
  };
}
