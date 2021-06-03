Vue.component('spin_settings_tab', {
    data: function () {
        return {
            hours_until_short_mule: 0
        }
    },
    methods: {
        resetSettings(data) {
            this.hours_until_short_mule = data['hours_until_short_mule']
        },
        getSettings() {
            return {
                hours_until_short_mule: this.hours_until_short_mule
            }
        }
    },
    template: `<!---->
<b-tab title="Spin" class="text-center">
    <b-form-group label="Hours until short mule"
                  label-for="input"
                  label-align="center">
        <b-form-spinbutton id="input"
                           min="0"
                           v-model="hours_until_short_mule"
                           required></b-form-spinbutton>
    </b-form-group>
</b-tab>
`
})