import React from 'react';
import FileViewer from '../../../containers/subjects/FileViewer';
import { useParams } from 'react-router-dom';
function SubjectFileViewerPage() {
  const { subjectId } = useParams();

  if (!subjectId) {
    return <div>No SubjectId found</div>;
  }

  return (
    <div style={{ height: 'calc(100vh - 8rem)' }}>
      <FileViewer subjectId={subjectId} />
    </div>
  );
}

export default SubjectFileViewerPage;
