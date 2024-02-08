// More info see https://github.com/igvteam/igv.js/wiki/Reference-Genome

export const genomes = [
  {
    id: 'hg38',
    name: 'Human (GRCh38/hg38)',
    fastaURL: 'https://igv-genepattern-org.s3.amazonaws.com/genomes/seq/hg38/hg38.fa',
    indexURL: 'https://igv-genepattern-org.s3.amazonaws.com/genomes/seq/hg38/hg38.fa.fai',
    cytobandURL: 'https://igv-genepattern-org.s3.amazonaws.com/genomes/hg38/cytoBandIdeo.txt.gz',
    aliasURL: 'https://igv-genepattern-org.s3.amazonaws.com/genomes/hg38/hg38_alias.tab',
    chromSizesURL: 'https://hgdownload.soe.ucsc.edu/goldenPath/hg38/bigZips/hg38.chrom.sizes',
    twoBitURL: 'https://hgdownload.soe.ucsc.edu/goldenPath/hg38/bigZips/hg38.2bit',
    tracks: [
      {
        name: 'Refseq Genes',
        format: 'refgene',
        url: 'https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/ncbiRefSeq.txt.gz',
        indexed: false,
        visibilityWindow: -1,
        removable: false,
        order: 1000000,
        infoURL: 'https://www.ncbi.nlm.nih.gov/gene/?term=$$',
      },
    ],
  },
  {
    id: 'hg38_1kg',
    name: 'Human (hg38 1kg/GATK)',
    fastaURL:
      'https://1000genomes.s3.amazonaws.com/technical/reference/GRCh38_reference_genome/GRCh38_full_analysis_set_plus_decoy_hla.fa',
    indexURL:
      'https://1000genomes.s3.amazonaws.com/technical/reference/GRCh38_reference_genome/GRCh38_full_analysis_set_plus_decoy_hla.fa.fai',
    cytobandURL: 'https://s3.amazonaws.com/igv.org.genomes/hg38/annotations/cytoBandIdeo.txt.gz',
    tracks: [
      {
        name: 'Refseq Genes',
        format: 'refgene',
        id: 'hg19_genes',
        url: 'https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/ncbiRefSeq.txt.gz',
        indexed: false,
        visibilityWindow: -1,
        removable: false,
        order: 1000000,
        infoURL: 'https://www.ncbi.nlm.nih.gov/gene/?term=$$',
      },
    ],
  },
  {
    id: 'hg19',
    name: 'Human (GRCh37/hg19)',
    fastaURL: 'https://igv-genepattern-org.s3.amazonaws.com/genomes/seq/hg19/hg19.fasta',
    indexURL: 'https://igv-genepattern-org.s3.amazonaws.com/genomes/seq/hg19/hg19.fasta.fai',
    cytobandURL: 'https://igv-genepattern-org.s3.amazonaws.com/genomes/seq/hg19/cytoBand.txt',
    aliasURL: 'https://s3.amazonaws.com/igv.org.genomes/hg19/hg19_alias.tab',
    tracks: [
      {
        name: 'Refseq Genes',
        format: 'refgene',
        id: 'hg19_genes',
        url: 'https://hgdownload.soe.ucsc.edu/goldenPath/hg19/database/ncbiRefSeq.txt.gz',
        indexed: false,
        removable: false,
        order: 1000000,
        infoURL: 'https://www.ncbi.nlm.nih.gov/gene/?term=$$',
        visibilityWindow: -1,
      },
    ],
  },
  {
    id: 'hg18',
    name: 'Human (hg18)',
    fastaURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg18/hg18.fasta',
    indexURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg18/hg18.fasta.fai',
    cytobandURL: 'https://s3.amazonaws.com/igv.org.genomes/hg18/cytoBandIdeo.txt.gz',
    tracks: [
      {
        name: 'Refseq Genes',
        format: 'refgene',
        url: 'https://s3.amazonaws.com/igv.org.genomes/hg18/refGene.txt.gz',
        indexed: false,
        visibilityWindow: -1,
        removable: false,
        order: 1000000,
      },
    ],
  },
];

export default genomes;
