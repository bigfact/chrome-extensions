<template>
	<section id="c-app">
		<a v-for="i in link" class="row link tac" v-link="$key">{{ i }}</a>
	</section>
</template>

<script>

  var $data = {
    link: {
      '/pie': '饼图',
      '/line': '折线图',
    }
  }

  export default {
    data() {
      return $data
    },
    ready() { },
    methods: { },
    components: { },
  }

</script>

<style lang="scss">
	@import '../sass/_globals.scss';
	#c-app {

	}
</style>