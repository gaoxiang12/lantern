/**
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'

import Navigation from './Navigation.react'
import LanternStatus from './LanternStatus.react'
import * as backend from '../actions/BackendActions'

/* Needed for onTouchTap
 * Can go away when react 1.0 release
 * Check this repo:
 * https://github.com/zilverline/react-tap-event-plugin
 */
injectTapEventPlugin()

class App extends Component {
  constructor(props) {
    super(props)
    this.fitSheetsToScreen = this.fitSheetsToScreen.bind(this)
  }

  componentDidMount() {
    this.initWebsocket()
    this.fitSheetsToScreen()
    window.onresize = (e) => {
      e.preventDefault()
      this.fitSheetsToScreen()
    }
  }

  componentWillUnmount() {
    this.closing = true
    this.ws.close()
  }

  fitSheetsToScreen() {
    const windowHeight = window.innerHeight
    const topSheet = document.getElementById('top_sheet')
    const middleSheet = document.getElementById('middle_sheet')
    const bottomSheet = document.getElementById('bottom_sheet')
    if (windowHeight > 550 ) {
      topSheet.style.height = `${windowHeight * 0.21}px`
      middleSheet.style.height = `${windowHeight * 0.5}px`
      bottomSheet.style.height = `${(windowHeight * 0.29) + 2}px`
      document.body.className = 'overflow'
    } else {
      topSheet.style.height = '180px'
      middleSheet.style.height = '425px'
      bottomSheet.style.height = '245px'
      document.body.className = ''
    }
    // console.log(windowHeight, { top: topSheet.style.height, middle: middleSheet.style.height, bottom: bottomSheet.style.height })
  }

  initWebsocket() {
    const url = document.location
    this.ws = new WebSocket(`ws://${url.host}/data`)
    this.ws.onopen = () => {
      this.props.dispatch(backend.connected({ws: this.ws}))
    }

    this.ws.onclose = () => {
      this.props.dispatch(backend.gone())
      if (!this.closing) {
        window.setTimeout(() => {
          this.initWebsocket()
        }, 2000) // reconnect every 2s
      }
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.props.dispatch(backend.message(message))
    }
  }

  render() {
    return (
      <div className="wrapper">
        <div id="main_nav">
          <Navigation />
        </div>
        <LanternStatus />
        <section id="top_sheet">
          <div className="sheet__container">
            <img className="logo" src="/img/lantern_logo.svg" />
          </div>
        </section>
        { this.props.children }
      </div>
    )
  }
}

App.propTypes = {
  data: React.PropTypes.object,
  children: React.PropTypes.element,
  dispatch: React.PropTypes.func,
}

App.contextTypes = {
  router: React.PropTypes.object,
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state,
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(App)
