import * as replify from 'replify';
import { boot } from '../sp/boot';

boot().then(async (context) => {
  await context.sp.httpServer.start();
  console.log('Service Provider listening for http on %ss', context.sp.httpServer.info.uri);
  replify('Service-Provider', context);
});
