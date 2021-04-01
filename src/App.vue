<template>
  <div id="app">
    <p>Form:</p>
    <pre>{{ JSON.stringify(form, null, 2) }}</pre>

    <p>Form values</p>
    <pre>{{ JSON.stringify(_formValues(), null, 2) }}</pre>

    <p>Valid form?</p>
    <pre>{{ JSON.stringify(_isValidForm(), null, 2) }}</pre>
  </div>
</template>

<script lang="ts">
import formMixin from '@/mixins/form.mixin'
import Form from '@/types/form'
import { Component, Mixins, Vue } from 'vue-property-decorator'

@Component
export default class extends Mixins(formMixin) {
  form: Form = {
    name: {
      value: null,
      error: null,
      validate: this.validateValue
    },
    style: {
      children: {
        color: {
          value: null
        },
        border_radius: {
          value: null
        }
      }
    },
    students: {
      value: ['John', 'Philip', 'Anna']
    }
  }
  mounted() {
    // Mock API data
    const mockData = {
      name: 'Wouter',
      style: {
        color: 'orange',
        border_radius: '5px'
      }
    }

    // Set form
    this._setForm(this.form)

    //  Fill form
    this._setFormValues(mockData)

    // Add value watchers to validate properties
    this._addInputWatchers()
  }

  onSubmit(): void {
    const formValues = this._formValues()
  }

  validateValue(): void {}
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
