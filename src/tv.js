const electron = require('electron')
const R = require('ramda')

const configuration = electron.remote.require('./src/configuration')
const isDev = electron.remote.require('./src/is_dev')

let state = []

let errorCnt = 0
let intervalHandler = null
const incrementErrorCounter = () => { errorCnt += 1 }
const resetErrorCounter = () => { errorCnt = 0 }
function verifyErrorCount() {
  if (errorCnt > 30) {
    console.log('ERROR count exceded maximum allowed')
    if (intervalHandler) clearInterval(intervalHandler)

    // TODO: change this to another key, we may want to test internet connection
    //in dev
    if (!isDev) {
      electron.ipcRenderer.send('application-error', {
        message: 'Sem acesso a internet',
        payload: { showLogin: false },
      })
    }
  }
}

const oldTicketsMaxSize = 4
const newTicketMaxSize = 2

function createLine({ ticket, destination, complement }) {
  const line = document.createElement('li')
  line.classList.add('ticket')

  const ticketLabel = document.createElement('span')
  ticketLabel.className = 'boxed-text label'
  ticketLabel.innerHTML = 'Senha'

  const ticketData = document.createElement('span')
  ticketData.className = 'ticket-data'
  ticketData.innerHTML = ticket

  const destinationLabel = document.createElement('span')
  destinationLabel.className = 'boxed-text label'
  destinationLabel.innerHTML = 'Local'

  const destinationData = document.createElement('span')
  destinationData.className = 'ticket-data'
  destinationData.innerHTML = destination

  line.appendChild(ticketLabel)
  line.appendChild(ticketData)
  line.appendChild(destinationLabel)
  line.appendChild(destinationData)

  setTimeout(() => {
    line.classList.add('show')
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

function beep() {
  const beep = new Audio("../resources/tv_beep.mp3")
  beep.loop = false
  beep.play()
}

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

function setState(newState) {
  state = newState
}

function fetchNewState() {
  const url = user => `/screen/${user}?limit=${newTicketMaxSize + oldTicketsMaxSize}`
  return configuration.get()
    .then(({ user, axios }) => axios.get(url(user)))
    .then(R.prop('data'))
    .then(resetErrorCounter)
    .catch(incrementErrorCounter)
}

function updateNewList(newState) {
  const scrollNewList = scrollListGroup('new-tickets-list', newTicketMaxSize)
  const newHead = R.take(newTicketMaxSize, newState)
  const oldHead = R.take(newTicketMaxSize, state)
  return R.pipe(
    diffTickets(newHead),
    R.unless(R.isEmpty, R.tap(beep)),
    R.unless(R.isEmpty, scrollNewList)
  )(oldHead)
}

function updateOldList(newState) {
  const scrollOldList = scrollListGroup('old-tickets-list', oldTicketsMaxSize)
  const newTail = R.drop(newTicketMaxSize, newState)
  const oldTail = R.drop(newTicketMaxSize, state)
  return R.pipe(
    diffTickets(newTail),
    R.unless(R.isEmpty, scrollOldList)
  )(oldTail)
}

const updateView = R.pipe(
  getNewState(state),
  R.tap(updateNewList),
  R.tap(updateOldList),
  setState
)

const refreshQueue = () => fetchNewState()
  .then(verifyErrorCount)
  .then(updateView)

function mockFactory(n = 1) {
  let cnt = 0
  function createMockResponse() {
    return {
      ticket: cnt++,
      createdAt: Date.now(),
      destination: 'giche',
      lastEditedAt: Date.now(),
      preferred: false,
      queue: {
        id: '596cd441d255b2d0a2ab4c40',
        name: 'queue name',
        payload: {},
      },
    }
  }

  return function newTickets(mock) {
    return R.pipe(
      R.times(createMockResponse),
      R.concat(mock),
      R.sortBy(R.prop('lastEditedAt')),
      R.reverse,
      R.take(newTicketMaxSize + oldTicketsMaxSize)
    )(n)
  }
}

document.addEventListener('DOMContentLoaded', function() {
  intervalHandler = setInterval(refreshQueue, 1000)

  if (isDev) {
    const mock = mockFactory(1)
    document.getElementById('last-calls-title')
      .addEventListener('click', () => updateView(mock(state)))
  }
})
