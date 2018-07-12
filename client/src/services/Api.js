import axios from 'axios'

// const apiHost = 'localhost'
const apiHost = process.env.API_HOST || 'localhost'
const apiPort = process.env.API_PORT || '8081'

export default () => {
  return axios.create({
    baseURL: `http://${apiHost}:${apiPort}`
  })
}
