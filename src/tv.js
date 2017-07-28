const electron = require('electron')
const swal = require('sweetalert2')
const R = require('ramda')

const lineService = electron.remote.require('./src/line_service')
const isDev = electron.remote.require('./src/is_dev')

const oldTicketsMaxSize = 4
const newTicketMaxSize = 2

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

const sortTickets = R.pipe(
  R.when(R.isNil, R.always([])),
  R.sortBy(R.prop('lastEditedAt')),
  R.reverse
)

/******************************************************************************/
/******************************************************************************/
// START ERROR HANDLING
let errorCnt = 0

const incrementErrorCounter = () => { errorCnt += 1 }
const resetErrorCounter = () => {
  errorCnt = 0
  if (swal.isVisible()) swal.close()
}
const verifyErrorCount = () => {
  if (errorCnt > 3 && !swal.isVisible()) {
    console.log('ERROR count exceded maximum allowed')
    swal({
      title: 'Sem conexão com a internet',
      type: 'error',
      showConfirmButton: false,
      allowOutsideClick: false,
    })
  }
}
//END ERROR HANDLING
/******************************************************************************/
/******************************************************************************/


/******************************************************************************/
/******************************************************************************/
// START DOM MANIPULATION
function createLine({ ticket, destination, complement }) {

  const line = document.createElement('li')
  line.id = ticket
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

  const destinationWrapper = document.createElement('span')
  destinationWrapper.className = 'ticket-data'

  const destinationData = document.createElement('span')
  destinationData.innerHTML = destination
  destinationData.id = `destination-data-${ticket}`

  destinationWrapper.appendChild(destinationData)

  line.appendChild(ticketLabel)
  line.appendChild(ticketData)
  line.appendChild(destinationLabel)
  line.appendChild(destinationWrapper)

  setTimeout(() => {
    line.classList.add('show')
    const wrapperWidth = destinationWrapper.offsetWidth
    const destinationWidth = destinationData.offsetWidth
    if (wrapperWidth < destinationWidth) {
      destinationData.classList.add('scrolling-text')
      destinationData.style.animationDuration = `${destination.length*360}ms`
    }
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

const updateList = listId => ticketsArr => {
  const list = document.getElementById(listId)
  const children = validElements(list)
  const ticketsIds = R.pluck('ticket', ticketsArr)
  const childrenIds = R.pluck('id', children)

  const elementsToBeRemoved =
    children.filter(c => !R.contains(c.id, ticketsIds))
  const elementsToBeAdded =
    ticketsArr.filter(t => !R.contains(t.ticket, childrenIds))

  removeElements(elementsToBeRemoved)
  addNewElements(list, elementsToBeAdded)
}

const setAllDestinations = ticketsArr => {
  ticketsArr.forEach(t => {
    const destinationData =
      document.getElementById(`destination-data-${t.ticket}`)
      if (destinationData.innerHTML !== t.destination) {
        destinationData.innerHTML = t.destination
      }
  })
}

const updateNewList = state => newState => {
  const newHead = R.take(newTicketMaxSize, newState)
  const oldHead = R.take(newTicketMaxSize, state)
  R.pipe(
    diffTickets(newHead),
    R.unless(R.isEmpty, R.tap(beep)),
  )(oldHead)

  return updateList('new-tickets-list')(newHead)
}

const updateOldList = state => newState => {
  const newTail = R.drop(newTicketMaxSize, newState)
  return updateList('old-tickets-list')(newTail)
}
//END DOM MANIPULATION
/******************************************************************************/
/******************************************************************************/


/******************************************************************************/
/******************************************************************************/
// START DATA FETCHING
function fetchNewState() {
  return lineService.listTickets({ limit: newTicketMaxSize + oldTicketsMaxSize })
  .then(R.tap(resetErrorCounter))
  .catch(incrementErrorCounter)
}

function mockFactory(n = 1) {
  let cnt = 0
  function createMockResponse() {
    return {
      ticket: R.toString(cnt++),
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
      R.when(R.isNil, R.always([])),
      R.sortBy(R.prop('lastEditedAt')),
      R.reverse,
      R.take(newTicketMaxSize + oldTicketsMaxSize)
    )(n)
  }
}
//END DATA FETCHING
/******************************************************************************/
/******************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  electron.ipcRenderer.on('logo', (event, logo) => {
    if (logo) {
      document.getElementById('logo-header').src = logo
    } else {
      document.getElementById('logo-header').style.display = 'none'
    }
  })

  electron.ipcRenderer.send('get-logo')

  let state = []

  const refreshQueue = fn => () => Promise.resolve(fn())
    .then(R.tap(verifyErrorCount))
    .then(sortTickets)
    .then(R.tap(updateNewList(state)))
    .then(R.tap(updateOldList(state)))
    .then(R.tap(setAllDestinations))
    .then(newState => { state = newState })

  setInterval(refreshQueue(fetchNewState), 1000)

  if (isDev) {
    const mock = mockFactory(1)
    document.getElementById('last-calls-title')
      .addEventListener('click', refreshQueue(() => mock(state)))
  }
})
