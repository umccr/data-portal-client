import React, { useRef, useState } from 'react';
import moment from 'moment';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getStringReadableBytes } from '../../../utils/util';
import FilePreviewButton from '../../../components/FilePreviewButton';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import DataActionButton from '../../utils/DataActionButton';
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

// Creating Table
type AnalysisResultGDSTableProps = {
  title: string;
  data: Record<string, any>[];
};

const filenameTemplate = (rowData: Record<string, any>) => {
  const toast = useRef(null);
  const [blockedPanel, setBlockedPanel] = useState<boolean>(false);
  let filename;
  if (rowData.path) filename = rowData.path.split('/').pop();
  if (rowData.key) filename = rowData.key.split('/').pop();
  const split_path = filename.split('.');
  const filetype = split_path[split_path.length - 1].toLowerCase();

  const handleOpenInBrowser = async (rowData: Record<string, any>) => {
    setBlockedPanel(true);
    if (rowData.path) {
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
    if (rowData.key) {
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

  if (filename.endsWith('html') || filename.endsWith('png') || filename.endsWith('pdf')) {
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

const actionS3Template = (rowData: S3Row) => {
  return (
    <DataActionButton
      type='s3'
      pathOrKey={rowData.key}
      id={rowData.id}
      bucketOrVolume={rowData.bucket}
    />
  );
};

const fileSizeS3Template = (rowData: S3Row) => {
  const readableSize = getStringReadableBytes(rowData.size);
  return (
    <div className='white-space-nowrap overflow-visible' style={{ width: '75px' }}>
      {readableSize}
    </div>
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

const timeModifiedS3Template = (rowData: S3Row) => {
  const readableTimeStamp = moment(rowData.last_modified_date).toString();
  return (
    <div className='white-space-nowrap' style={{ width: '300px' }}>
      {readableTimeStamp}
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

const downloadGDSTemplate = (rowData: GDSRow) => {
  /**
   * For now download option is the special case that only offer within Analysis Results summary panel.
   * Whether we extend this to S3 or elsewhere is T.B.D  ~victor
   */
  const toast = useRef(null);
  const [blockedPanel, setBlockedPanel] = useState<boolean>(false);
  const filename = rowData.path.split('/').pop() ?? rowData.path;
  // const fileSizeInBytes = rowData.size_in_bytes;
  const filetype = filename.split('.').pop();
  const allowFileTypes = ['gz', 'maf', ...DATA_TYPE_SUPPORTED];
  const allowDownload = allowFileTypes.includes(filetype as string);

  const handleDownload = async (rowData: GDSRow) => {
    setBlockedPanel(true);
    if (rowData.path) {
      try {
        const signed_url = await getGDSPreSignedUrl(rowData.id);
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
            <div
              className='cursor-pointer pi pi-download'
              onClick={() => handleDownload(rowData)}
            />
          </BlockUI>
        </>
      )}
    </>
  );
};

function AnalysisResultGDSTable(prop: AnalysisResultGDSTableProps) {
  const { title, data } = prop;
  return (
    <div>
      <DataTable
        value={data}
        responsiveLayout='scroll'
        header={<div className='uppercase'>{title}</div>}
        tableClassName={data.length == 0 ? 'hidden' : ''}>
        {/* Column field determined by the prefix of body Template */}
        <Column body={filenameTemplate} bodyClassName='w-12' headerStyle={{ display: 'none' }} />
        <Column body={downloadGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={previewGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={actionGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={fileSizeGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={timeModifiedGDSTemplate} headerStyle={{ display: 'none' }} />
      </DataTable>
    </div>
  );
}

function AnalysisResultS3Table(prop: AnalysisResultGDSTableProps) {
  const { title, data } = prop;
  return (
    <div>
      <DataTable
        value={data}
        header={<div className='uppercase'>{title}</div>}
        tableClassName={data.length == 0 ? 'hidden' : ''}>
        {/* Column field determined by the prefix of body Template */}
        <Column body={filenameTemplate} bodyClassName='w-12' headerStyle={{ display: 'none' }} />
        <Column body={previewS3Template} headerStyle={{ display: 'none' }} />
        <Column body={actionS3Template} headerStyle={{ display: 'none' }} />
        <Column body={fileSizeS3Template} headerStyle={{ display: 'none' }} />
        <Column body={timeModifiedS3Template} headerStyle={{ display: 'none' }} />
      </DataTable>
    </div>
  );
}

type Props = { subjectId: string };

function AnalysisResultsPanel({ subjectId }: Props) {
  const { isFetching, isLoading, data } = usePortalSubjectDataAPI(subjectId);

  if (isLoading || isFetching) {
    return <CircularLoaderWithText text='Fetching data, please wait...' />;
  }

  let groupedData;
  if (data) {
    groupedData = groupResultsData(data.results, data.results_gds);

    return (
      <TabView renderActiveOnly>
        <TabPanel header='WGS'>
          <AnalysisResultGDSTable title='cancer report' data={groupedData.wgsCancer} />
          <AnalysisResultGDSTable title='pcgr' data={groupedData.wgsPcgr} />
          <AnalysisResultGDSTable title='cpsr' data={groupedData.wgsCpsr} />
          <AnalysisResultGDSTable title='gpl report' data={groupedData.wgsGpl} />
          <AnalysisResultGDSTable title='qc report' data={groupedData.wgsMultiqc} />
          <AnalysisResultGDSTable title='coverage report' data={groupedData.wgsCoverage} />
          <AnalysisResultGDSTable title='vcf' data={groupedData.wgsVcfs} />
          <AnalysisResultGDSTable title='bam' data={groupedData.wgsBams} />
          <AnalysisResultGDSTable title='circos plot' data={groupedData.wgsCircos} />
        </TabPanel>
        <TabPanel header='WTS'>
          <AnalysisResultGDSTable title='rnasum report' data={groupedData.wtsRnasum} />
          <AnalysisResultGDSTable title='qc report' data={groupedData.wtsMultiqc} />
          <AnalysisResultGDSTable title='fusions report' data={groupedData.wtsFusionsIca} />
          <AnalysisResultGDSTable title='bam' data={groupedData.wtsBamsIca} />
        </TabPanel>
        <TabPanel header='TSO500'>
          <AnalysisResultGDSTable title='tsv' data={groupedData.tsoCtdnaTsv} />
          <AnalysisResultGDSTable title='vcf' data={groupedData.tsoCtdnaVcfs} />
          <AnalysisResultGDSTable title='bam' data={groupedData.tsoCtdnaBams} />
        </TabPanel>
        <TabPanel header='WGS (bcbio)'>
          <AnalysisResultS3Table title='cancer report' data={groupedData.cancer} />
          <AnalysisResultS3Table title='pcgr' data={groupedData.pcgr} />
          <AnalysisResultS3Table title='cpsr' data={groupedData.cpsr} />
          <AnalysisResultS3Table title='gpl report' data={groupedData.gplReport} />
          <AnalysisResultS3Table title='qc report' data={groupedData.multiqc} />
          <AnalysisResultS3Table title='coverage report' data={groupedData.coverage} />
          <AnalysisResultS3Table title='vcf' data={groupedData.vcfs} />
          <AnalysisResultS3Table title='bam' data={groupedData.bams} />
          <AnalysisResultS3Table title='circos plot' data={groupedData.circos} />
        </TabPanel>
        <TabPanel header='WTS (bcbio)'>
          <AnalysisResultS3Table title='rnasum report' data={groupedData.rnasum} />
          <AnalysisResultS3Table title='qc report' data={groupedData.wtsQc} />
          <AnalysisResultS3Table title='fusions report' data={groupedData.wtsFusions} />
          <AnalysisResultS3Table title='bam' data={groupedData.wtsBams} />
        </TabPanel>
      </TabView>
    );
  }

  return <div className='pi pi-exclamation-triangle text-xl' />;
}

export default AnalysisResultsPanel;

function groupResultsData(results_s3: S3Row[], results_gds: GDSRow[]) {
  const wgs = results_s3.filter((r) => r.key.includes('WGS/'));
  const wts = results_s3.filter((r) => r.key.includes('WTS/'));
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
  const wtsRnasum = results_gds.filter((r) => r.path.endsWith('RNAseq_report.html'));

  const tsoCtdnaBams = results_gds.filter(
    (r) => r.path.includes('tso_ctdna') && r.path.endsWith('bam')
  );
  const tsoCtdnaVcfs = results_gds.filter(
    (r) => r.path.includes('tso_ctdna') && (r.path.endsWith('vcf') || r.path.endsWith('vcf.gz'))
  );
  const tsoCtdnaTsv = results_gds.filter(
    (r) => r.path.includes('tso_ctdna') && r.path.endsWith('tsv')
  );

  return {
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
    wtsRnasum: wtsRnasum,
    tsoCtdnaBams: tsoCtdnaBams,
    tsoCtdnaVcfs: tsoCtdnaVcfs,
    tsoCtdnaTsv: tsoCtdnaTsv,
  };
}
