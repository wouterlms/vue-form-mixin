import { Component, Vue } from 'vue-property-decorator'

import Form from '@/types/form'

@Component
export default class extends Vue {
  private _form!: Form

  /**
   * Set form property
   * @param form
   */
  protected _setForm(form: Form): void {
    this._form = form
  }

  /**
   * Set form values
   * @param form
   * @param values
   */
  protected _setFormValues(values: any): void {
    Object.keys(this._form).forEach((input) => {
      const formProperty = this._form[input]

      if ('set' in formProperty) {
        formProperty.value = formProperty.set!(values[input])
      } else if ('value' in formProperty) {
        if (values[input]) {
          formProperty.value = values[input]
        }
      } else if ('children' in formProperty) {
        this.setRecursiveChildValues(input, formProperty.children, values)
      } else {
        console.warn('No child or value for', input)
      }
    })
  }

  /**
   * Get only the value of every form property
   * @param form
   * @param options
   */
  protected _formValues(options: any = {}): any {
    const exclude = options.exclude || []
    const data: any = {}

    for (const input in this._form) {
      if ('get' in this._form[input]) {
        data[input] = this._form[input].get!(this._form[input].value)
      } else if ('children' in this._form[input]) {
        this.getRecursiveChildValues(input, this._form[input].children, data)
      } else if ('value' in this._form[input] && exclude.indexOf(input) === -1) {
        data[input] = this._form[input].value
      } else if (exclude.indexOf(input) === -1) {
        console.warn('No child or value for', input)
      }
    }

    return data
  }

  /**
   * Get the formValues as a FormData object
   * @param options
   */
  protected _formData(options: any = {}): FormData {
    const formData = new FormData()
    const formValues = this._formValues(options)

    for (const property in formValues) {
      const value = formValues[property]

      // stringify objects and arrays
      if (typeof value === 'object') {
        formData.set(property, JSON.stringify(value))
      } else {
        formData.set(property, value)
      }
    }

    return formData
  }

  /**
   * Check if every form property is valid
   * @param form
   */
  protected _isValidForm(): boolean {
    for (const input in this._form) {
      if ('validate' in this._form[input]) {
        const validationResponse = this._form[input].validate!(this._form[input].value)

        if (typeof validationResponse === 'string' || (typeof validationResponse === 'boolean' && !validationResponse)) {
          return false
        }
      }

      if ('children' in this._form[input]) {
        if (this.hasChildErrors(input, this._form[input].children)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Add watchers to all properties with a value and validation
   * @param form
   */
  protected _addInputWatchers(): void {
    for (const input in this._form) {
      if ('value' in this._form[input] && 'validate' in this._form[input]) {
        this.$watch(
          function() {
            return this._form[input].value
          },
          function() {
            this._form[input].error = this._form[input].validate!(this._form[input].value)
          },
          { deep: true }
        )
      } else if ('children' in this._form[input]) {
        this.setRecursiveChildWatchers(input, this._form[input].children)
      }
    }
  }

  /**
   * TODO: check if this works
   * @param path
   * @param children
   */
  private setRecursiveChildWatchers(path: string, children: any): void {
    for (const child in children) {
      if ('value' in children[child]) {
        this.$watch(
          function() {
            return children[child].value
          },
          function() {
            if ('validate' in children[child]) {
              children[child].error = children[child].validate!(children[child].value)
            }
          },
          { deep: true }
        )
      } else if (children[child].children) {
        this.setRecursiveChildWatchers(`${path}.${child}`, children[child].children)
      }
    }
  }

  /**
   * Set values of children
   * @param path
   * @param children
   * @param data
   */
  private setRecursiveChildValues(path: string, children: any, data: any): void {
    for (const child in children) {
      if ('value' in children[child]) {
        const value = this.getDeep(data, `${path}.${child}`)
        if (value) {
          children[child].value = value
        }
      } else if ('children' in children[child]) {
        this.setRecursiveChildValues(`${path}.${child}`, children[child].children, data)
      } else {
        console.warn(`${path}.${child}`, 'has neither a value nor children, what do you expect me to do???')
      }
    }
  }

  /**
   * Get values of child properties
   * @param path
   * @param children
   * @param data
   */
  private getRecursiveChildValues(path: string, children: any, data: any): void {
    for (const child in children) {
      if ('value' in children[child]) {
        if ('get' in children[child]) {
          this.setDeep(data, `${path}.${child}`, children[child].get(children[child].value), true)
        } else {
          this.setDeep(data, `${path}.${child}`, children[child].value, true)
        }
      } else if ('children' in children[child]) {
        this.getRecursiveChildValues(`${path}.${child}`, children[child].children, data)
      } else {
        console.warn('No child or value for', `${path}.${child}`)
      }
    }
  }

  /**
   * Get errors of child properties
   * @param path
   * @param children
   */
  private hasChildErrors(path: string, children: any): any {
    for (const child in children) {
      if ('validate' in children[child]) {
        const validationResponse = children[child].validate!(children[child].value)

        if (typeof validationResponse === 'string' || (typeof validationResponse === 'boolean' && !validationResponse)) {
          return true
        }
      } else if ('children' in children[child]) {
        return this.hasChildErrors(`${path}.${child}`, children[child].children)
      } else {
        return false
      }
    }
  }

  /**
   * Get deep value object value by string
   * @param object
   * @param path
   */
  private getDeep(object: any, path: any) {
    let clone = JSON.parse(JSON.stringify(object))

    const properties = path.split('.')

    for (let i = 0; i < properties.length; i++) {
      if (clone[properties[i]]) {
        clone = clone[properties[i]]
      }
    }

    return clone
  }

  /**
   * Set deep object value by string
   * @param obj
   * @param path
   * @param value
   * @param setrecursively
   */
  private setDeep(obj: any, path: string, value: any, setrecursively = false) {
    const pathArray = path.split('.')
    pathArray.reduce((a: any, b: any, level: any) => {
      if (setrecursively && typeof a[b] === 'undefined' && level !== pathArray.length - 1) {
        a[b] = {}
        return a[b]
      }

      if (level === pathArray.length - 1) {
        a[b] = value
        return value
      }
      return a[b]
    }, obj)
  }
}
