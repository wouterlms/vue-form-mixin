<template>
  <div id="app">
    <p>Form:</p>
    <pre>{{ JSON.stringify(form, null, 2) }}</pre>

    <p>Form values</p>
    <pre>{{ JSON.stringify(_formValues(), null, 2) }}</pre>

    <p>Form data</p>
    <pre>{{ JSON.stringify(_formData(), null, 2) }}</pre>
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
    // Dit zou van de API terugkomen
    const mockData = {
      name: 'Wouter',
      style: {
        color: 'orange',
        border_radius: '5px'
      }
    }

    // Set form voor mixin
    this._setForm(this.form)

    // Vul het form in
    this._setFormValues(mockData)

    // Voeg dynamisch watchers toe voor alle properties
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
