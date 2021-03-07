<template>
  <div>
    <p>Form:</p>
    <pre>{{ JSON.stringify(form, null, 2) }}</pre>

    <p>Form values</p>
    <pre>{{ JSON.stringify(_formValues(), null, 2) }}</pre>
  </div>
</template>

<script lang="ts">
import formMixin from '@/mixins/form.mixin'
import Form from '@/types/form'
import { Component, Mixins, Vue } from 'vue-property-decorator'

@Component
export default class extends Mixins(formMixin) {
  form: Form = {
    property: {
      value: 'value of the property',
      error: null,
      validate: (value: any) => {
        // validate
      }
    },
    style: {
      children: {
        color: {
          value: 'red'
        },
        border_radius: {
          value: 5
        }
      }
    },
    object_which_will_be_exported_as_an_array: {
      value: { a: 'a', b: 'b' },
      get: (value: any) => {
        return Object.values(value)
      }
    },
    test: {
      children: {
        prop: {
          value: 'test'
        }
      }
    }
  }

  created(): void {
    this._setForm(this.form)
  }

  mounted() {
    this._addInputWatchers()
  }
}
</script>

<style scoped></style>
