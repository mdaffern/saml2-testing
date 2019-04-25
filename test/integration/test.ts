import { expect } from 'chai';
import { script } from 'lab';
import { getContext } from '../static-context';

export const lab = script();
const { describe, it } = lab;

describe('testing', () => {
  it('works', async () => {
    expect(1).to.eql(1);
  });
});
