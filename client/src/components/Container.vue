<template>
  <v-app id='inspire'>

    <v-navigation-drawer v-model='drawer' fixed app>
      <v-toolbar flat class='transparent'>
        <v-list class='pa-0'>
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <img src='https://randomuser.me/api/portraits/men/85.jpg' >
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>John Leider</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>

      <v-list class='pt-0'>
        <v-divider></v-divider>
        
        <v-list-tile router v-bind:to="{name: 'home'}" exact>
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile router v-bind:to="{name: 'home'}" exact>
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Contact</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-group prepend-icon='description' :value="true">

          <v-list-tile slot='activator'>
            <v-list-tile-title>Reportes</v-list-tile-title>
          </v-list-tile>
          
          <v-list-group sub-group no-action :value="true">
            <v-list-tile slot='activator'>
              <v-list-tile-title>Por Cuentas</v-list-tile-title>
            </v-list-tile>
            <v-list-tile v-for='(_a, i) in reports.accounts' :key='i' router v-bind:to="{name: _a.action}" exact>
              <v-list-tile-title class="text-sm-left" v-text='_a.text'></v-list-tile-title>
            </v-list-tile>
          </v-list-group>

          <v-list-group sub-group no-action :value="true">
            <v-list-tile slot='activator'>
              <v-list-tile-title>Por Agentes</v-list-tile-title>
            </v-list-tile>
            <v-list-tile v-for='(_a, i) in reports.agents' :key='i' router v-bind:to="{name: _a.action}" exact>
              <v-list-tile-title class="text-sm-left" v-text='_a.text'></v-list-tile-title>
            </v-list-tile>
          </v-list-group>

        </v-list-group>
        
      </v-list>
    </v-navigation-drawer>

    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-toolbar>

    <v-content>
      <v-container fluid>

        <router-view></router-view>

      </v-container>
    </v-content>

    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2017</span>
    </v-footer>

  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: null,
    reports: {
      accounts: [
        {text: 'Tickets por Interfaz', icon: 'settings', action: 'reports_tickets_interface'},
        {text: 'Promedio de Mensajes por Ticket por Interfaz', icon: 'settings', action: 'reports_avg_msg_tickets'},
        {text: 'Tickets por Cliente', icon: 'settings', action: 'reports_client_tickets'}
      ],
      agents: [
        []
      ]
    }
  })
}
</script>