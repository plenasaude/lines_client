const R = require('ramda')

function createLine({ ticket, destination, complement }) {
  const line = document.createElement('li')
  line.innerHTML = `${ticket} ${destination} ${complement}`
  setTimeout(() => {
    line.className = line.className + " show"
  }, 10)
  return line
}

function removeElements(elems) {
  elems.forEach(e => {
    e.classList.remove('show')
    e.addEventListener('transitionend', e.remove)
  })
}

function addNewElements(list, tickets) {
  tickets.forEach(t => {
    const line = createLine(t)
    list.prepend(line)
  })
}

const validElements = R.pipe(
  R.prop('children'),
  Array.from,
  R.filter(c => c.classList.contains('show'))
)

function scrollListGroup(ticketsArr) {
  const listMaxSize = 10
  const validTickets = R.take(listMaxSize, ticketsArr)
  const numberOfNewElements = validTickets.length

  const list = document.getElementById('list')
  const children = validElements(list)
  const currentListLength = children.length
  const totalElements = (currentListLength + numberOfNewElements)
  const nElementsToBeRemoved = totalElements > listMaxSize ?
    totalElements - listMaxSize : 0
  const elementsToBeRemoved = R.takeLast(nElementsToBeRemoved, children)

  removeElements(elementsToBeRemoved)
  addNewElements(list, validTickets)
}

document.addEventListener('DOMContentLoaded', function() {
  const initial = [
    { ticket: '001', destination: 'sala 1', complement: 'Pedro C.', lastEdited: 1 },
    { ticket: '002', destination: 'sala 2', complement: 'Pedro C.', lastEdited: 1 },
    { ticket: '003', destination: 'sala 2', complement: 'Pedro C.', lastEdited: 1 },
    { ticket: '003', destination: 'sala 2', complement: 'Pedro C.', lastEdited: 1 },
    { ticket: '003', destination: 'sala 2', complement: 'Pedro C.', lastEdited: 1 },
    { ticket: '003', destination: 'sala 2', complement: 'Pedro C.', lastEdited: 1 },
    { ticket: '003', destination: 'sala 2', complement: 'Pedro C.', lastEdited: 1 },
  ]
  scrollListGroup(initial)

  document.getElementById('add-to-list').onclick = function() {
    scrollListGroup([
      { ticket: '001', destination: 'sala 1', complement: 'Pedro C.', lastEdited: 1 },
      { ticket: '002', destination: 'sala 2', complement: 'Pedro C.', lastEdited: 1 },
    ])
  }
})
