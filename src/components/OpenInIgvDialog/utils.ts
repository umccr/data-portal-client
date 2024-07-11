import { SubjectApiRes } from '../../api/subject';

export const createIndexFileFromBase = (basePath: string) => {
  if (basePath.endsWith('bam')) {
    return basePath + '.bai';
  } else if (basePath.endsWith('vcf') || basePath.endsWith('vcf.gz')) {
    return basePath + '.tbi';
  } else if (basePath.endsWith('cram')) {
    return basePath + '.crai';
  } else {
    throw new Error('No index file for this file');
  }
};

/**
 *
 * We wanted to show more info in the name parameter when opening in IGV
 * Ref: https://umccr.slack.com/archives/CP356DDCH/p1707116441928299?thread_ts=1706583808.733149&cid=CP356DDCH
 *
 * For BAM files the desired outcome is to include libraryId, sampleId, type, and filetype
 * Desired output: SBJ00000_L0000000_PRJ00000_tumor.bam
 *
 * Other than BAM
 * Desired output:  SBJ00000_MDX0000.vcf.gz
 *
 * To find the match of metadata for the specific key/path will iterate through the lims record
 * @param props
 */
export const constructIgvNameParameter = ({
  subjectData,
  pathOrKey,
}: {
  pathOrKey: string;
  subjectData: SubjectApiRes;
}): string => {
  const nameArray: string[] = [];

  const filetype = pathOrKey.split('.').pop();
  // Find sampleId from its filename
  const filename = pathOrKey.split('/').pop() ?? pathOrKey;
  const sampleId = filename.split('.').shift()?.split('_').shift() ?? filename;

  // Append subjectId if filename does not contain subjectId
  if (!filename.startsWith(subjectData.id)) {
    nameArray.push(subjectData.id);
  }

  // If it is a `bam` file it will try to figure out the appropriate libraryId
  if (filetype?.toLocaleLowerCase() == 'bam') {
    const libraryIdArray = subjectData.lims.reduce((acc, curr) => {
      const currLibId = curr.library_id;
      const currSampId = curr.sample_id;

      // do not want value to appear twice at the return array
      if (acc.includes(currLibId)) {
        return acc;
      }

      // find the matching value and push to the array
      if (currSampId == sampleId) {
        acc.push(currLibId);
      }

      return acc;
    }, [] as Array<string>);

    nameArray.push(...libraryIdArray);
  }

  // Append filename at the end
  nameArray.push(filename);

  return nameArray.join('_');
};
