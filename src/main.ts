import Reveal from "reveal.js";
import Note from "reveal.js/plugin/notes/notes";

import "./style.css";

function jsTrimWhitespace() {
  const elements = document.getElementsByClassName('js:trim-whitespace')
  for (let element of elements) {
    let lines = element.innerHTML.split('\n')
    element.innerHTML = lines
      .map(line => line.trim())
      .reduce((acc, it) => acc + (acc.length > 0 ? '\n' : '') + it)
  }
}

function unhideSlides() {
  const elements = document.querySelectorAll('[data-visibility="hidden"]')
  for (let element of elements) {
    element.removeAttribute('data-visibility')
  }
}

window.addEventListener('load', () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const isPrintPdf = urlSearchParams.get('print-pdf') !== null
  const editing = urlSearchParams.get('editing') !== null

  jsTrimWhitespace()
  if (editing || isPrintPdf) {
    unhideSlides()
  }
  if (isPrintPdf) {
    document.documentElement.style.setProperty('--r-main-color', 'black');
    document.documentElement.style.setProperty('--r-heading-color', 'black');
    document.documentElement.style.setProperty('--r-background-color', 'white');
  }

  Reveal.configure({
    pdfMaxPagesPerSlide: 1,
    pdfSeparateFragments: false,
    showNotes: isPrintPdf ? 'separate-page' : false
  });

  Reveal.initialize({
    hash: true,
    plugins: [Note]
  })
})
