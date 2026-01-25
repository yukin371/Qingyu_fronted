import { render } from '@testing-library/vue'
import Card from './src/design-system/base/Card/Card.vue'

const result = render(Card, {}, {
  slots: { default: 'Test Content' }
})
console.log('HTML:', result.container.innerHTML)
