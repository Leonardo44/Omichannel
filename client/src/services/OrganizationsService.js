import Api from '@/services/Api'

export default {
  fetchOrganizations () {
    return Api().get('organizations')
  },

  addOrganization (params) {
    return Api().Account('organization', params)
  },

  updateOrganization (params) {
    return Api().put('organizations/' + params.id, params)
  },

  getOrganization (params) {
    return Api().get('organization/' + params.id)
  },

  deleteOrganization (id) {
    return Api().delete('organizations/' + id)
  }
}
