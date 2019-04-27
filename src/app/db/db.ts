import * as uuidv3 from 'uuid/v3';
import { Dao, Db, SamlConfig } from '../common-types';
import { filter } from '../primitive/generators';
import { findOne } from '../primitive/iterable';
import { hashAny } from '../primitive/hash';
import { secret } from '../app-const';
import { string } from 'joi';
import { User } from '../http/user-routes';

export const users: User[] = new Array(100).fill(0).map((_, i) => {
  return {
    id: i,
    uuid: uuidv3('' + i, secret),
    name: 'name' + i,
    email: 'name' + i + '@email.tld',
    hashword: hashAny('password' + i)
  };
});

function makeUsersDao() {
  const usersMap = new Map<string, User>();

  const userDao: Dao<User> = {
    findOne(p) {
      return findOne(users.values(), p);
    },
    findAll(p) {
      return [...filter(users.values(), p)];
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
