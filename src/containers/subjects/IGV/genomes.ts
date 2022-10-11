export const genomes = [
  {
    id: 'hg38',
    name: 'Human (GRCh38/hg38)',
    fastaURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa',
    indexURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa.fai',
    cytobandURL: 'https://s3.amazonaws.com/igv.org.genomes/hg38/annotations/cytoBandIdeo.txt.gz',
    tracks: [
      {
        name: 'Refseq Genes',
        format: 'refgene',
        url: 'https://s3.amazonaws.com/igv.org.genomes/hg38/ncbiRefGene.txt.gz',
        indexed: false,
        visibilityWindow: -1,
        removable: false,
        order: 1000000,
      },
    ],
  },
  {
    id: 'hg38_1kg',
    name: 'Human (hg38 1kg/GATK)',
    compressedFastaURL:
      'https://s3.amazonaws.com/igv.org.genomes/hg38/Homo_sapiens_assembly38.fasta.gz',
    fastaURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa',
    indexURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa.fai',
    cytobandURL: 'https://s3.amazonaws.com/igv.org.genomes/hg38/annotations/cytoBandIdeo.txt.gz',
    tracks: [
      {
        name: 'Refseq Genes',
        format: 'refgene',
        url: 'https://s3.amazonaws.com/igv.org.genomes/hg38/ncbiRefGene.txt.gz',
        indexed: false,
        visibilityWindow: -1,
        removable: false,
        order: 1000000,
      },
    ],
  },
  {
    id: 'hg19',
    name: 'Human (CRCh37/hg19)',
    fastaURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/hg19.fasta',
    indexURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/hg19.fasta.fai',
    cytobandURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/cytoBand.txt',
    tracks: [
      {
        name: 'Refseq Genes',
        format: 'refgene',
        url: 'https://s3.amazonaws.com/igv.org.genomes/hg19/ncbiRefGene.txt.gz',
        indexed: false,
        visibilityWindow: -1,
        removable: false,
        order: 1000000,
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
