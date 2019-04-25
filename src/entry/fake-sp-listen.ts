import * as replify from 'replify';
import { boot } from '../sp/fake-sp';

boot().then((context) => {
  context.sp.httpServer.start().then(() => {
    console.log('fake-sp listening for http on %ss', context.sp.httpServer.info.uri);
    replify('fake-sp', context);
  });
});
