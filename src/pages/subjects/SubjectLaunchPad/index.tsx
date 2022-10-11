import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card } from 'primereact/card';

import { Button } from 'primereact/button';

import SubjectGPLLaunch from '../../../containers/subjects/SubjectGPLLaunch';
import SubjectRNASumLaunch from '../../../containers/subjects/SubjectRNASumLaunch';

function SubjectLaunchPad() {
  const { subjectId } = useParams();
  if (!subjectId) {
    return <Navigate to='/subjects' replace={true} />;
  }

  const launchPadOptions = [
    { label: 'GRIDSS PURPLE LINX (GPL)', key: 'gpl' },
    { label: 'RNAsum', key: 'rna-sum' },
  ];
  const [selectedKey, setSelectedKey] = useState<string>('');

  return (
    <div>
      <Card>
        <div className='relative'>
          {selectedKey ? (
            <Button
              icon='pi pi-arrow-circle-left'
              onClick={() => setSelectedKey('')}
              className='text-600 p-button-info p-button-text absolute right-0 top-0'
            />
          ) : (
            <></>
          )}
          <div className='pt-2'>
            {/* What to trigger? */}
            {selectedKey == 'gpl' ? (
              <SubjectGPLLaunch subjectId={subjectId} />
            ) : selectedKey == 'rna-sum' ? (
              <SubjectRNASumLaunch subjectId={subjectId} />
            ) : (
              <div className='h-full'>
                <div className='text-2xl font-medium mb-4'>{subjectId} - Report trigger</div>

                {launchPadOptions.map((option) => {
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

export default SubjectLaunchPad;
