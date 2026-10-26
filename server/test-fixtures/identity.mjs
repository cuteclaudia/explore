export {verifyRequestOrigin, AuthError} from '@netlify/identity';
export async function getUser(){return globalThis.identityTest.session;}
export const admin={
  async getUser(id){const user=globalThis.identityTest.users.get(id);if(!user)throw Error('not found');return user;},
  async listUsers(){return [...globalThis.identityTest.users.values()];},
  async updateUser(id,update){globalThis.identityTest.updates.push({id,update});const user=globalThis.identityTest.users.get(id);user.appMetadata=update.app_metadata;return user;},
};

export async function login(email,password){globalThis.identityTest.logins.push({email,password});if(globalThis.identityTest.loginFails)throw Error('Invalid credentials');return globalThis.identityTest.users.values().next().value;}
