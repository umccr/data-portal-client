import React, { Fragment } from 'react';
/*import classnames from 'classnames';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { Button, FormControl, LinearProgress, MenuItem, Select } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import HelpIcon from '@material-ui/icons/Help'; */
import { createViewState, JBrowseLinearGenomeView } from '@jbrowse/react-linear-genome-view';

const assembly = {
  name: 'GRCh38',
  sequence: {
    type: 'ReferenceSequenceTrack',
    trackId: 'GRCh38-ReferenceSequenceTrack',
    adapter: {
      type: 'BgzipFastaAdapter',
      fastaLocation: {
        uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/fasta/GRCh38.fa.gz',
        locationType: 'UriLocation',
      },
      faiLocation: {
        uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/fasta/GRCh38.fa.gz.fai',
        locationType: 'UriLocation',
      },
      gziLocation: {
        uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/fasta/GRCh38.fa.gz.gzi',
        locationType: 'UriLocation',
      },
    },
  },
  aliases: ['hg38'],
  refNameAliases: {
    adapter: {
      type: 'RefNameAliasAdapter',
      location: {
        uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/hg38_aliases.txt',
        locationType: 'UriLocation',
      },
    },
  },
};

const tracks = [
  {
    type: 'FeatureTrack',
    trackId: 'ncbi_refseq_109_hg38',
    name: 'NCBI RefSeq (GFF3Tabix)',
    assemblyNames: ['GRCh38'],
    category: ['Annotation'],
    adapter: {
      type: 'Gff3TabixAdapter',
      gffGzLocation: {
        uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/ncbi_refseq/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz',
        locationType: 'UriLocation',
      },
      index: {
        location: {
          uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/ncbi_refseq/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz.tbi',
          locationType: 'UriLocation',
        },
      },
    },
  },
  {
    type: 'AlignmentsTrack',
    trackId: 'htsget_demo',
    name: 'Htsget DNANexus',
    assemblyNames: ['hg19'],
    adapter: {
      type: 'HtsgetBamAdapter',
      htsgetBase: 'http://htsnexus.rnd.dnanex.us/v1/reads',
      htsgetTrackId: 'BroadHiSeqX_b37/NA12878',
    },
  },
];

const defaultSession = {
  name: 'My session',
  view: {
    id: 'linearGenomeView',
    type: 'LinearGenomeView',
    tracks: [
      {
        type: 'ReferenceSequenceTrack',
        configuration: 'GRCh38-ReferenceSequenceTrack',
        displays: [
          {
            type: 'LinearReferenceSequenceDisplay',
            configuration: 'GRCh38-ReferenceSequenceTrack-LinearReferenceSequenceDisplay',
          },
        ],
      },
      {
        type: 'FeatureTrack',
        configuration: 'ncbi_refseq_109_hg38',
        displays: [
          {
            type: 'LinearBasicDisplay',
            configuration: 'ncbi_refseq_109_hg38-LinearBasicDisplay',
          },
        ],
      },
    ],
  },
};

export const JBrowse: React.FC = () => {
  const state = createViewState({
    assembly,
    tracks,
    location: '10:29,838,737..29,838,819',
    defaultSession,
  });

  return (
    <Fragment>
      {/*<div>
                 <FormControl className={this.props.classes.formControl}>
                    <Select value={refGenome} variant='standard' onChange={this.handleRefGenomeChange}>
                        <MenuItem value={'hg38'}>hg38</MenuItem>
                        <MenuItem value={'hg38_1kg'}>hg38_1kg</MenuItem>
                        <MenuItem value={'hg19'}>hg19</MenuItem>
                        <MenuItem value={'hg18'}>hg18</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    component={RouterLink}
                    to={subject ? '/subjects/' + subjectId : '/'}
                    className={this.props.classes.menuButton}
                    variant={'outlined'}
                    size={'medium'}
                    color={'primary'}
                    startIcon={<ExitToAppIcon />}>
                    {subject ? subjectId : 'Select Subject'}
                </Button>
                <Button
                    className={this.props.classes.menuButton}
                    variant={'outlined'}
                    size={'medium'}
                    color={'primary'}
                    startIcon={<AddIcon />}
                    disabled={subject === null}
                    onClick={this.handleLoadTrackDialogOpen}>
                    Load...
                </Button>
                <Button
                    disableElevation
                    className={this.props.classes.menuButton}
                    variant={'contained'}
                    size={'medium'}
                    color={'primary'}
                    startIcon={<AddIcon />}
                    onClick={this.handleAddExtTrackDialogOpen}>
                    Add
                </Button>
                <Button
                    disableElevation
                    className={this.props.classes.menuButton}
                    variant={'contained'}
                    size={'medium'}
                    startIcon={<DeleteSweepIcon />}
                    onClick={this.handleClearAllTracks}>
                    Clear
                </Button>
                <Button
                    disableElevation
                    className={this.props.classes.menuButton}
                    variant={'contained'}
                    size={'medium'}
                    startIcon={<HelpIcon />}
                    onClick={this.handleHelpDialogOpen}>
                    Help
                </Button>
            </div> */}
      <JBrowseLinearGenomeView viewState={state} />
    </Fragment>
  );
};
