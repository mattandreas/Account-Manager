Vue.component('wine_settings_tab', {
    data: function () {
        return {
            hours_until_short_mule: 0,
            minutes_until_short_mule: 0,
            short_mule_time_min: 0,
            short_mule_time_max: 0,
            long_mule_time: 0,
            long_mule_deviation: 0
        }
    },
    methods: {
        resetSettings(data) {
            this.hours_until_short_mule = data['hours_until_short_mule']
            this.minutes_until_short_mule = data['minutes_until_short_mule']
            this.short_mule_time_min = data['short_mule_time_min']
            this.short_mule_time_max = data['short_mule_time_max']
            this.long_mule_time = data['long_mule_time']
            this.long_mule_deviation = data['long_mule_deviation']
        },
        getSettings() {
            return {
                hours_until_short_mule: this.hours_until_short_mule,
                minutes_until_short_mule: this.minutes_until_short_mule,
                short_mule_time_min: this.short_mule_time_min,
                short_mule_time_max: this.short_mule_time_max,
                long_mule_time: this.long_mule_time,
                long_mule_deviation: this.long_mule_deviation
            }
        }
    },
    template: `<!---->
<b-tab title="Wine" class="text-center">
    <b-form-group label="Time until short mule"
                  label-for="input"
                  label-align="center">
        <b-form-row id="input" aligh-h="around">
            <b-col>
                <b-form-spinbutton min="-1"
                                   v-model="hours_until_short_mule"
                                   required></b-form-spinbutton>
            </b-col>
            <b-col align-self="center">
                Hours
            </b-col>
            <b-col>
                <b-form-spinbutton min="0"
                                   max="59"
                                   v-model="minutes_until_short_mule"
                                   required></b-form-spinbutton>
            </b-col>
            <b-col align-self="center">
                Minutes
            </b-col>
        </b-form-row>
    </b-form-group>
    <b-form-group label="Short mule time"
                  label-for="input"
                  label-align="center">
        <b-form-row id="input" align-h="around">
            <b-col>
                <b-form-spinbutton min="0"
                                   v-model="short_mule_time_min"
                                   required></b-form-spinbutton>
            </b-col>
            <b-col align-self="center">
                to
            </b-col>
            <b-col>
                <b-form-spinbutton min="0"
                                   v-model="short_mule_time_max"
                                   required></b-form-spinbutton>
            </b-col>
            <b-col align-self="center">
                minutes
            </b-col>
        </b-form-row>
    </b-form-group>
    <b-form-group label="Long mule time"
                  label-for="input"
                  label-align="center">
        <b-form-row id="input" align-h="around">
            <b-col>
                <b-form-spinbutton min="0"
                                   v-model="long_mule_time"
                                   required></b-form-spinbutton>
            </b-col>
            <b-col align-self="center">
                hours +-
            </b-col>
            <b-col>
                <b-form-spinbutton min="0"
                                   v-model="long_mule_deviation"
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