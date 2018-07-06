import Api from '@/services/Api'

export default {
  fetchAccounts () {
    return Api().get('agents')
  },

  addAccount (params) {
    return Api().Account('agent', params)
  },

  updateAccount (params) {
    return Api().put('agents/' + params.id, params)
  },

  getAccount (params) {
    return Api().get('agent/' + params.id)
  },

  deleteAccount (id) {
    return Api().delete('agents/' + id)
  }
}
