// @ts-nocheck
import { mount } from '@vue/test-utils'

import formMixin from '@/mixins/form.mixin'
import Form from '@/types/form'

describe('form.mixin.ts', () => {
  it('should get form values', () => {
    const wrapper = mount(formMixin, {
      render() {}
    })

    const form: Form = {
      property: {
        value: 'value'
      },
      nested: {
        children: {
          childA: {
            value: 'childA'
          },
          childB: {
            value: 'childB'
          }
        }
      }
    }

    wrapper.vm._setForm(form)

    const values = wrapper.vm._formValues()
    const expected = { property: 'value', nested: { childA: 'childA', childB: 'childB' } }

    expect(values).toMatchObject(expected)
  })

  it('should set form values', () => {
    const wrapper = mount(formMixin, {
      render() {}
    })

    const form: Form = {
      property: {
        value: null
      },
      nested: {
        children: {
          childA: {
            value: null
          },
          childB: {
            value: null
          }
        }
      }
    }

    const data: any = {
      property: 'value',
      nested: {
        childA: 'childA',
        childB: 'childB'
      }
    }

    const expected: Form = {
      property: {
        value: 'value'
      },
      nested: {
        children: {
          childA: {
            value: 'childA'
          },
          childB: {
            value: 'childB'
          }
        }
      }
    }

    wrapper.vm._setForm(form)
    wrapper.vm._setFormValues(data)

    expect(form).toMatchObject(expected)
  })

  it('should validate the form property', (done) => {
    const wrapper = mount(formMixin, {
      data() {
        return {
          form: {
            property: {
              value: null,
              error: null,
              validate: (value: any) => {
                if (value !== 'value') {
                  return 'error message'
                }
              }
            },
            property_with_children: {
              children: {
                child_property: {
                  value: null,
                  error: null,
                  validate: (value: any) => {
                    if (value !== 'value') {
                      return 'error message'
                    }
                  }
                }
              }
            }
          }
        }
      },
      render() {}
    })

    wrapper.vm._setForm(wrapper.vm.$data.form)
    wrapper.vm._addInputWatchers()

    wrapper.vm.$data.form.property.value = 'wrong value'
    wrapper.vm.$data.form.property_with_children.children.child_property.value = 'wrong value'

    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.$data.form.property.error).toEqual('error message')
      expect(wrapper.vm.$data.form.property_with_children.children.child_property.error).toEqual('error message')
      expect(wrapper.vm._isValidForm(wrapper.vm.$data.form)).toBeFalsy()
      done()
    })
  })

  it('should get the correct value from the getter', () => {
    const wrapper = mount(formMixin, {
      render() {}
    })

    const form: Form = {
      property: {
        value: 'some_value',
        get: (value) => {
          return `${value}_modified`
        }
      }
    }

    wrapper.vm._setForm(form)

    const values = wrapper.vm._formValues()

    expect(values.property).toEqual('some_value_modified')
  })

  it('should set the correct value from the getter', () => {
    const wrapper = mount(formMixin, {
      render() {}
    })

    const form: Form = {
      property: {
        value: null,
        set: (value) => {
          return `${value}_modified`
        }
      }
    }

    const data = {
      property: 'some_value'
    }

    wrapper.vm._setForm(form)
    wrapper.vm._setFormValues(data)

    expect(form.property.value).toEqual('some_value_modified')
  })
})
