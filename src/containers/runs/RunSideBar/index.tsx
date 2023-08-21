import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ListBox, ListBoxChangeParams } from 'primereact/listbox';

const sidebarMapping = [
  // { postfixPath: 'overview', label: 'Overview' },
  { postfixPath: 'primary-data', label: 'Primary Data' },
  { postfixPath: 'lims', label: 'LIMS' },
];

function RunSideBar() {
  const selectedPage = findPostfixPath();
  const navigate = useNavigate();

  const handleOnChangeListPage = (e: ListBoxChangeParams) => {
    const sidebarObject = e.value; // Possibility of null when clicked the current page
    if (sidebarObject) {
      navigate(`${sidebarObject.postfixPath}`);
    }
  };

  const itemTemplate = (option: { postfixPath: string; label: string }) => {
    return (
      // Will wrap in an '<a>' tag (with href) to get the benefit open in new tab/window from right-click
      <a href={option.postfixPath} style={{ all: 'unset' }}>
        <div>{option.label}</div>
      </a>
    );
  };

  return (
    <div className='flex flex-column'>
      {/* Sidebar Title */}
      <div
        id='subject-sidebar-title'
        className='cursor-pointer font-bold text-3xl border-bottom-1 border-gray-300'
        style={{ padding: '1.5rem 1.5rem 1.5rem' }}>
        <a href={`../`} style={{ all: 'unset' }}>
          Run
        </a>
      </div>

      <ListBox
        value={selectedPage}
        options={sidebarMapping}
        onChange={handleOnChangeListPage}
        itemTemplate={itemTemplate}
        className='border-none'
      />
    </div>
  );
}

export default RunSideBar;

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
