import Api from '@/services/Api'

export default {
  fetchAgents (fields) {
    return Api().get('agents', {
      params: {
        fields
      }
    })
  },

  addAgent (params) {
    return Api().post('agent', params)
  },

  updateAgent (params) {
    return Api().put('agents/' + params.id, params)
  },

  getAgent (params) {
    return Api().get('agent/' + params.id)
  },

  deleteAgent (id) {
    return Api().delete('agents/' + id)
  }
}
