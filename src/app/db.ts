import { User } from "./user-routes";
import { Db } from "./common-types";

export function makeDb(): Db {
  return { users: new Map<string, User>() };
}
