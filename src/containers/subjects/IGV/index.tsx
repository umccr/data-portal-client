import React, { useState, useCallback } from 'react';
import { ITrack } from 'igv';
import { useQuery } from 'react-query';
import { ProgressBar } from 'primereact/progressbar';

import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeParams } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import LoadSubjectDataButton from './LoadSubjectDataButton';
import { S3Row, GDSRow, getBaseNameFromKey } from '../../../API/subject';
import {
  initIgv,
  convertGdsRowToIgvTrack,
  convertS3RowToHtsgetIgvTrack,
  removeIgvLoadTrackFromName,
  addIgvLoadTrackFromITrackList,
} from './utils';

const toolbarGenomeList = [
  { label: 'hg38', value: 'hg38' },
  { label: 'hg38_1kg', value: 'hg38_1kg' },
  { label: 'hg19', value: 'hg19' },
  { label: 'hg18', value: 'hg18' },
];

export type LoadSubjectDataType = {
  s3RowList: S3Row[];
  gdsRowList: GDSRow[];
};

type Props = { subjectId: string };
function IGV({ subjectId }: Props) {
  // IGV init
  const igv = useQuery(['initIGV', subjectId], () => initIgv(refGenome), {});
  const igvBrowser = igv.data;

  // RefGenome seting for IGV
  const [refGenome, setRefGenome] = useState<string>('hg38');
  const handleRefGenomeChange = (newRefGenome: string) => {
    setRefGenome(newRefGenome);
    igvBrowser?.loadGenome({
      genome: newRefGenome,
    });
  };

  // Store current load IGV track data
  const [igvSubjectTrackData, setIgvSubjectTrackData] = useState<LoadSubjectDataType>({
    s3RowList: [],
    gdsRowList: [],
  });

  const handleRemoveAllTrackData = () => {
    if (!igvBrowser) return;

    const removalTrackNameList: string[] = createRemovalIgvTrackNameList(igvSubjectTrackData, {
      s3RowList: [],
      gdsRowList: [],
    });
    removeIgvLoadTrackFromName({
      trackNameList: removalTrackNameList,
      igvBrowser: igvBrowser,
    });
  };

  const handleIgvTrackDataChange = useCallback(
    async (newChange: LoadSubjectDataType) => {
      if (!igvBrowser) return;

      // Find and *remove* necessary current Track Data
      const removalTrackNameList: string[] = createRemovalIgvTrackNameList(
        igvSubjectTrackData,
        newChange
      );
      removeIgvLoadTrackFromName({ trackNameList: removalTrackNameList, igvBrowser: igvBrowser });

      // Find and *add* necessary current Track Data
      const newIgvTrackList = await createNewIgvTrackList(igvSubjectTrackData, newChange);
      await addIgvLoadTrackFromITrackList({
        iTrackList: newIgvTrackList,
        igvBrowser: igvBrowser,
      });

      // Save changes to current track data state
      setIgvSubjectTrackData(newChange);
    },
    [igvBrowser, igvSubjectTrackData]
  );

  const leftToolbarContents = (
    <>
      <Dropdown
        style={{ boxShadow: 'var(--blue-800)' }}
        options={toolbarGenomeList}
        value={refGenome}
        onChange={(e: DropdownChangeParams) => {
          handleRefGenomeChange(e.value);
        }}
        placeholder='Genome'
        className='border-blue-800 border-blue-800 m-1'
      />
      <LoadSubjectDataButton
        currentIgvTrackData={igvSubjectTrackData}
        subjectId={subjectId}
        handleIgvTrackDataChange={handleIgvTrackDataChange}
      />
      {/* <Button className='m-1 bg-blue-800 border-blue-800' label='CUSTOM' icon='pi pi-plus' /> */}
      <Button
        onClick={handleRemoveAllTrackData}
        className='m-1 p-button-outlined p-button-secondary'
        label='CLEAR ALL'
        icon='pi pi-trash'
      />
      {/* <Button
        icon='pi pi-question-circle'
        className='m-1 p-button-rounded p-button-secondary p-button-text'
        aria-label='help'
      /> */}
    </>
  );

  const rightContents = (
    <>{/* <Button label='Open in IGV Desktop' className='p-button-secondary p-button-text' /> */}</>
  );

  return (
    <>
      <div className='bg-white' style={{ minWidth: '750px' }}>
        <Toolbar left={leftToolbarContents} right={rightContents} className='p-2' />

        {igv.isLoading && (
          <ProgressBar
            className='mt-3'
            color='var(--blue-800)'
            mode='indeterminate'
            style={{ height: '2px' }}
          />
        )}

        <div id='igv-div' />
      </div>
    </>
  );
}

export default IGV;

/*************************************
 * Helper functions
 *************************************/

type ObjectWithIdType = {
  id: string | number;
} & Record<string, unknown>;
const diffArrayAlphaAndArrayBetaOnObjData = (props: {
  arrayA: ObjectWithIdType[];
  arrayB: ObjectWithIdType[];
}) => {
  const { arrayA, arrayB } = props;
  return arrayA.filter(({ id: id1 }) => !arrayB.some(({ id: id2 }) => id2 === id1));
};

/**
 * Create track name removal list from new and old state of TrackData
 * @param oldTrackData
 * @param newTrackData
 * @returns
 */
const createRemovalIgvTrackNameList = (
  oldTrackData: LoadSubjectDataType,
  newTrackData: LoadSubjectDataType
): string[] => {
  const loadTrackNameList: string[] = [];

  // Find in S3
  const s3RemovalObjectList = diffArrayAlphaAndArrayBetaOnObjData({
    arrayA: oldTrackData.s3RowList,
    arrayB: newTrackData.s3RowList,
  }) as unknown as S3Row[];
  for (const s3Row of s3RemovalObjectList) loadTrackNameList.push(getBaseNameFromKey(s3Row.key));

  // Find in GDS
  const gdsRemovalObjectList = diffArrayAlphaAndArrayBetaOnObjData({
    arrayA: oldTrackData.gdsRowList,
    arrayB: newTrackData.gdsRowList,
  }) as unknown as GDSRow[];
  for (const gdsRow of gdsRemovalObjectList)
    loadTrackNameList.push(getBaseNameFromKey(gdsRow.path));

  return loadTrackNameList;
};

/**
 * Create an ITrack type list for new loadData
 * @param oldTrackData
 * @param newTrackData
 * @returns
 */
const createNewIgvTrackList = async (
  oldTrackData: LoadSubjectDataType,
  newTrackData: LoadSubjectDataType
): Promise<ITrack[]> => {
  const newIgvLoadTrackList: ITrack[] = [];

  // Find new IGV Track Data for S3
  const newS3ObjectList = diffArrayAlphaAndArrayBetaOnObjData({
    arrayA: newTrackData.s3RowList,
    arrayB: oldTrackData.s3RowList,
  }) as unknown as S3Row[];
  for (const s3Row of newS3ObjectList)
    newIgvLoadTrackList.push(convertS3RowToHtsgetIgvTrack(s3Row));

  // Find new IGV Track Data for S3
  const newGdsObjectList = diffArrayAlphaAndArrayBetaOnObjData({
    arrayA: newTrackData.gdsRowList,
    arrayB: oldTrackData.gdsRowList,
  }) as unknown as GDSRow[];
  for (const gdsRow of newGdsObjectList) {
    const newGdsTrack = await convertGdsRowToIgvTrack(gdsRow);
    if (newGdsTrack != null) newIgvLoadTrackList.push(newGdsTrack);
  }
  return newIgvLoadTrackList;
};
