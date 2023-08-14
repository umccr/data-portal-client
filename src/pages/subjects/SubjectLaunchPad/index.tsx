import React from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';

import { Button } from 'primereact/button';

import SubjectGPLLaunch from '../../../containers/subjects-launch/SubjectGPLLaunch';
import SubjectRNASumLaunch from '../../../containers/subjects-launch/SubjectRNASumLaunch';
import SubjectWGSTNLaunch from '../../../containers/subjects-launch/SubjectWGSTNLaunch';

export enum launchPadOptions {
  NONE = '',
  RNASUM = 'rna-sum',
  GPL = 'gpl',
  WGS_TN = 'wgs-tn',
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
  const location = useLocation();
  const navigate = useNavigate();

  const lastPath = location.pathname.split('/').pop();

  return (
    <div>
      <Card>
        <div className='relative'>
          <div className='pt-2'>
            {/* What to trigger? */}
            {lastPath == launchPadOptions.GPL ? (
              <SubjectGPLLaunch subjectId={subjectId} />
            ) : lastPath == launchPadOptions.RNASUM ? (
              <SubjectRNASumLaunch subjectId={subjectId} />
            ) : lastPath == launchPadOptions.WGS_TN ? (
              <SubjectWGSTNLaunch subjectId={subjectId} />
            ) : (
              <div className='h-full'>
                <div className='text-2xl font-medium mb-4'>{subjectId} - Report trigger</div>

                {launchPadLabel.map((option) => {
                  return (
                    <div key={option.key} className='mb-3'>
                      <Button
                        onClick={() => navigate(option.key)}
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
