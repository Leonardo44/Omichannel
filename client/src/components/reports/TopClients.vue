<template>
    <v-layout row wrap>

      <v-flex xs12>
        <v-form ref="form" v-model="frmIsValid" lazy-validation>
          <h2 :class="colors.primary.text + ' text-xs-center text-sm-center text-md-center text-lg-center'">Top 10 Clientes</h2>
          <br>
          <v-layout row wrap justify-center class="mb-5">
            <v-flex xs12 sm12 md5 lg5>
              <v-select
                v-model="account"
                :items="accounts" item-text="name" item-value="_id"
                :rules="[v => !!v || 'La cuenta es requerida']"
                label="Cuenta"
                required :color="colors.secondary.back"
              ></v-select>
            </v-flex>
            <v-spacer></v-spacer>
            <v-flex xs12 sm12 md5 lg5>
              <v-select
                v-model="organization"
                :items="organizations" item-text="friendly_name" item-value="_id"
                :rules="[v => !!v || 'La organización es requerida']"
                label="Organización"
                required :color="colors.secondary.back"
              ></v-select>
            </v-flex>
          </v-layout>

          <v-layout row wrap>
            <v-flex xs12 sm12 md5 lg5>
              <v-layout row wrap>
                <span class="mb-3">Ingrese los límites de tiempo en los cuales se filtrarán los datos</span>
                <v-flex xs12 sm12 md6 lg6>
                  <v-menu
                    ref="initDateMenu"
                    v-model="initDateMenu"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                    :nudge-right="40"
                    :return-value.sync="initDate"
                    :close-on-content-click="false"
                  >
                    <v-text-field
                      ref="initDateControl"
                      slot="activator"
                      v-model="initDate"
                      label="Fecha de Inicio"
                      prepend-icon="event"
                      readonly
                      :color="colors.secondary.back"
                      required
                      :rules="[rules.date.required, rules.date.format]"
                    ></v-text-field>
                    <v-date-picker v-model="initDate" first-day-of-week="1" locale="es_es" scrollable :color="colors.secondary.back" @input="$refs.initDateMenu.save(initDate)"></v-date-picker>

                  </v-menu>

                  <v-menu
                    ref="endDateMenu"
                    v-model="endDateMenu"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                    :nudge-right="40"
                    :return-value.sync="endDate"
                    :close-on-content-click="false"
                  >
                    <v-text-field
                      ref="endDateControl"
                      slot="activator"
                      v-model="endDate"
                      label="Fecha de Fin"
                      prepend-icon="event"
                      readonly
                      required
                      :color="colors.secondary.back"
                      :rules="[rules.date.required, rules.date.format]"
                    ></v-text-field>
                    <v-date-picker v-model="endDate" first-day-of-week="1" locale="es_es" scrollable :color="colors.secondary.back" @input="$refs.endDateMenu.save(endDate)"></v-date-picker>
                  </v-menu>
                </v-flex>

                <v-flex xs12 sm12 md6 lg6>
                  <v-menu
                    ref="initTimeMenu"
                    :close-on-content-click="false"
                    v-model="initTimeMenu"
                    :nudge-right="40"
                    :return-value.sync="initTime"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <v-text-field
                      ref="initTimeControl"
                      slot="activator"
                      v-model="initTime"
                      label="Hora de Inicio"
                      prepend-icon="access_time"
                      readonly
                      required
                      :color="colors.secondary.back"
                      :rules="[rules.time.required, rules.time.format]"
                    ></v-text-field>
                    <v-time-picker v-model="initTime" first-day-of-week="1" locale="es_es" scrollable :color="colors.secondary.back" @change="$refs.initTimeMenu.save(initTime)"></v-time-picker>

                  </v-menu>

                  <v-menu
                    ref="endTimeMenu"
                    :close-on-content-click="false"
                    v-model="endTimeMenu"
                    :nudge-right="40"
                    :return-value.sync="endTime"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <v-text-field
                      ref="endTimeControl"
                      slot="activator"
                      v-model="endTime"
                      label="Hora de Fin"
                      prepend-icon="access_time"
                      readonly
                      required
                      :color="colors.secondary.back"
                      :rules="[rules.time.required, rules.time.format]"
                    ></v-text-field>
                    <v-time-picker v-model="endTime" first-day-of-week="1" locale="es_es" scrollable :color="colors.secondary.back" @change="$refs.endTimeMenu.save(endTime)"></v-time-picker>

                  </v-menu>
                </v-flex>
              </v-layout>
            </v-flex>

            <v-spacer></v-spacer>

            <v-flex xs12 sm12 md5 lg5>
              <v-layout column justify-center>
              <span class="">Seleccione el tipo de intervalo en el cual se dividirán los datos</span>
                <div>
                  <v-radio-group v-model="interval" required :rules="[v => !!v || 'Debe seleccionar un intervalo']">
                    <v-radio v-for="(_opt) in intervalOptions" :key="_opt.value" :label="_opt.text" :value="_opt.value" :color="colors.secondary.back"></v-radio>
                  </v-radio-group>
                </div>
              </v-layout>
            </v-flex>
          </v-layout>

          <v-layout row wrap justify-center>
            <v-btn
              ref="btnSubmit"
              :disabled="!frmIsValid || isLoading"
              :color="colors.primary.back + ' white--text'"
              @click="submit"
            >
              Enviar datos
            </v-btn>
            <v-btn @click="clear" :color="colors.primary.text">Limpiar</v-btn>
          </v-layout>

        </v-form>
      </v-flex>
      
      <v-dialog
        v-model="loader"
        width="500"
        persistent
      >
        <v-card>
          <v-layout pa-5 justify-center align-content-center align-center>
            <v-progress-circular indeterminate :size="70" :width="7" :color="colors.primary.back"></v-progress-circular>
          </v-layout>
        </v-card>
      </v-dialog>

      <v-dialog v-model="resultCont" fullscreen hide-overlay transition="dialog-bottom-transition">
        <form ref="frmReportPDF" method="POST" action="http://172.16.11.172:9000/api/account/averages_messages/pdf" target="__blank">
          <input type="hidden" name="data" :value="JSON.stringify(reportData)">
        </form>

        <form ref="frmReportExcel" method="POST" action="http://172.16.11.172:9000/api/account/averages_messages/excel" target="__blank">
          <input type="hidden" name="data" :value="JSON.stringify(reportData)">
        </form>
        <v-card>
          <v-toolbar dark :color="colors.primary.back">
            <v-btn icon dark @click.native="resultCont = false">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Resultado</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>

              <v-tooltip bottom>
                <v-btn @click="$refs.frmReportPDF.submit()" flat slot="activator">
                  <v-icon>description</v-icon>
                </v-btn>
                <span>Exportar a PDF</span>
              </v-tooltip>

              <v-tooltip bottom>
                <v-btn @click="$refs.frmReportExcel.submit()" flat slot="activator">
                  <v-icon>view_list</v-icon>
                </v-btn>
                <span>Exportar a Excel</span>
              </v-tooltip>

            </v-toolbar-items>
          </v-toolbar>

          <br><br>

          <!-- RESULT TABLE -->
          <v-data-table
            :headers="dataHeader"
            :items="mainData"
            hide-actions
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <tr>
                <td class="text-xs-center text-sm-center text-md-center text-lg-center" colspan="2"><b>Fecha: {{ props.item.date }}</b></td>
              </tr>
              <tr v-for="client in props.item.clients">
                <td class="text-xs-center text-sm-center text-md-center text-lg-center"><b>{{ client.name }}</b></td>
                <td class="text-xs-center text-sm-center text-md-center text-lg-center"><b>{{ client.cant }}</b></td>
              </tr>
            </template>
          </v-data-table>
          <br><br>
        </v-card>
      </v-dialog>

      <v-snackbar
        v-model="dateErrorToast" color="error" right top
      >
        {{ dateToastMsg }}
        <v-btn
          dark
          flat
          @click="dateErrorToast = false"
        >
          Cerrar
        </v-btn>
      </v-snackbar>
    </v-layout>

