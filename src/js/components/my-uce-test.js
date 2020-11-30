import uce from 'uce-lib'
import browser from 'webextension-polyfill'
import {
  AUTOMATIC_DATA_UPDATE,
  UPDATE_INTERVAL,
  TOKEN_DATA,
  UPDATE_IN_PROGRESS,
  LAST_UPDATE,
  NEXT_UPDATE,
  LAST_UPDATE_ERROR,
  UPDATE_ALARM,
  userAgent
} from './lib/keys.js'
import { getHourOffset } from './lib/get-hour-offset.js'

uce.then(({ define, render, html, svg, css }) => {
  define('my-uce-test', {
    style: selector => css`${selector} {
      font-weight: bold;
      color: blue;
    }`,
    props: {
      lastUpdate: null,
      nextUpdate: null,
      updateInProgress: false,
      lastUpdateError: {},
      tokenData: null,
      automaticDataUpdate: true,
      updateInterval: 12
    },
    bound: ['storageListener'],
    render () {
      const {
        lastUpdate,
        nextUpdate,
        updateInProgress,
        lastUpdateError
      } = this.props
      this.html`
      <div>
        <div class='stats-container'>
          <h2>Stats</h2>
          <dl>
            <dt>Last Update</dt>
            <dd>${updateInProgress
              ? 'Updating...'
              : lastUpdate
                ? new Date(lastUpdate).toLocalString()
                : 'loading...'}
              ${updateInProgress
                ? ''
                : lastUpdateError && lastUpdateError.message
                  ? ` (Error: ${lastUpdateError.message} on ${(new Date(lastUpdateError.timestamp)).toLocaleString()})`
                  : ''}</dd>
            <dt>Next Update</dt>
            <dd>${updateInProgress
              ? 'Updating...'
              : nextUpdate
                ? new Date(nextUpdate).toLocalString()
                : '...loading'}</dd>
          </dl>
        </div>

      </div>`
    },
    async connected () {
      const {
        [LAST_UPDATE]: lastUpdate,
        [NEXT_UPDATE]: nextUpdate,
        [UPDATE_IN_PROGRESS]: updateInProgress,
        [LAST_UPDATE_ERROR]: lastUpdateError
      } = await browser.storage.local.get({
        [LAST_UPDATE]: null,
        [NEXT_UPDATE]: null,
        [UPDATE_IN_PROGRESS]: false,
        [LAST_UPDATE_ERROR]: {
          message: '',
          timestamp: null
        }
      })

      const {
        [TOKEN_DATA]: tokenData,
        [AUTOMATIC_DATA_UPDATE]: automaticDataUpdate,
        [UPDATE_INTERVAL]: updateInterval
      } = await browser.storage.sync.get({
        [AUTOMATIC_DATA_UPDATE]: true,
        [UPDATE_INTERVAL]: 12,
        [TOKEN_DATA]: null
      })

      this.props.lastUpdate = lastUpdate
      this.props.nextUpdate = nextUpdate
      this.props.updateInProgress = updateInProgress
      this.props.lastUpdateError = lastUpdateError

      this.props.tokenData = tokenData
      this.props.automaticDataUpdate = automaticDataUpdate
      this.props.updateInterval = updateInterval

      browser.storage.onChanged.addListener(this.storageListener)
    },
    disconnected () {
      browser.storage.onChanged.remove(this.storageListener)
    },
    async storageListener (changes, areaName) {
      if (areaName === 'local' && changes[UPDATE_IN_PROGRESS]) {
        this.props.updateInProgress = changes[UPDATE_IN_PROGRESS].newValue
      }

      if (areaName === 'local' && changes[LAST_UPDATE]) {
        this.props.lastUpdate = changes[LAST_UPDATE].newValue
      }

      if (areaName === 'local' && changes[NEXT_UPDATE]) {
        this.props.nextUpdate = changes[NEXT_UPDATE].newValue
      }

      if (areaName === 'local' && changes[LAST_UPDATE_ERROR]) {
        this.props.lastUpdateError = changes[LAST_UPDATE_ERROR].newValue
      }

      if (areaName === 'sync' && changes[UPDATE_INTERVAL]) {
        if (this.props.automaticDataUpdate) {
          browser.alarms.clear(UPDATE_ALARM)
          const { lastUpdate } = this.props.lastUpdate
          const nextUpdate = getHourOffset(changes[UPDATE_INTERVAL].newValue, lastUpdate)
          browser.alarms.create(UPDATE_ALARM, { when: nextUpdate.valueOf() })
          await browser.storage.local.set({ [NEXT_UPDATE]: nextUpdate.toISOString() })
        }
      }

      if (areaName === 'sync' && changes[AUTOMATIC_DATA_UPDATE]) {
        if (changes[AUTOMATIC_DATA_UPDATE].newValue === true) {
          browser.alarms.clear(UPDATE_ALARM)
          const { lastUpdate } = this.props.lastUpdate
          const nextUpdate = getHourOffset(changes[AUTOMATIC_DATA_UPDATE].newValue, lastUpdate)
          browser.alarms.create(UPDATE_ALARM, { when: nextUpdate.valueOf() })
          await browser.storage.local.set({ [NEXT_UPDATE]: nextUpdate.toISOString() })
        } else {
          browser.alarms.clear(UPDATE_ALARM)
          await browser.storage.local.set({ [NEXT_UPDATE]: null })
        }
      }
    }
  })
})
