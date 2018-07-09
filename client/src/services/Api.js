import axios from 'axios'

// const apiHost = 'localhost'
const apiHost = process.env.API_HOST || '127.0.0.1'
const apiPort = process.env.APP_PORT || '8081'

export default () => {
  return axios.create({
    baseURL: `http://${apiHost}:${apiPort}`
  })
}
