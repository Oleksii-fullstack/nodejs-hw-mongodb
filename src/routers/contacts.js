import { Router } from 'express';

import {
  getContactsController,
  getContactByIdController,
  addContactController,
  upsertContactController,
  patchContactByIdController,
  deleteContactByIdController,
} from '../controllers/contacts.js';
import {
  contactAddSchema,
  contactUpdateSchema,
} from '../validation/contactSchemas.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';

const contactsRouter = Router();

contactsRouter.get('/', getContactsController);

contactsRouter.get('/:contactId', isValidId, getContactByIdController);

contactsRouter.post('/', validateBody(contactAddSchema), addContactController);

contactsRouter.put(
  '/:contactId',
  isValidId,
  validateBody(contactAddSchema),
  upsertContactController,
);

contactsRouter.patch(
  '/:contactId',
  isValidId,
  validateBody(contactUpdateSchema),
  patchContactByIdController,
);

contactsRouter.delete('/:contactId', isValidId, deleteContactByIdController);

export default contactsRouter;
