const sortOrderList = ['asc', 'desc'];

export const parseSortParams = ({ sortBy, sortOrder }, sortFields) => {
  const parsedSortOrder = sortOrderList.includes(sortOrder)
    ? sortOrder
    : sortOrderList[0];
  const parsedSortBy = sortFields.includes(sortBy) ? sortBy : '_id';

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
