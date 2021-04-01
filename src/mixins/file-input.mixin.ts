import { Component, Vue } from 'vue-property-decorator'

@Component
export default class extends Vue {
  _mimeTypes: string[] = []
  _multiple: boolean = false

  protected _browse(mimeTypes: string[] = [], multiple: boolean = false, cb: Function): void {
    this._mimeTypes = mimeTypes
    this._multiple = multiple

    const fileInput: HTMLInputElement = document.createElement('input')

    fileInput.type = 'file'
    fileInput.accept = mimeTypes.join(',')
    fileInput.multiple = multiple

    fileInput.addEventListener(
      'change',
      (e: Event) => {
        this.handleFileInput(e, (data: File | File[]) => {
          cb(data)
        })
      },
      { once: true }
    )

    fileInput.click()
  }

  private handleFileInput(e: Event, cb: Function): void {
    const files: FileList | null = (e?.target as HTMLInputElement).files

    if (files && files.length) {
      if (this._multiple) {
        const validFiles: File[] = Array.from(files).filter((file) => this.isSupportedMimeType(file))

        if (validFiles.length) {
          cb(files)
        }
      } else {
        const file: File = files[0]

        if (this.isSupportedMimeType(file)) {
          cb(file)
        }
      }
    }
  }

  private isSupportedMimeType(file: File): boolean {
    return this._mimeTypes.length ? this._mimeTypes.indexOf(file.type) !== -1 : true
  }
}
