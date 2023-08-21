import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

type ObjectType = { [key: string]: (string | number | boolean | null) | (string | number)[] };

type Props = {
  objData: ObjectType;
  customDivMapping?: {
    [key: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  };
};

// Type for Data Table show
type rowDataType = {
  key: string;
  value: string | number | (string | number)[];
};

function JSONToTable(props: Props) {
  const { objData, customDivMapping } = props;

  const fieldArray = convertObjToKeyValueArray(objData);

  // Template for object printed in table
  const keyTemplate = (rowData: rowDataType) => {
    return <div className='font-semibold uppercase white-space-nowrap'>{rowData.key}</div>;
  };
  const valTemplate = (rowData: rowDataType) => {
    const key = rowData.key;

    // Additional props could be passed. UseCase: Could allow specific text to have hyperlink
    let additionalDivProps = {};
    if (customDivMapping) {
      if (customDivMapping[key]) {
        additionalDivProps = { ...customDivMapping[key] };
      }
    }

    if (Array.isArray(rowData.value)) {
      return (
        <>
          {rowData.value.map((item, index) => {
            return (
              <div key={index} id={index.toString()} {...additionalDivProps}>
                {item}
              </div>
            );
          })}
        </>
      );
    } else {
      return <div {...additionalDivProps}>{rowData.value}</div>;
    }
  };

  return (
    <DataTable value={fieldArray}>
      <Column
        headerStyle={{ display: 'none' }}
        style={{ padding: '0.5rem 1rem' }}
        field='key'
        body={keyTemplate}
      />
      <Column
        headerStyle={{ display: 'none' }}
        style={{ padding: '0.5rem 1rem' }}
        field='value'
        body={valTemplate}
      />
    </DataTable>
  );
}

export default JSONToTable;

/**
 * This conversion is needed in order to use DataTable PrimeReact.
 * Values are accepted in a form of array instead of JSON
 * @param objData the Object passed in to the function
 * @returns The value needed for the DataTable value field
 */
function convertObjToKeyValueArray(objData: ObjectType) {
  const keyList = Object.keys(objData);

  const keyValue = [];

  for (const keyString of keyList) {
    const value = objData[keyString];
    keyValue.push({
      key: keyString,
      value: value,
    });
  }
  return keyValue;
}
