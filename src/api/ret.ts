export interface Ret {
  code: number
  msg: string
}

/**
 * 校验 AppGallery Connect 接口返回的 ret 结果。
 * msg 不为 "success" 时抛出异常，并携带 code 和 msg 信息。
 */
export function assertRetOk(ret: Ret): void {
  if (ret.msg !== 'success') {
    throw new Error(
      `AppGallery Connect 接口调用失败: code=${ret.code}, msg=${ret.msg}`
    )
  }
}
