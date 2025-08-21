const parseString = (str) => {
  if (typeof str !== 'string') return;

  return str;
};

const parseBoolean = (value) => {
  if (typeof value !== 'string') return;

  const parsedValue = value.trim().toLowerCase();
  if (parsedValue === 'true' || parsedValue === '1') return true;
  if (parsedValue === 'false' || parsedValue === '0') return false;

  return;
};

export const parseContactFilters = ({ type, isFavourite }) => {
  const parsedType = parseString(type);
  const parsedIsFavourite = parseBoolean(isFavourite);

  return {
    type: parsedType,
    isFavourite: parsedIsFavourite,
  };
};
