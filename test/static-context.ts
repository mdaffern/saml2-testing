import { mergeContext } from '../src/app/merge-context';
import { users } from './fixtures';

// Only create the context objects once
const promise = mergeContext().then((c) => {
  const allUsers = users;
  const halfUsers = users.slice(50);

  // Load the db's
  halfUsers.forEach(u => c.sp.db.users.set(u.id, u));
  allUsers.forEach(u => c.sp.db.users.set(u.id, u));
  return c;
});

// Load some data for testing
export const getContext = () => promise;
