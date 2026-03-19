// 简单的Base64编码（不是真正的加密）
/**
 * 编码ID
 * @param {*} id
 * @returns
 */
export function obfuscateId(id) {
  return btoa(id.toString())
}

/**
 * 解码Base64编码后的ID
 * @param {*} encoded
 * @returns
 */
export function deobfuscateId(encoded) {
  try {
    return encoded ? parseInt(atob(encoded)) : null
  } catch (e) {
    console.error('ID解码失败:', e)
    return null
  }
}
