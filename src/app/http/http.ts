import * as Cookie from '@hapi/cookie';
import * as Ejs from 'ejs';
import * as HapiSwagger from 'hapi-swagger';
import * as Inert from 'inert';
import * as Path from 'path';
import * as Vision from 'vision';
import { Db, Kind } from '../common-types';
import { makeUserRoutes } from './user-routes';
import { secretNoDash } from '../app-const';
import { Server } from 'hapi';

/* tslint:disable:no-var-requires */
const npmManifest = require('../../../package.json');

export async function makeServer(
  otherRoutes,
  port: number,
  db: Db,
  kind: Kind): Promise<Server> {

  const httpServer = new Server({
    host: '0.0.0.0',
    port,
    routes: {
      files: {
        relativeTo: Path.join(__dirname, '..', 'node_modules', 'hapi-swagger', 'public')
      }
    },
    debug: { request: ['error'] }
  });

  await httpServer.register([
    Cookie,
    { plugin: Inert } as any,
    { plugin: Vision },
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'API Documentation',
          version: npmManifest.version
        }
      }
    }
  ]);

  httpServer.auth.strategy('session', 'cookie', {
    cookie: {
      name: kind + '-sid',
      password: secretNoDash,
      isSecure: false,
      isHttpOnly: false,
      isSameSite: false,
      clearInvalid: true,
      path: '/'
    },
    redirectTo: '/login',
    validateFunc: async (_, session) => {
      const user = db.users.findOne(u => u.uuid = session.id);

      if (!user) {
        return { valid: false };
      }
      return { valid: true, credentials: user };
    }
  });
  httpServer.auth.default('session');

  (httpServer as any).views({
    engines: { ejs: Ejs },
    isCached: false,
    relativeTo: Path.join(__dirname, '..', 'templates')
  });

  httpServer.route([
    ...otherRoutes,
    ...makeUserRoutes(db),
    {
      method: 'GET',
      path: '/api/ping',
      handler: () => 'up!',
      options: {
        auth: false,
        description: 'Check upness',
        tags: ['api', 'utility']
      }
    }, {
      method: 'GET',
      path: '/static/{param*}',
      handler: {
        directory: {
          path: Path.join(__dirname, '..', '..', '..', 'static'),
          redirectToSlash: true,
          index: true,
        }
      },
      options: {
        auth: false
      }
    }
  ]);

  return httpServer;
}
