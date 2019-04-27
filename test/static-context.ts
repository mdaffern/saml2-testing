import { mergeContext } from '../src/app/saml/merge-context';

// Only create the context objects once
const promise = mergeContext().then((c) => {
  return c;
});

// Load some data for testing
export const getContext = () => promise;
