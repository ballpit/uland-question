import { Component, html, useState } from 'uland'

export const Counter = Component((initialState) => {
  const [count, setCount] = useState(initialState)
  return html`
  <button onclick=${() => setCount(count + 1)}>
    Count: ${count}
  </button>`
})

window.Counter = Counter
