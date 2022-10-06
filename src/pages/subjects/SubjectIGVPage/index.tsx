import React from 'react';
import IGV from '../../../containers/subjects/IGV';
import { Card } from 'primereact/card';
import { useParams } from 'react-router-dom';

function SubjectIGVPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No SubjectId found</div>;
  }

  return (
    <div style={{ minWidth: '750px' }}>
      <Card>
        <IGV subjectId={subjectId} />
      </Card>
    </div>
  );
}

export default SubjectIGVPage;
