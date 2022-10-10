import React from 'react';
import moment from 'moment';
import API from '@aws-amplify/api';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getStringReadableBytes } from '../../../utils/util';
import FilePreviewButton from '../../../components/FilePreviewButton';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import DataActionButton from '../../../components/DataActionButton';
import { usePortalSubjectDataAPI } from '../../../api/subject';

// Creating Table
type AnalysisResultGDSTableProps = {
  title: string;
  data: Record<string, any>[];
};

const filenameTemplate = (rowData: Record<string, any>) => {
  let filename;
  if (rowData.path) filename = rowData.path.split('/').pop();
  if (rowData.key) filename = rowData.key.split('/').pop();

  return <div className='white-space-nowrap'>{filename}</div>;
};

const actionGDSTemplate = (rowData: Record<string, any>) => {
  return <DataActionButton type='gds' pathOrKey={rowData.path} id={rowData.id} />;
};

const actionS3Template = (rowData: Record<string, any>) => {
  return <DataActionButton type='s3' pathOrKey={rowData.key} id={rowData.id} />;
};
const fileSizeGDSTemplate = (rowData: Record<string, any>) => {
  const readableSize = getStringReadableBytes(rowData.size_in_bytes);
  return <div className='white-space-nowrap overflow-visible'>{readableSize}</div>;
};
const fileSizeS3Template = (rowData: Record<string, any>) => {
  const readableSize = getStringReadableBytes(rowData.size);
  return <div className='white-space-nowrap overflow-visible'>{readableSize}</div>;
};
const timeModifiedTemplate = (rowData: Record<string, any>) => {
  const readableTimeStamp = moment(rowData.last_modified_date).local().format('LLL');
  return <div className='white-space-nowrap'>{readableTimeStamp}</div>;
};

const previewGDSTemplate = (rowData: Record<string, any>) => {
  const filename = rowData.path.split('/').pop();
  const fileSizeInBytes = rowData.size_in_bytes;

  const cachePresignedUrl = (url: string) => {
    rowData['presigned_url'] = url;
  };

  return (
    <FilePreviewButton
      id={rowData.id}
      filename={filename}
      fileSizeInBytes={fileSizeInBytes}
      type='gds'
      handleUpdateData={cachePresignedUrl}
    />
  );
};

