import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'primereact/card';

import { Button } from 'primereact/button';

import './index.css';
import SubjectGPLLaunch from '../../../containers/subjects/SubjectGPLLaunch';

function SubjectLaunchPad() {
  const { subjectId } = useParams();

  const launchPadOptions = [
    { label: 'GRIDSS PURPLE LINX (GPL)', key: 'gpl' },
    { label: 'RNAsum', key: 'rna-sum' },
  ];
  const [selectedKey, setSelectedKey] = useState<string>('');

  return (
    <div>
      <Card>
        {/* What to trigger? */}
        {selectedKey == 'gpl' ? (
          <SubjectGPLLaunch />
        ) : (
          <div className='h-full'>
            <div className='text-2xl font-medium mb-4'>Report trigger</div>

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
      </Card>
    </div>
  );
}

export default SubjectLaunchPad;