</template>

<script>
  import Api from '@/services/Api'
  import moment from 'moment'
  import AccountsService from '@/services/AccountsService'
  import OrganizationsService from '@/services/OrganizationsService'

  export default {
    props: ['colors'],
    data: () => ({
      //  Data
      accounts: [],
      organizations: [],
      intervalOptions: [
        {text: '1 Día', value: 'D:1'},
        {text: '1 Hora', value: 'H:1'},
        {text: '30 Minutos', value: 'M:30'}
      ],
      frmIsValid: true,
      mainData: [],
      reportData: null,
      dataHeader: [
        { text: 'Cliente [Interfaz]', value: 'client', align: 'center', sortable: false, 'class': 'indigo white--text' },
        { text: 'Cantidad de Tickets', value: 'tickets', sortable: false, align: 'center', 'class': 'indigo white--text' }
      ],
      isLoading: false,

      // Form Fields
      account: null,
      organization: null,
      initDate: null,
      endDate: null,
      initTime: null,
      endTime: '23:59',
      interval: null,

      //  Validation Rules
      rules: {
        date: {
          required: v => !!v || 'Debes ingresar una fecha',
          format: v => /^\d{4}-\d{2}-\d{2}$/.test(v) || 'Debes ingresar una fecha válida'
        },
        time: {
          required: v => !!v || 'Debes ingresar una hora',
          format: v => /^\d{2}:\d{2}$/.test(v) || 'Debes ingresar una hora válida'
        }
      },

      //  UI Components Initialization
      initDateMenu: false,
      endDateMenu: false,
      initTimeMenu: false,
      endTimeMenu: false,
      loader: false,
      resultCont: false,
      dateErrorToast: null,
      dateToastMsg: false
    }),

    mounted () {
      this.getAccounts()
      this.getOrganizations()
    },
    created () {
      moment().locale('es_sv')
      this.initDate = this.endDate = moment().format('YYYY-MM-DD')
      this.initTime = moment().utc(true).format('HH:mm')
      this.interval = this.intervalOptions[0].value
    },
    methods: {
      async getAccounts () {
        const response = await AccountsService.fetchAccounts()
        this.accounts = response.data.accounts
      },
      async getOrganizations () {
        const response = await OrganizationsService.fetchOrganizations()
        // console.log(response.data.organizations)
        this.organizations = response.data.organizations
      },
      async submit () {
        let datesData = {
          init: moment(`${this.$refs.initDateControl.value} ${this.$refs.initTimeControl.value}`, 'YYYY-MM-DD HH:mm'),
          end: moment(`${this.$refs.endDateControl.value} ${this.$refs.endTimeControl.value}`, 'YYYY-MM-DD HH:mm')
        }

        let isValid = datesData.init > datesData.end
        let equals = datesData.init.isSame(datesData.end)

        this.$refs.form.validate()

        if (equals || isValid) {
          this.dateToastMsg = equals ? 'Fechas inválidas:Las fechas deben ser distintas' : 'Fechas inválidas: La fecha inicial debe ser menor a la final.'
          this.dateErrorToast = true
        } else {
          if (this.$refs.form.validate()) {
            this.initLoad()
            this.isLoading = true
            const res = await Api().post('/reports/top_clients', {
              account_id: this.account,
              organization_id: this.organization,
              interval: this.interval,
              intervalData: {
                init: {date: this.initDate, time: this.initTime},
                end: {date: this.endDate, time: this.endTime}
              }
            })
            this.mainData = res.data
            let auxData = res.data
            let _aux = []
  
            for (let $dateData in auxData.data) {
              let row = {date: $dateData.split('_').join(' '), clients: []}
              for (let $dKey in auxData.data[$dateData]) {
                row.clients.push({ name: auxData.data[$dateData][$dKey].name, cant: auxData.data[$dateData][$dKey].cant })
              }
              _aux.push(row)
            }
  
            this.mainData = _aux
            this.reportData = res.data
            this.reportData.data = this.mainData
            this.endLoad()
            this.isLoading = false
            this.resultCont = true
          }
        }
      },
      initLoad () {
        this.loader = true
      },
      endLoad () {
        this.loader = false
      },
      clear () {
        this.$refs.form.reset()
      }
    }
  }
</script>
