import { Component, useState, useEffect, render, html } from 'uland';

const MyComp = Component(function MyComp () {
  const [state, setState] = useState(false);

  function flipTrue (ev) {
    ev.preventDefault();

    setState(true);
  }

  function flipFalse (ev) {
    ev.preventDefault();

    setState(false);
  }

  console.log(state);

  if (state) {
    return html`
      <div>
        <div>hello uland (true)</div>
        <button onclick="${flipFalse}">change state</button>
      </div>
    `;
  }

  if (!state) {
    return html`
      <div>
        <div>hello uland (false)</div>
        <button onclick=${flipTrue}>change state</button>
      </div>
    `;
  }
});

render(document.querySelector('.app'), html`
  ${MyComp()}
`);
