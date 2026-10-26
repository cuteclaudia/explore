export {verifyRequestOrigin, AuthError} from '@netlify/identity';
export async function getUser(){return globalThis.identityTest.session;}
export const admin={
  async getUser(id){const user=globalThis.identityTest.users.get(id);if(!user)throw Error('not found');return user;},
  async listUsers(){return [...globalThis.identityTest.users.values()];},
  async updateUser(id,update){globalThis.identityTest.updates.push({id,update});const user=globalThis.identityTest.users.get(id);user.appMetadata=update.app_metadata;return user;},
};
