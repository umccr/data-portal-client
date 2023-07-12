export class PresetDataFactory {
  private static chipStyle: string | number = 'surface-600';

  /**
   * Well-known files of interest patterns for primary data stage from SequenceRun and BCL_CONVERT output
   */
  static buildPrimaryData(): Record<string, string | number>[] {
    return [
      { key: 0, label: 'reset', keyword: '', style: 'p-button-primary' },
      { key: 1, label: 'qc reports', keyword: 'multiqc .html$', style: this.chipStyle },
      { key: 2, label: 'fastq', keyword: '.fastq.gz$', style: this.chipStyle },
    ];
  }

  /**
   * Well-known files of interest patterns from bcBio era analysis data in S3
   */
  static buildAnalysisDataS3(): Record<string, string | number>[] {
    return [
      { key: 0, label: 'reset', keyword: '', style: 'p-button-primary' },
      {
        key: 1,
        label: 'cancer report tables',
        keyword: 'umccrised cancer_report_tables .tsv.gz$',
        style: this.chipStyle,
      },
      {
        key: 2,
        label: 'cancer report',
        keyword: 'umccrised cancer_report.html$',
        style: this.chipStyle,
      },
      { key: 3, label: 'wgs bam', keyword: 'wgs ready .bam$', style: this.chipStyle },
      {
        key: 4,
        label: 'vcf',
        keyword: 'umccrised/[^(work)*] small_variants/[^\\/]*(.vcf.gz$|.maf$)',
        style: this.chipStyle,
      },
      {
        key: 5,
        label: 'wgs qc',
        keyword: 'umccrised multiqc_report.html$',
        style: this.chipStyle,
      },
      {
        key: 6,
        label: 'pcgr cpsr',
        keyword: 'umccrised/[^\\/]*/[^\\/]*(pcgr|cpsr).html$',
        style: this.chipStyle,
      },
      {
        key: 7,
        label: 'coverage',
        keyword: 'umccrised/[^\\/]*/[^\\/]*(normal|tumor).cacao.html$',
        style: this.chipStyle,
      },
      {
        key: 8,
        label: 'circos',
        keyword: 'umccrised/[^(work)*] purple/ circos baf .png$',
        style: this.chipStyle,
      },
      { key: 9, label: 'wts bam', keyword: 'wts ready .bam$', style: this.chipStyle },
      {
        key: 10,
        label: 'wts qc',
        keyword: 'wts multiqc/ multiqc_report.html$',
        style: this.chipStyle,
      },
      {
        key: 11,
        label: 'wts fusions',
        keyword: 'wts fusions .pdf$',
        style: this.chipStyle,
      },
      { key: 12, label: 'rnasum report', keyword: 'RNAseq_report.html$', style: this.chipStyle },
      {
        key: 13,
        label: 'gpl report',
        keyword: 'gridss_purple_linx linx.html$',
        style: this.chipStyle,
      },
    ];
  }

  /**
   * Well-known files of interest patterns from ICA v1 era analysis data in GDS
   */
  static buildAnalysisDataGDS(): Record<string, string | number>[] {
    return [
      { key: 0, label: 'reset', keyword: '', style: 'p-button-primary' },
      {
        key: 1,
        label: 'cancer report tables',
        keyword: 'umccrise cancer_report_tables .tsv.gz$',
        style: this.chipStyle,
      },
      {
        key: 2,
        label: 'qc bam',
        keyword: 'wgs qc .bam$',
        style: this.chipStyle,
      },
      {
        key: 3,
        label: 'qc vcf',
        keyword: 'wgs qc .vcf.gz$',
        style: this.chipStyle,
      },
      {
        key: 4,
        label: 'qc report',
        keyword: 'wgs qc multiqc .html$',
        style: this.chipStyle,
      },
      {
        key: 5,
        label: 'wts bam',
        keyword: 'wts .bam$',
        style: this.chipStyle,
      },
      {
        key: 6,
        label: 'wts vcf',
        keyword: 'wts .vcf.gz$',
        style: this.chipStyle,
      },
      {
        key: 7,
        label: 'wts report',
        keyword: 'wts multiqc .html$',
        style: this.chipStyle,
      },
      {
        key: 8,
        label: 'wts fusions',
        keyword: 'wts fusions .pdf$',
        style: this.chipStyle,
      },
      {
        key: 9,
        label: 't/n report',
        keyword: 'tumor normal multiqc .html$',
        style: this.chipStyle,
      },
      {
        key: 10,
        label: 't/n bam',
        keyword: 'tumor normal .bam$',
        style: this.chipStyle,
      },
      {
        key: 11,
        label: 't/n vcf',
        keyword: 'tumor normal .vcf.gz$',
        style: this.chipStyle,
      },
      {
        key: 12,
        label: 'germline vcf',
        keyword: '[umccrise|wgs_tumor_normal] dragen_germline .vcf.gz$',
        style: this.chipStyle,
      },
      {
        key: 13,
        label: 'tso bam',
        keyword: 'tso ctdna .bam$',
        style: this.chipStyle,
      },
      { key: 14, label: 'tso vcf', keyword: 'tso ctdna .vcf.gz$', style: this.chipStyle },
      { key: 15, label: 'tso tsv', keyword: 'tso ctdna .tsv$', style: this.chipStyle },
      { key: 16, label: 'tso json', keyword: 'tso ctdna .json.gz$', style: this.chipStyle },
    ];
  }
}
