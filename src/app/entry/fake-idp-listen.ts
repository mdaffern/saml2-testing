import * as replify from 'replify';
import { boot } from '../idp/boot';

boot().then(async (context) => {
  await context.idp.httpServer.start();
  console.log('Identity Provider listening for http on %ss', context.idp.httpServer.info.uri);
  replify('Identity-Provider', context);
});
