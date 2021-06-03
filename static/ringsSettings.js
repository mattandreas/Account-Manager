Vue.component('rings_settings_tab', {
    data: function () {
        return {
            force_mule_hours: 0,
            force_mule_minutes: 0
        }
    },
    methods: {
        resetSettings(data) {
            this.force_mule_hours = data['force_mule_hours']
            this.force_mule_minutes = data['force_mule_minutes']
        },
        getSettings() {
            return {
                force_mule_hours: this.force_mule_hours,
                force_mule_minutes: this.force_mule_minutes
            }
        }
    },
    template: `<!---->
<b-tab title="Rings" class="text-center">
    <b-form-group label="Force Mule"
                  label-for="force-mule-input"
                  label-align="center">
        <b-form-row id="force-mule-input" align-h="around">
            <b-col>
                <b-form-spinbutton min="0"
                                   v-model="force_mule_hours"
                                   required></b-form-spinbutton>
            </b-col>
            <b-col align-self="center">
                hours
            </b-col>
            <b-col>
                <b-form-spinbutton min="0"
                                   max="59"
                                   v-model="force_mule_minutes"
                                   required></b-form-spinbutton>
            </b-col>
            <b-col align-self="center">
                minutes
            </b-col>
        </b-form-row>
    </b-form-group>
</b-tab>
`
})