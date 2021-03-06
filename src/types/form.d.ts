interface IFormData {
  value?: any
  error?: string | boolean | null
  validate?: Function
  set?: Function
  get?: Function
  children?: {
    [key: string]: IFormData
  }
}

export default interface Form {
  [key: string]: IFormData
}
