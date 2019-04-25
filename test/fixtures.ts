import uuidv3 from 'uuid/v3';

const uuidSeed = ['dsdfasdfasd', '1234'];

export const users = new Array(100).fill(0).map((v, i) => {
  return {
    id: uuidv3(uuidSeed[0], uuidSeed[1]),
    name: 'name' + i
  };
});
