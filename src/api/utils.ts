export type DjangoRestApiResponse = {
  links: { next: string | null; previous: string | null };
  pagination: {
    count: number;
    page: number;
    rowsPerPage: number;
  };
  results: unknown[];
};
