import { Component, Vue } from 'vue-property-decorator'

// @ts-ignore
import variables from '@/assets/scss/_variables.scss'

@Component
export default class extends Vue {
  variables: any = variables
}
