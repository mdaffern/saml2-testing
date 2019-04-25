import { boot as idpBoot, IdpContext } from './idp/boot';
import { boot as spBoot, SpContext } from './sp/boot';

export async function mergeContext(): Promise<IdpContext & SpContext> {
  const [context1, context2] = await Promise.all([
    idpBoot(),
    spBoot()
  ]);

  return { ...context1, ...context2 };
}
