const IMGUR_IMAGE_PATTERN = /^https:\/\/i\.imgur\.com\/([^/.]+)\.(jpe?g|png)$/i

const getImgurThumbnailUrl = (imageUrl: string, size: 'l' | 'h') =>
  imageUrl.replace(IMGUR_IMAGE_PATTERN, (_, imageId: string, extension: string) => {
    return `https://i.imgur.com/${imageId}${size}.${extension}`
  })

export const getProductImageUrl = (imageUrl: string) => getImgurThumbnailUrl(imageUrl, 'l')

export const getProductImageSrcset = (imageUrl: string) => {
  const large = getImgurThumbnailUrl(imageUrl, 'l')
  const huge = getImgurThumbnailUrl(imageUrl, 'h')

  return large === imageUrl && huge === imageUrl
    ? undefined
    : `${large} 640w, ${huge} 1024w`
}

export const PRODUCT_IMAGE_PLACEHOLDER = `${import.meta.env.BASE_URL}catalog-image-placeholder.svg`
