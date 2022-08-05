import React from 'react';
import IGV from '../../../containers/subjects/IGV';
import { useParams } from 'react-router-dom';

function SubjectIGVPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No SubjectId found</div>;
  }

  return (
    <div>
      <IGV subjectId={subjectId} />
    </div>
  );
}

export default SubjectIGVPage;
