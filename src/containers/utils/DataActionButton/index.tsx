import React, { useRef, useState, useCallback } from 'react';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';

import { isIgvReadableFile } from '../../subjects/IGV/LoadSubjectDataButton';
import { constructGDSUrl } from '../../../api/gds';
import { useToastContext } from '../../../providers/ToastProvider';
import RestoreArchiveObjectDialog from '../../../components/RestoreArchiveObjectDialog';
import GeneratePresignedDialog from '../../../components/GeneratePresignedDialog';
import OpenIGVDesktopDialog from '../../../components/OpenInIgvDialog';
import { IFRAME_FILETYPE_LIST, IMAGE_FILETYPE_LIST } from '../../../components/ViewPresignedUrl';
import { OpenInNewTab } from '../../../components/OpenInNewTab';

export enum DataAction {
  NONE,
  COPY_URI,
  GENERATE_PRESIGN,
  RESTORE_OBJECT,
  OPEN_IGV_DESKTOP,
  OPEN_IN_NEW_TAB,
}

export type DataActionButtonProps = {
  id: number;
  type: 's3' | 'gds';
  pathOrKey: string;
  bucketOrVolume: string;
  enforceIgvPresignedMode?: boolean;
  isDisableObjectRestore?: boolean;
};

function DataActionButton(props: DataActionButtonProps) {
  const { toastShow } = useToastContext();
  const { bucketOrVolume, pathOrKey, type, isDisableObjectRestore } = props;

  const [actionSelected, setActionSelected] = useState<DataAction>(DataAction.NONE);
  const handleCloseActionSelected = useCallback(() => setActionSelected(DataAction.NONE), []);
  const handleNeedRestoreActionSelected = useCallback(
    () => setActionSelected(DataAction.RESTORE_OBJECT),
    []
  );
  const menu = useRef<Menu>(null);
  const items: MenuItem[] = [
    {
      label: 'Copy URI',
      icon: 'pi pi-copy',
      command: () => {
        let uri = '';
        if (type == 's3') {
          uri = `s3://${bucketOrVolume}/${pathOrKey}`;
        } else if (type == 'gds') {
          uri = constructGDSUrl({ volume_name: bucketOrVolume, path: pathOrKey });
        }
        navigator.clipboard.writeText(uri);
        toastShow({
          severity: 'success',
          summary: 'Key/Path Copied',
          life: 3000,
        });
      },
    },
  ];

  // no download link for bam
  if (!pathOrKey.endsWith('.bam')) {
    // TODO no download link for fastq.gz on s3 for now - need to discuss egress policy ~victor
    if (!(type == 's3' && pathOrKey.endsWith('.fastq.gz'))) {
      items.push({
        label: 'Generate Download Link',
        icon: 'pi pi-link',
        command: () => {
          setActionSelected(DataAction.GENERATE_PRESIGN);
        },
      });
    }
  }

  if (pathOrKey.endsWith('.bam') && type == 's3' && !isDisableObjectRestore) {
    items.push({
      label: 'Check and Restore Object',
      icon: 'pi pi-history',
      command: () => {
        setActionSelected(DataAction.RESTORE_OBJECT);
      },
    });
  }

  if (isIgvReadableFile(pathOrKey)) {
    items.push({
      label: 'Open IGV Desktop',
      icon: <img src={'/igv.png'} alt='igv.png' width='14px' height='14px' className='mr-2' />,
      command: () => {
        setActionSelected(DataAction.OPEN_IGV_DESKTOP);
      },
    });
  }

  const filetype = pathOrKey.split('.').pop() ?? '';
  if (IFRAME_FILETYPE_LIST.includes(filetype) || IMAGE_FILETYPE_LIST.includes(filetype)) {
    items.push({
      label: 'Open In New Tab',
      icon: 'pi pi-external-link',
      command: () => {
        setActionSelected(DataAction.OPEN_IN_NEW_TAB);
      },
    });
  }

  return (
    <div>
      <Menu style={{ minWidth: '225px' }} model={items} popup ref={menu} id='popup_menu' />
      <div className='cursor-pointer pi pi-bars' onClick={(event) => menu.current?.toggle(event)} />
      {actionSelected == DataAction.GENERATE_PRESIGN ? (
        <GeneratePresignedDialog {...props} handleClose={handleCloseActionSelected} />
      ) : actionSelected == DataAction.OPEN_IGV_DESKTOP ? (
        <OpenIGVDesktopDialog
          {...props}
          handleClose={handleCloseActionSelected}
          handleNeedRestore={handleNeedRestoreActionSelected}
        />
      ) : actionSelected == DataAction.RESTORE_OBJECT ? (
        <RestoreArchiveObjectDialog {...props} handleClose={handleCloseActionSelected} />
      ) : actionSelected == DataAction.OPEN_IN_NEW_TAB ? (
        <OpenInNewTab {...props} filetype={filetype} handleClose={handleCloseActionSelected} />
      ) : (
        <></>
      )}
    </div>
  );
}

export default DataActionButton;
