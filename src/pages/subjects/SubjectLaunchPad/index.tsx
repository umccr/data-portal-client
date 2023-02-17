import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card } from 'primereact/card';

import { Button } from 'primereact/button';

import SubjectGPLLaunch from '../../../containers/subjects/SubjectGPLLaunch';
import SubjectRNASumLaunch from '../../../containers/subjects/SubjectRNASumLaunch';
import SubjectWGSTNLaunch from '../../../containers/subjects/SubjectWGSTNLaunch';

export enum launchPadOptions {
  NONE = '',
  RNASUM = 'rna-sum',
  GPL = 'gpl',
  WGS_TN = 'wgs-t/n',
}

export default function SubjectLaunchPad() {
  const { subjectId } = useParams();
  if (!subjectId) {
    return <Navigate to='/subjects' replace={true} />;
  }

  const launchPadLabel = [
    { key: launchPadOptions.GPL, label: 'GRIDSS PURPLE LINX (GPL)' },
    { key: launchPadOptions.RNASUM, label: 'RNAsum' },
    { key: launchPadOptions.WGS_TN, label: 'Whole-Genome Sequencing Tumor-Normal (WGS T/N)' },
  ];
  const [selectedKey, setSelectedKey] = useState<launchPadOptions>(launchPadOptions.WGS_TN);

  return (
    <div>
      <Card>
        <div className='relative'>
          {selectedKey ? (
            <Button
              icon='pi pi-arrow-circle-left'
              onClick={() => setSelectedKey(launchPadOptions.NONE)}
              className='text-600 p-button-info p-button-text absolute right-0 top-0'
            />
          ) : (
            <></>
          )}
          <div className='pt-2 pr-5'>
            {/* What to trigger? */}
            {selectedKey == launchPadOptions.GPL ? (
              <SubjectGPLLaunch subjectId={subjectId} />
            ) : selectedKey == launchPadOptions.RNASUM ? (
              <SubjectRNASumLaunch subjectId={subjectId} />
            ) : selectedKey == launchPadOptions.WGS_TN ? (
              <SubjectWGSTNLaunch subjectId={subjectId} />
            ) : (
              <div className='h-full'>
                <div className='text-2xl font-medium mb-4'>{subjectId} - Report trigger</div>

                {launchPadLabel.map((option) => {
                  return (
                    <div key={option.key} className='mb-3'>
                      <Button
                        onClick={() => setSelectedKey(option.key)}
                        label={option.label}
                        className='w-full p-button-outlined p-button-secondary'
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
