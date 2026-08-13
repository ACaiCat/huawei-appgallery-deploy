import axios from 'axios'
import { assertRetOk, type Ret } from './ret.js'

export const UPDATE_TEST_VERSION_API =
  'https://connect-api.cloud.huawei.com/api/publish/v2/test/app/version'

export interface GroupInfo {
  /** 测试群组 ID。 */
  groupId?: string
  /** 已添加测试群组成员的数量。 */
  addedTesterNum?: number
  /** 是否绑定该测试群组，1 已绑定，0 未绑定。 */
  bind?: number
}

export interface TestTaskInfo {
  /** 测试用户信息。注意：公开测试不支持修改。 */
  groupInfos: GroupInfo[]
  /** 公开测试安装次数上限，默认 10 万次，仅公开测试支持填写。 */
  publicTestInstallLimit?: number
  /** 是否向用户发送测试通知，0 不需要，1 需要，默认 1。 */
  needNotify?: number
}

export interface OpenTestInfo {
  /** 测试版本开始时间，毫秒时间戳（与 1970-01-01 午夜之间的差值）。 */
  startTime?: number
  /** 测试版本结束时间，毫秒时间戳。 */
  endTime?: number
  /** 测试版本描述，最长 50 个字符。 */
  testDesc: string
  /** 测试版本任务信息。 */
  testTaskInfo: TestTaskInfo
}

export interface UpdateTestVersionParams {
  appId: string
  /** 需要更新的测试版本 ID。 */
  versionId: string
  /** 需要上传的软件包 ID，请确保软件包为正常状态（successStatus 为 0）。 */
  pkgId?: string
  /** 测试版本信息。 */
  openTestInfo: OpenTestInfo
}

export interface UpdateTestVersionResponse {
  ret: Ret
}

/**
 * 更新已创建的测试版本。
 *
 * 在架的测试版本不允许调用此接口。如需修改生效版本或测试时间额度等信息，
 * 请参考对应的专用接口；本实现仅支持更新 openTestInfo（测试描述与测试任务）。
 */
export async function updateTestVersion(
  token: string,
  params: UpdateTestVersionParams,
  clientId?: string
): Promise<UpdateTestVersionResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }
  if (clientId) headers['client_id'] = clientId

  const { appId, ...body } = params

  const { data } = await axios.put<UpdateTestVersionResponse>(
    UPDATE_TEST_VERSION_API,
    body,
    {
      headers,
      params: { appId }
    }
  )

  assertRetOk(data.ret)

  return data
}
