import uce from 'uce-lib'
import { Component, html, useState } from 'uland'

const Counter = Component((initialState) => {
  const [count, setCount] = useState(initialState)
  return html`
  <button onclick=${() => setCount(count + 1)}>
    Count: ${count}
  </button>`
})

const uceNested = ({ define, render, html, svg, css }) => {
  define('uce-nested', {
    style: selector => css`${selector} {
      font-weight: bold;
      color: blue;
    }`,
    render () {
      this.html`
      <div>
        Hello uce nested
        ${Counter(0)}
      </div>`
    }
  })
}

uce.then(uceNested)
