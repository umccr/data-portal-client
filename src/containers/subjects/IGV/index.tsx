import React, { useState, useCallback, useEffect } from 'react';
import { ITrack } from 'igv';
import { useQuery } from 'react-query';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';

import LoadSubjectDataButton from './LoadSubjectDataButton';
import { GDSRow } from '../../../api/gds';
import { S3Row } from '../../../api/s3';
import {
  initIgv,
  convertGdsRowToIgvTrack,
  convertS3RowToHtsgetIgvTrack,
  removeIgvLoadTrackFromName,
  addIgvLoadTrackFromITrackList,
  RequiredS3RowType,
  RequiredGDSRowType,
} from './utils';
import LoadCustomTrackDataButton from './LoadCustomTrackDataButton';
import { getJwtToken } from '../../../utils/signer';
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { SubjectApiRes, usePortalSubjectDataAPI } from '../../../api/subject';
import { useToastContext } from '../../../providers/ToastProvider';
import { constructIgvNameParameter } from '../../../components/OpenInIgvDialog/utils';

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
  const { toastShow } = useToastContext();

  const {
    isLoading: isSubjectLoading,
    isError: subjectIsError,
    error: subjectError,
    data: subjectData,
  } = usePortalSubjectDataAPI(subjectId);

  // IGV init
  const igv = useQuery(
    ['initIGV', subjectId],
    () =>
      initIgv({
        initRefGenome: refGenome,
        oAuthToken: getJwtToken().toString(),
      }),
    {
      refetchOnMount: true,
    }
  );
  const igvBrowser = igv.data;

  // RefGenome setting for IGV
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

  const handleIgvTrackDataChange = useCallback(
    async (newChange: LoadSubjectDataType) => {
      if (!igvBrowser) return;

      // Find and *remove* necessary current Track Data
      const removalTrackNameList: string[] = createRemovalIgvTrackNameList({
        subjectData: subjectData!,
        oldTrackData: igvSubjectTrackData,
        newTrackData: newChange,
      });
      removeIgvLoadTrackFromName({ trackNameList: removalTrackNameList, igvBrowser: igvBrowser });

      // Find and *add* necessary current Track Data
      const newIgvTrackList = await createNewIgvTrackList({
        subjectData: subjectData!,
        oldTrackData: igvSubjectTrackData,
        newTrackData: newChange,
      });
      await addIgvLoadTrackFromITrackList({
        iTrackList: newIgvTrackList,
        igvBrowser: igvBrowser,
      });

      // Save changes to current track data state
      setIgvSubjectTrackData(newChange);
    },
    [igvBrowser, igvSubjectTrackData, subjectData]
  );

  // Custom State and Handler
  const [customTrackDataNameList, setCustomTrackDataNameList] = useState<string[]>([]);
  const handleCustomIgvS3TrackDataChange = useCallback(
    async (s3Row: RequiredS3RowType) => {
      if (!igvBrowser) return;

      const igvName = constructIgvNameParameter({
        pathOrKey: s3Row.key,
        subjectData: subjectData!,
      });

      const newCustomLoadTrack = convertS3RowToHtsgetIgvTrack({ s3Row, igvName });
      if (newCustomLoadTrack) {
        await addIgvLoadTrackFromITrackList({
          iTrackList: [newCustomLoadTrack],
          igvBrowser: igvBrowser,
        });
      }

      setCustomTrackDataNameList((prev) => [...prev, igvName]);
    },
    [igvBrowser, subjectData]
  );

  const handleCustomIgvGDSTrackDataChange = useCallback(
    async (gdsRow: RequiredGDSRowType) => {
      if (!igvBrowser) return;

      const igvName = constructIgvNameParameter({
        pathOrKey: gdsRow.path,
        subjectData: subjectData!,
      });

      const newCustomLoadTrack = await convertGdsRowToIgvTrack({
        gdsRow,
        igvName,
      });
      if (newCustomLoadTrack) {
        await addIgvLoadTrackFromITrackList({
          iTrackList: [newCustomLoadTrack],
          igvBrowser: igvBrowser,
        });
      }

      setCustomTrackDataNameList((prev) => [...prev, igvName]);
    },
    [igvBrowser, subjectData]
  );

  // Handle remove IGV trackdata
  const handleRemoveAllTrackData = () => {
    if (!igvBrowser) return;

    let removalTrackNameList: string[] = createRemovalIgvTrackNameList({
      subjectData: subjectData!,
      oldTrackData: igvSubjectTrackData,
      newTrackData: {
        s3RowList: [],
        gdsRowList: [],
      },
    });

    if (customTrackDataNameList.length) {
      removalTrackNameList = [...removalTrackNameList, ...customTrackDataNameList];
    }
    removeIgvLoadTrackFromName({
      trackNameList: removalTrackNameList,
      igvBrowser: igvBrowser,
    });
    setIgvSubjectTrackData({
      s3RowList: [],
      gdsRowList: [],
    });
  };

  // IsError handling
  useEffect(() => {
    if (subjectError && subjectIsError) {
      toastShow({
        severity: 'error',
        summary: 'Error on retrieving subject data.',
        detail: `${subjectError}`,
        sticky: true,
      });
    }
  }, [subjectError, subjectIsError]);

  const leftToolbarContents = (
    <>
      <Dropdown
        style={{ boxShadow: 'var(--primary-800)' }}
        options={toolbarGenomeList}
        value={refGenome}
        onChange={(e: DropdownChangeEvent) => {
          handleRefGenomeChange(e.value);
        }}
        placeholder='Genome'
        className='border-primary-800 border-primary-800 m-1'
      />
      <LoadSubjectDataButton
        currentIgvTrackData={igvSubjectTrackData}
        subjectId={subjectId}
        handleIgvTrackDataChange={handleIgvTrackDataChange}
      />
      <LoadCustomTrackDataButton
        handleAddCustomS3LoadTrack={handleCustomIgvS3TrackDataChange}
        handleAddCustomGDSLoadTrack={handleCustomIgvGDSTrackDataChange}
      />
      <Button
        onClick={handleRemoveAllTrackData}
        className='m-1 p-button-secondary'
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
    <>
      {/* <Button
        onClick={() => console.log('opening local IGV')}
        label='Open in IGV Desktop'
        className='p-button-secondary p-button-text'
      /> */}
    </>
  );

  return (
    <>
      {(isSubjectLoading || !subjectData) && (
        <Dialog
          visible={true}
          showHeader={false}
          style={{ width: '50vw' }}
          draggable={false}
          resizable={false}
          closable={false}
          onHide={() => {}}>
          <CircularLoaderWithText text='retrieving subject data' />
        </Dialog>
      )}
      <div className='bg-white'>
        <Toolbar start={leftToolbarContents} end={rightContents} className='p-2' />

        {igv.isLoading && (
          <ProgressBar
            className='mt-3'
            color='var(--primary-800)'
            mode='indeterminate'
            style={{ height: '2px' }}
          />
        )}

        <div id='igv-div' />
        <div className='text-xs mt-5'>
          Note: IGV in browser may not fill the given space properly. Try resizing the browser
          window to solve this problem.
        </div>
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
const createRemovalIgvTrackNameList = ({
  subjectData,
  oldTrackData,
  newTrackData,
}: {
  subjectData: SubjectApiRes;
  oldTrackData: LoadSubjectDataType;
  newTrackData: LoadSubjectDataType;
}): string[] => {
  const loadTrackNameList: string[] = [];

  // Find in S3
  const s3RemovalObjectList = diffArrayAlphaAndArrayBetaOnObjData({
    arrayA: oldTrackData.s3RowList,
    arrayB: newTrackData.s3RowList,
  }) as unknown as S3Row[];
  for (const s3Row of s3RemovalObjectList) {
    const name = constructIgvNameParameter({
      pathOrKey: s3Row.key,
      subjectData: subjectData!,
    });
    loadTrackNameList.push(name);
  }

  // Find in GDS
  const gdsRemovalObjectList = diffArrayAlphaAndArrayBetaOnObjData({
    arrayA: oldTrackData.gdsRowList,
    arrayB: newTrackData.gdsRowList,
  }) as unknown as GDSRow[];
  for (const gdsRow of gdsRemovalObjectList) {
    const name = constructIgvNameParameter({
      pathOrKey: gdsRow.path,
      subjectData: subjectData!,
    });
    loadTrackNameList.push(name);
  }

  return loadTrackNameList;
};

/**
 * Create an ITrack type list for new loadData
 * @param oldTrackData
 * @param newTrackData
 * @returns
 */
const createNewIgvTrackList = async ({
  subjectData,
  oldTrackData,
  newTrackData,
}: {
  subjectData: SubjectApiRes;
  oldTrackData: LoadSubjectDataType;
  newTrackData: LoadSubjectDataType;
}): Promise<ITrack[]> => {
  const newIgvLoadTrackList: ITrack[] = [];

  // Find new IGV Track Data for S3
  const newS3ObjectList = diffArrayAlphaAndArrayBetaOnObjData({
    arrayA: newTrackData.s3RowList,
    arrayB: oldTrackData.s3RowList,
  }) as unknown as S3Row[];
  for (const s3Row of newS3ObjectList) {
    const igvName = constructIgvNameParameter({
      pathOrKey: s3Row.key,
      subjectData: subjectData!,
    });

    const newS3Itrack = convertS3RowToHtsgetIgvTrack({ s3Row, igvName });
    if (newS3Itrack != null) newIgvLoadTrackList.push(newS3Itrack);
  }

  // Find new IGV Track Data for GDS
  const newGdsObjectList = diffArrayAlphaAndArrayBetaOnObjData({
    arrayA: newTrackData.gdsRowList,
    arrayB: oldTrackData.gdsRowList,
  }) as unknown as GDSRow[];
  for (const gdsRow of newGdsObjectList) {
    const igvName = constructIgvNameParameter({
      pathOrKey: gdsRow.path,
      subjectData: subjectData!,
    });

    const newGdsTrack = await convertGdsRowToIgvTrack({ gdsRow, igvName });
    if (newGdsTrack != null) newIgvLoadTrackList.push(newGdsTrack);
  }
  return newIgvLoadTrackList;
};
