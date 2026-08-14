import axios from 'axios'
import { assertRetOk, type Ret } from './ret.js'

export const QUERY_PACKAGE_STATUS_API =
  'https://connect-api.cloud.huawei.com/api/publish/v3/package/compile/status'

export interface PackageState {
  pkgId: string
  /** 软件包状态汇总结果：0 正常，1 解析中，2 失败（软件包不可用）。 */
  successStatus: number
}

export interface QueryPackageStatusParams {
  appId: string
  /** 待查询的软件包 ID，多个 ID 用英文逗号分隔。 */
  pkgIds: string
}

export interface QueryPackageStatusResponse {
  ret: Ret
  pkgStateList?: PackageState[]
}

/**
 * 查询 HarmonyOS 应用/元服务的软件包编译状态。
 *
 * 软件包 ID 可通过「更新应用软件包信息」接口返回的 packageId 获取。
 */
export async function queryPackageStatus(
  token: string,
  params: QueryPackageStatusParams,
  clientId?: string
): Promise<QueryPackageStatusResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }
  if (clientId) headers['client_id'] = clientId

  const { data } = await axios.get<QueryPackageStatusResponse>(
    QUERY_PACKAGE_STATUS_API,
    {
      headers,
      params
    }
  )

  assertRetOk(data.ret)

  return data
}
