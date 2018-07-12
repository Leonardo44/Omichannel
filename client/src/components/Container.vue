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
        
        <v-list-tile router v-bind:to="{name: 'home'}" :active-class="colors.primary.text" exact>
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Inicio</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-subheader>Reportes</v-subheader>
        <v-list-group
            v-for="(item, i) in menu"
            :key="i"
            :prepend-icon="item.icon"
            no-action
            :active-class="colors.primary.text"
          >
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile
              v-for="(subItem, _i) in item.items"
              :key="_i"
              router 
              v-bind:to="{name: subItem.action, params: {colors: colors}}" 
              :exact-active-class="colors.primary.text" 
              :active-class="colors.primary.text"
              exact
              :title="subItem.title"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar :color="colors.primary.back" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>EVE</v-toolbar-title>
    </v-toolbar>

    <v-content>
      <v-container fluid>

        <router-view></router-view>

      </v-container>
    </v-content>

    <v-footer :color="colors.primary.back" app>
      <span class="white--text">&copy; 2017</span>
    </v-footer>

  </v-app>
</template>

<script>
  import { colors as configColors, menu as menuData } from '@/config.js'
  
  export default {
    data: () => ({
      colors: {},
      drawer: null,
      menu: null
    }),
    created () {
      this.colors = configColors
      this.menu = menuData
    }
  }
</script>