<template>
	<div id='app'>
		<div class='container'>
      <Container>
      </Container>
		</div>
	</div>
</template>

<script>
import Container from './components/Container'

export default {
  name: 'app',
  components: { Container }
}
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
  background: #fafafa;
}

table th{
  font-weight: bold !important;
  font-size: 1em !important;
}
</style>
