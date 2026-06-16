const IMGUR_IMAGE_PATTERN = /^https:\/\/i\.imgur\.com\/([^/.]+)\.(jpe?g|png)$/i

export const getImgurThumbnailUrl = (imageUrl: string, size: 'm' | 'l' | 'h' = 'l') =>
  imageUrl.replace(IMGUR_IMAGE_PATTERN, (_, imageId: string, extension: string) => {
    return `https://i.imgur.com/${imageId}${size}.${extension}`
  })

export const getImgurCatalogImageUrl = (imageUrl: string) => getImgurThumbnailUrl(imageUrl, 'l')

export const getImgurCatalogImageSrcset = (imageUrl: string) => {
  const small = getImgurThumbnailUrl(imageUrl, 'm')
  const large = getImgurThumbnailUrl(imageUrl, 'l')
  const huge = getImgurThumbnailUrl(imageUrl, 'h')

  return small === imageUrl && large === imageUrl && huge === imageUrl
    ? undefined
    : `${small} 320w, ${large} 640w, ${huge} 1024w`
}
