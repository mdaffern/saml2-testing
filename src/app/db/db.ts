import * as uuidv3 from 'uuid/v3';
import { Dao, Db, SamlConfig } from '../common-types';
import { filter } from '../primitive/generators';
import { findOne } from '../primitive/iterable';
import { hashAny } from '../primitive/hash';
import { secret } from '../app-const';
import { User } from '../http/user-routes';

// const users: User[] = new Array(100).fill(0).map((_, i) => {
//   return {
//     id: i + 10,
//     uuid: uuidv3('' + i, secret),
//     name: 'name' + i,
//     email: 'name' + i + '@email.tld',
//     hashword: hashAny('password' + i)
//   };
// });

// These match the test injestion file in the hello401-backend project.
const users = [
  { id: 2, uuid: '2e5e4dcf3f62496093eb88d5b69322d0', hashword: hashAny('pass'), name: 'u2', email: 'u2@email.tld' },
  { id: 5, uuid: '59ca243f491b483582584135db46c7db', hashword: hashAny('pass'), name: 'u5', email: 'u5@email.tld' },
  { id: 7, uuid: '710f04888b26417ab6df2a55cfb4438c', hashword: hashAny('pass'), name: 'u7', email: 'u7@email.tld' },
  { id: 4, uuid: '9c9d27911a734382bac255935fe531fd', hashword: hashAny('pass'), name: 'u4', email: 'u4@email.tld' },
  { id: 3, uuid: '9d5d98bae65d4afc8d82c659deaeafa4', hashword: hashAny('pass'), name: 'u3', email: 'u3@email.tld' },
  { id: 8, uuid: 'b5764bc65654405bb7f821dac6365d5b', hashword: hashAny('pass'), name: 'u8', email: 'u8@email.tld' },
  { id: 6, uuid: 'e650c8b5d6c843f0be11bbaf75a44302', hashword: hashAny('pass'), name: 'u6', email: 'u6@email.tld' },
  { id: 1, uuid: 'eecce9fdbaf7453990e20c05338ffd4b', hashword: hashAny('pass'), name: 'u1', email: 'u1@email.tld' }
];

function makeUsersDao() {
  const usersMap = new Map<string, User>();

  const userDao: Dao<User> = {
    findOne(p) {
      return findOne(usersMap.values(), p);
    },
    findAll(p) {
      return [...filter(usersMap.values(), p)];
    },
    add(user) {
      usersMap.set(user.uuid, user);
      return userDao;
    },
    remove(user) {
      usersMap.delete(user.uuid);
      return userDao;
    }
  };
  return userDao;
}

export function makeDb(): Db {
  const usersDao = makeUsersDao();
  const db: Db = {
    users: usersDao,
    ssoRequests: new Map<string, SamlConfig>(),
    sessionStorage: new Map<string, any>()
  };

  users.forEach(u => db.users.add(u));
  return db;
}
