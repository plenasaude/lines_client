const electron = require('electron')
const R = require('ramda')

const configuration = electron.remote.require('./src/configuration')

let state = []

const oldTicketsMaxSize = 4
const newTicketMaxSize = 2

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

const scrollListGroup = (listId, maxElems) => ticketsArr => {
  const validTickets = R.take(maxElems, ticketsArr)
  const numberOfNewElements = validTickets.length

  const list = document.getElementById(listId)
  const children = validElements(list)
  const currentListLength = children.length
  const totalElements = (currentListLength + numberOfNewElements)
  const nElementsToBeRemoved = totalElements > maxElems ?
    totalElements - maxElems : 0
  const elementsToBeRemoved = R.takeLast(nElementsToBeRemoved, children)

  removeElements(elementsToBeRemoved)
  addNewElements(list, validTickets)
}

const scrollOldList = scrollListGroup('old-tickets-list', oldTicketsMaxSize)
const scrollNewList = scrollListGroup('new-tickets-list', newTicketMaxSize)

const diffTickets = R.differenceWith(function(t1, t2) {
  const sameTicket = t1.ticket === t2.ticket
  const sameCall = t1.lastEditedAt === t2.lastEditedAt
  return sameTicket && sameCall
})

const getNewState = R.curry((state, tickets) => R.pipe(
  diffTickets(R.__, state),
  R.concat(R.__, state),
  R.sortBy(R.prop('lastEditedAt')),
  R.reverse,
  R.take(oldTicketsMaxSize + newTicketMaxSize)
)(tickets))

function setState(tickets) {
   state = getNewState(state, tickets)
 }

function refreshQueue() {
  return configuration.get()
    .then(({ user, axios }) =>
      axios.get(`/screen/${user}?limit=${newTicketMaxSize + oldTicketsMaxSize}`)
        .then(R.prop('data'))
    )
    .then(getNewState(state))
    .then(newState => {
      // Compare and update new list
      const newHead = R.take(newTicketMaxSize, newState)
      const oldHead = R.take(newTicketMaxSize, state)
      R.pipe(
        diffTickets(newHead),
        scrollNewList
      )(oldHead)
      return newState
    })
    .then(newState => {
      // Compare and update old list
      const newTail = R.drop(newTicketMaxSize, newState)
      const oldTail = R.drop(newTicketMaxSize, state)
      R.pipe(
        diffTickets(newTail),
        scrollOldList
      )(oldTail)
      return newState
    })
    .then(setState)
}

document.addEventListener('DOMContentLoaded', function() {
  setInterval(refreshQueue, 1000)
})
