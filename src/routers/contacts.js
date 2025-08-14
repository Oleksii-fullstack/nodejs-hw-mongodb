import { Router } from 'express';
import {
  getContactsController,
  getContactByIdController,
  addContactController,
  upsertContactController,
  patchContactByIdController,
  deleteContactByIdController,
} from '../controllers/contacts.js';

const contactsRouter = Router();

contactsRouter.get('/', getContactsController);

contactsRouter.get('/:contactId', getContactByIdController);

contactsRouter.post('/', addContactController);

contactsRouter.put('/:contactId', upsertContactController);

contactsRouter.patch('/:contactId', patchContactByIdController);

contactsRouter.delete('/:contactId', deleteContactByIdController);

export default contactsRouter;