const previewS3Template = (rowData: Record<string, any>) => {
  const filename = rowData.key.split('/').pop();
  const fileSizeInBytes = rowData.size;

  const cachePresignedUrl = (url: string) => {
    rowData['presigned_url'] = url;
  };

  return (
    <FilePreviewButton
      fileSizeInBytes={fileSizeInBytes}
      id={rowData.id}
      filename={filename}
      type='s3'
      handleUpdateData={cachePresignedUrl}
    />
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
        <Column body={previewGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={actionGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={fileSizeGDSTemplate} headerStyle={{ display: 'none' }} />
        <Column body={timeModifiedTemplate} headerStyle={{ display: 'none' }} />
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
        autoLayout
        responsiveLayout='scroll'
        header={<div className='uppercase'>{title}</div>}
        tableClassName={data.length == 0 ? 'hidden' : ''}>
        {/* Column field determined by the prefix of body Template */}
        <Column body={filenameTemplate} bodyClassName='w-12' headerStyle={{ display: 'none' }} />
        <Column body={previewS3Template} headerStyle={{ display: 'none' }} />
        <Column body={actionS3Template} headerStyle={{ display: 'none' }} />
        <Column body={fileSizeS3Template} headerStyle={{ display: 'none' }} />
        <Column body={timeModifiedTemplate} headerStyle={{ display: 'none' }} />
      </DataTable>
    </div>
  );
}

type Props = { subjectId: string };

function AnalysisResultsPanel({ subjectId }: Props) {
  const { isFetching, isLoading, data } = usePortalSubjectDataAPI(subjectId);

  if (isLoading || isFetching) {
    return <CircularLoaderWithText />;
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
          <AnalysisResultGDSTable title='bam' data={groupedData.wtsBamsIca} />
        </TabPanel>
        <TabPanel header='TSO500'>
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
          <AnalysisResultS3Table title='bam' data={groupedData.wtsBams} />
        </TabPanel>
      </TabView>
    );
  }

  return <div className='pi pi-exclamation-triangle text-xl' />;
}

export default AnalysisResultsPanel;

function groupResultsData(
  results_s3: Record<string, string>[],
  results_gds: Record<string, string>[]
) {
  const wgs = results_s3.filter((r: Record<string, string>) => r.key.includes('WGS/'));
  const wts = results_s3.filter((r: Record<string, string>) => r.key.includes('WTS/'));
  const bams = wgs.filter((r: Record<string, string>) => r.key.endsWith('bam'));
  const vcfs = wgs.filter(
    (r: Record<string, string>) => r.key.endsWith('vcf.gz') || r.key.endsWith('.maf')
  );
  const circos = wgs.filter((r: Record<string, string>) => r.key.endsWith('png'));
  const pcgr = wgs.filter((r: Record<string, string>) => r.key.endsWith('pcgr.html'));
  const cpsr = wgs.filter((r: Record<string, string>) => r.key.endsWith('cpsr.html'));
  const multiqc = wgs.filter(
    (r: Record<string, string>) =>
      r.key.includes('umccrised') && r.key.endsWith('multiqc_report.html')
  );
  const cancer = wgs.filter(
    (r: Record<string, string>) =>
      r.key.includes('umccrised') && r.key.endsWith('cancer_report.html')
  );
  const coverage = wgs.filter(
    (r: Record<string, string>) => r.key.includes('cacao') && r.key.endsWith('html')
  );
  const gplReport = wgs.filter(
    (r: Record<string, string>) =>
      r.key.includes('gridss_purple_linx') && r.key.endsWith('linx.html')
  );
  const wtsBams = wts.filter((r: Record<string, string>) => r.key.endsWith('bam'));
  const wtsQc = wts.filter((r: Record<string, string>) => r.key.endsWith('multiqc_report.html'));
  const rnasum = wts.filter((r: Record<string, string>) => r.key.endsWith('RNAseq_report.html'));

  // gds ICA

  const wgsBams = results_gds.filter(
    (r: Record<string, string>) => r.path.includes('wgs_tumor_normal') && r.path.endsWith('bam')
  );
  const wgsVcfs = results_gds.filter(
    (r: Record<string, string>) =>
      r.path.includes('umccrise') && (r.path.endsWith('vcf.gz') || r.path.endsWith('.maf'))
  );
  const wgsCircos = results_gds.filter(
    (r: Record<string, string>) => r.path.includes('umccrise') && r.path.endsWith('png')
  );
  const wgsPcgr = results_gds.filter(
    (r: Record<string, string>) => r.path.includes('umccrise') && r.path.endsWith('pcgr.html')
  );
  const wgsCpsr = results_gds.filter(
    (r: Record<string, string>) => r.path.includes('umccrise') && r.path.endsWith('cpsr.html')
  );
  const wgsMultiqc = results_gds.filter(
    (r: Record<string, string>) =>
      r.path.includes('umccrise') && r.path.endsWith('multiqc_report.html')
  );
  const wgsCancer = results_gds.filter(
    (r: Record<string, string>) =>
      r.path.includes('umccrise') && r.path.endsWith('cancer_report.html')
  );
  const wgsCoverage = results_gds.filter(
    (r: Record<string, string>) => r.path.includes('cacao') && r.path.endsWith('html')
  );

  const wgsGpl = results_gds.filter(
    (r: Record<string, string>) =>
      r.path.includes('gridss_purple_linx') && r.path.endsWith('linx.html')
  );

  const wtsBamsIca = results_gds.filter(
    (r: Record<string, string>) => r.path.includes('wts_tumor_only') && r.path.endsWith('bam')
  );
  const wtsMultiqc = results_gds.filter(
    (r: Record<string, string>) =>
      r.path.includes('wts_tumor_only') && r.path.endsWith('multiqc.html')
  );
  const wtsRnasum = results_gds.filter((r: Record<string, string>) =>
    r.path.endsWith('RNAseq_report.html')
  );

  const tsoCtdnaBams = results_gds.filter(
    (r: Record<string, string>) => r.path.includes('tso_ctdna') && r.path.endsWith('bam')
  );
  const tsoCtdnaVcfs = results_gds.filter(
    (r: Record<string, string>) =>
      r.path.includes('tso_ctdna') && (r.path.endsWith('vcf') || r.path.endsWith('vcf.gz'))
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
    wtsRnasum: wtsRnasum,
    tsoCtdnaBams: tsoCtdnaBams,
    tsoCtdnaVcfs: tsoCtdnaVcfs,
  };
}