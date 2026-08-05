import * as core from '@actions/core'
import { createPrivateKey, sign, constants, type KeyObject } from 'node:crypto'

interface Credentials {
  project_id: string
  key_id: string
  private_key: string
  sub_account: string
  auth_uri: string
  token_uri: string
  auth_provider_cert_uri: string
  client_cert_uri: string
}

function signServiceAccountJwt(cred: Credentials): string {
  const privateKeyPem = cred.private_key.replace(/\\n/g, '\n')
  const privateKey = createPrivateKey(privateKeyPem)

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'PS256', kid: cred.key_id, typ: 'JWT' }
  const payload = {
    aud: cred.token_uri,
    iss: cred.sub_account,
    exp: now + 3600,
    iat: now
  }

  const encodeHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodePayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  )
  const data = Buffer.from(`${encodeHeader}.${encodePayload}`)

  const signature = sign('sha256', data, {
    key: privateKey as unknown as KeyObject,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32,
    mgf1HashAlgorithm: 'sha256'
  } as Parameters<typeof sign>[2])

  return `${encodeHeader}.${encodePayload}.${Buffer.from(signature).toString('base64url')}`
}

/** 获取访问 AppGallery Connect API 所需的 Bearer JWT。 */
export async function loginWithCredentials(): Promise<string> {
  const cred = JSON.parse(core.getInput('credentials')) as Credentials
  return signServiceAccountJwt(cred)
}
