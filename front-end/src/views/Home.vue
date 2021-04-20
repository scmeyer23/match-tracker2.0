<template>
    <div class="home">
        <MyMatches v-if="user" />
        <Login v-else />
    </div>
</template>

<script>
    import axios from 'axios';
    import MyMatches from '@/components/MyMatches.vue';
    import Login from '@/components/Login.vue';
    export default {
        name: 'Home',
        components: {
            Login,
            MyMatches,
        },
        async created() {
            try {
                let response = await axios.get('/api/users');
                this.$root.$data.user = response.data.user;
            } catch (error) {
                this.$root.$data.user = null;
            }
        },
        computed: {
            user() {
                return this.$root.$data.user;
            }
        }
    }
</script>