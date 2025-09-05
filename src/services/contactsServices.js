import ContactCollection from '../db/models/Contact.js';

import { calcPaginationData } from '../utils/calcPaginationData.js';
import { getEnvVar } from '../utils/getEnvVar.js';

import { saveFileToPublicDir } from '../utils/saveFileToPublicDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

const enableCloudinary = getEnvVar('ENABLE_CLOUDINARY') === 'true';

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy,
  sortOrder = 'asc',
  filters = {},
}) => {
  const skip = (page - 1) * perPage;
  const query = ContactCollection.find();

  if (filters.userId) {
    query.where('userId').equals(filters.userId);
  }

  if (filters.type) {
    query.where('contactType').equals(filters.type);
  }

  if (filters.isFavourite !== undefined) {
    query.where('isFavourite').equals(filters.isFavourite);
  }

  const totalItems = await ContactCollection.find()
    .merge(query)
    .countDocuments();

  const contacts = await query
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  const paginationData = calcPaginationData({ page, perPage, totalItems });

  return {
    contacts,
    page,
    perPage,
    totalItems,
    ...paginationData,
  };
};

export const getContact = (query) => ContactCollection.findOne(query);

export const addContact = async (payload, file) => {
  let photo = null;
  if (file) {
    if (enableCloudinary) {
      photo = await saveFileToCloudinary(file);
    } else {
      photo = await saveFileToPublicDir(file);
    }
  }
  return ContactCollection.create({ ...payload, photo });
};

export const updateContact = async (query, payload, options = {}) => {
  const result = await ContactCollection.findOneAndUpdate(query, payload, {
    includeResultMetadata: true,
    ...options,
  });

  if (!result || !result.value) return null;

  const isNew = Boolean(result.lastErrorObject.upserted);

  return {
    isNew,
    contact: result.value,
  };
};

export const deleteContact = (query) =>
  ContactCollection.findOneAndDelete(query);
