import Api from '@/services/Api'

export default {
  fetchAccounts () {
    return Api().get('accounts')
  },

  addAccount (params) {
    return Api().Account('account', params)
  },

  updateAccount (params) {
    return Api().put('accounts/' + params.id, params)
  },

  getAccount (params) {
    return Api().get('account/' + params.id)
  },

  deleteAccount (id) {
    return Api().delete('accounts/' + id)
  }
}
