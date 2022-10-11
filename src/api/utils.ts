export type DjangoRestApiResponse = {
  links: { next: string | null; previous: string | null };
  pagination: {
    count: number;
    page: number;
    rowsPerPage: number;
  };
  results: unknown[];
};

export const getBaseNameFromKey = (key: string) => {
  return key.split('/')[key.split('/').length - 1];
};
