import axios from 'axios'
import { assertRetOk, type Ret } from './ret.js'

export const APP_PACKAGE_INFO_API =
  'https://connect-api.cloud.huawei.com/api/publish/v3/app-package-info'

export interface UpdatePackageInfoParams {
  appId: string
  /** 应用发布方式，1 全网，默认 1。 */
  releaseType?: number
  /** 分阶段发布标识，0 全网，3 分阶段，默认 0。 */
  releasePhase?: number
  /** 文件名称，包括文件的后缀名。 */
  fileName: string
  /** 文件在文件服务器中的对象 ID，由获取上传地址接口返回。 */
  objectId: string
}

export interface UpdatePackageInfoResponse {
  ret: Ret
  /** 软件包上传后内部 id，用于查询软件包编译状态接口调用。 */
  packageId?: string
}

/**
 * APP 软件包上传完成后，刷新 HarmonyOS 应用/元服务的软件包信息。
 *
 * 该接口支持解析软件包中的构建版本号（buildVersion），用于区分同一主版本下的不同测试子版本。
 */
export async function updateAppPackageInfo(
  token: string,
  params: UpdatePackageInfoParams,
  clientId?: string
): Promise<UpdatePackageInfoResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }
  if (clientId) headers['client_id'] = clientId

  const { fileName, objectId, appId, releaseType, releasePhase } = params

  const { data } = await axios.put<UpdatePackageInfoResponse>(
    APP_PACKAGE_INFO_API,
    { fileName, objectId },
    {
      headers,
      params: { appId, releaseType, releasePhase }
    }
  )

  assertRetOk(data.ret)

  return data
}
