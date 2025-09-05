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
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const contactsRouter = Router();

contactsRouter.use(authenticate);

contactsRouter.get('/', getContactsController);

contactsRouter.get('/:contactId', isValidId, getContactByIdController);

contactsRouter.post(
  '/',
  // upload.fields([   <--- якщо кілька полів з файлами
  //   {
  //     name: 'photo',
  //     maxCount: 2,
  //   },
  //   {
  //     name: 'poster',
  //     maxCount: 4,
  //   },
  // ]),
  // upload.array('photo', 4),  <--- якщо в 1 полі кілька файлів
  upload.single('photo'), // <-- якщо 1 поле і 1 файл | записуємо Перед validate
  validateBody(contactAddSchema),
  addContactController,
);

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
