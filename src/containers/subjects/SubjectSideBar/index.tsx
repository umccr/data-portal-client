import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ListBox, ListBoxChangeParams } from 'primereact/listbox';

const sidebarMapping = [
  { postfixPath: 'overview', label: 'Overview' },
  { postfixPath: 'subject-data', label: 'Subject Data' },
  { postfixPath: 'igv', label: 'IGV' },
  { postfixPath: 'file-viewer', label: 'File Viewer' },
  { postfixPath: 'launch-pad', label: 'Launch Pad' },
];

function SubjectSideBar() {
  const selectedPage = findPostfixPath();
  const navigate = useNavigate();

  const handleOnChangeListPage = (e: ListBoxChangeParams) => {
    const sidebarObject = e.value; // Possibility of null when clicked the current page
    if (sidebarObject) {
      navigate(`${sidebarObject.postfixPath}`);
    }
  };

  return (
    <div className='flex flex-column'>
      {/* Sidebar Title */}
      <div
        id='subject-sidebar-title'
        className='font-bold text-3xl border-bottom-1 border-gray-300'
        style={{ padding: '0.5rem 0 1.5rem' }}>
        Subject
      </div>

      <ListBox
        value={selectedPage}
        options={sidebarMapping}
        onChange={handleOnChangeListPage}
        optionLabel='label'
        className='border-none'
      />
    </div>
  );
}

export default SubjectSideBar;

/**
 * Helper Function
 */
const findPostfixPath = () => {
  let currentPath = useLocation().pathname;
  let lastSlashIndex = currentPath.lastIndexOf('/');
  // Remove trailing slash ('/')
  if (lastSlashIndex == currentPath.length - 1) {
    currentPath = currentPath.substring(0, lastSlashIndex);
    lastSlashIndex = currentPath.lastIndexOf('/');
  }

  // Find the last path of URL
  const lastPath = currentPath.substring(lastSlashIndex + 1);

  // Return the path from the mapping
  for (const mappingConstant of sidebarMapping) {
    const postfixPath = mappingConstant.postfixPath;

    if (postfixPath == lastPath) return mappingConstant;
  }
};
