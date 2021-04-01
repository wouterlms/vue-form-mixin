import { Component, Vue } from 'vue-property-decorator'

@Component
export default class extends Vue {
  protected async _crop(file: File, aspectRatio: number = 1, width: number | null, height: number | null = null): Promise<string> {
    return new Promise(async (resolve) => {
      const canvas: HTMLCanvasElement = document.createElement('canvas')
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
      const image: HTMLImageElement = await this.fileToCanvasImageSource(file)

      if (width && height) {
        canvas.width = width
        canvas.height = height
      } else if (width) {
        canvas.width = width
        canvas.height = width / aspectRatio
      } else if (height) {
        canvas.height = height
        canvas.width = height * aspectRatio
      }

      const scale = Math.max(canvas.width / image.width, canvas.height / image.height)
      const x = canvas.width / 2 - (image.width / 2) * scale
      const y = canvas.height / 2 - (image.height / 2) * scale

      ctx?.drawImage(image, x, y, image.width * scale, image.height * scale)

      resolve(canvas.toDataURL('image/png'))
    })
  }

  protected _base64ToFile(base64: string): any {
    let arr = base64.split(','),
      mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], Date.now() + '', { type: mime })
  }

  private async fileToCanvasImageSource(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image()

      img.onload = () => {
        resolve(img)
      }

      img.src = URL.createObjectURL(file)
    })
  }
}
