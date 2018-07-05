import axios from 'axios'

// const apiHost = 'localhost'
const apiHost = '172.16.11.172'

export default () => {
  return axios.create({
    baseURL: `http://${apiHost}:8081`
  })
}
