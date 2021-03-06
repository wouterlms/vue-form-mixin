import { Component, Vue } from 'vue-property-decorator'

import Form from '@/types/form'

@Component
export default class extends Vue {
  /**
   * Set form values
   * @param form
   * @param values
   */
  protected _setFormValues(form: Form, values: any): void {
    Object.keys(form).forEach((input) => {
      const formProperty = form[input]

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
  protected _formValues(form: Form, options: any = {}): any {
    const exclude = options.exclude || []
    const data: any = {}

    for (const input in form) {
      if (form[input].get) {
        data[input] = form[input].get!(form[input].value)
      } else if (form[input].children) {
        this.getRecursiveChildValues(input, form[input].children, data)
      } else if (exclude.indexOf(input) === -1 && form[input].value) {
        data[input] = form[input].value
      } else if (exclude.indexOf(input) === -1) {
        console.warn('No child or value for', input)
      }
    }

    return data
  }

  /**
   * Check if every form property is valid
   * @param form
   */
  protected _isValidForm(form: Form): boolean {
    for (const input in form) {
      if ('validate' in form[input] && typeof form[input].validate!(form[input].value) === 'string') {
        return false
      }

      if ('children' in form[input]) {
        if (this.hasChildErrors(input, form[input].children)) {
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
  protected _addInputWatchers(form: Form): void {
    for (const input in form) {
      if ('value' in form[input] && 'validate' in form[input]) {
        this.$watch(
          function() {
            return form[input].value
          },
          function() {
            form[input].error = form[input].validate!(form[input].value)
          },
          { deep: true }
        )
        if ('children' in form[input]) {
          this.setRecursiveChildWatchers(input, form[input].children)
        }
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
      if (children[child].value) {
        this.setDeep(data, `${path}.${child}`, children[child].value, true)
      } else if (children[child].children) {
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
      if ('validate' in children[child] && typeof children[child].validate!(children[child].value) === 'string') {
        return true
      } else if (children[child].children) {
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
