import React from 'react';

// Custom component
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useToastContext } from '../../../providers/ToastProvider';
import JSONToTable from '../../../components/JSONToTable';
import { usePortalSubjectDataAPI } from '../../../api/subject';

const OVERVIEW_COLUMN = [
  'subject_id',
  'external_subject_id',
  'illumina_id',
  'project_name',
  'project_owner',
  'workflow',
  'timestamp',
];

type JsonOfArrayType = { [key: string]: (string | number)[] };
type Props = { subjectId: string };

function SubjectOverviewTable(props: Props) {
  const { subjectId } = props;
  let subjectOverview: JsonOfArrayType = {};

  const toast = useToastContext();

  const { isLoading, isError, data } = usePortalSubjectDataAPI(subjectId);

  if (isLoading) {
    return <CircularLoaderWithText />;
  }

  if (isError) {
    toast?.show({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: 'Unable to fetch data from Portal API',
      life: 3000,
    });
  }
  if (data && !isLoading) {
    subjectOverview = convertArrayOfJsonToJsonOfArray(data.lims);
  }

  return (
    <div>
      <JSONToTable objData={subjectOverview} />
    </div>
  );
}

export default SubjectOverviewTable;

/**
 * This function will convert from array of JSON object to JSON of array. (See example)
 * Example: [{'name':'John'}, {'name':'Doe'}] to {'name':['John','Doe']}
 * @param jsonArray Array of JSON
 */
function convertArrayOfJsonToJsonOfArray(jsonArray: { [key: string]: string | number }[]) {
  const JsonOfArray: { [key: string]: (string | number)[] } = {};

  for (const object of jsonArray) {
    for (const column of OVERVIEW_COLUMN) {
      const objectVal = object[column];
      if (JsonOfArray[column]) {
        JsonOfArray[column].push(objectVal);
      } else {
        JsonOfArray[column] = [objectVal];
      }
    }
  }

  // Removing any duplicates in the JSON
  for (const column of OVERVIEW_COLUMN) {
    if (JsonOfArray[column]) {
      JsonOfArray[column] = [...new Set(JsonOfArray[column])];
    }
  }

  return JsonOfArray;
}
