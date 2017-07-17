const electron = require('electron')
const R = require('ramda')

const configuration = electron.remote.require('./src/configuration')

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

let state = []

const oldTicketsMaxSize = 4
const newTicketMaxSize = 2

const scrollListGroup = listId => ticketsArr => {
  const validTickets = R.take(oldTicketsMaxSize, ticketsArr)
  const numberOfNewElements = validTickets.length

  const list = document.getElementById(listId)
  const children = validElements(list)
  const currentListLength = children.length
  const totalElements = (currentListLength + numberOfNewElements)
  const nElementsToBeRemoved = totalElements > oldTicketsMaxSize ?
    totalElements - oldTicketsMaxSize : 0
  const elementsToBeRemoved = R.takeLast(nElementsToBeRemoved, children)

  removeElements(elementsToBeRemoved)
  addNewElements(list, validTickets)
}

const scrollOldList = scrollListGroup('old-tickets-list')
const scrollNewList = scrollListGroup('new-tickets-list')

const diffTickets = R.differenceWith(function(t1, t2) {
  const sameTicket = t1.ticket === t2.ticket
  const sameCall = t1.lastEditedAt === t2.lastEditedAt
  return sameTicket && sameCall
})

const getNewTickets = R.take(newTicketMaxSize)
const getOldTickets = tickets => R.pipe(
  diffTickets(R.__, getNewTickets(tickets)),
  R.take(oldTicketsMaxSize + newTicketMaxSize)
)(tickets)

const getNewState = R.curry((state, tickets) => R.pipe(
  diffTickets(R.__, state),
  R.concat(R.__, state),
  R.sortBy(R.prop('lastEditedAt')),
  R.take(oldTicketsMaxSize)
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
      console.log({ newState, state })
      return newState
    })

    // .then(tickets => {
    //   R.pipe(
    //     // R.tap(console.log),
    //     getNewTickets,
    //     // R.tap(console.log),
    //     diffTickets(R.__, state),
    //     R.tap(a => console.log({a, tickets, state })),
    //     scrollNewList
    //   )(tickets)
    //
    //   R.pipe(
    //     getOldTickets,
    //     diffTickets(R.__, state),
    //     scrollOldList
    //   )(tickets)
    //
    //   return tickets
    // })
    .then(setState)
    // .then(() => console.log(state))
}

document.addEventListener('DOMContentLoaded', function() {
  // setInterval(refreshQueue, 1000)
  // refreshQueue()
  // refreshQueue()
  // refreshQueue()
})
