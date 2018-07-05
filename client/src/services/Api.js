import axios from 'axios'

// const apiHost = 'localhost'
const apiHost = '127.0.0.1'

export default () => {
  return axios.create({
    baseURL: `http://${apiHost}:8081`
  })
}
