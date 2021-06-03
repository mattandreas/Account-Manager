Vue.component('tan_settings_tab', {
    data: function () {
        return {
            green_input: 0,
            blue_input: 0,
            red_input: 0,
            black_input: 0,
            force_mule_hours: 0,
            force_mule_minutes: 0
        }
    },
    methods: {
        resetSettings(data) {
            this.green_input = data['green']
            this.blue_input = data['blue']
            this.red_input = data['red']
            this.black_input = data['black']
            this.force_mule_hours = data['force_mule_hours']
            this.force_mule_minutes = data['force_mule_minutes']
        },
        getSettings() {
            return {
                green: this.green_input,
                blue: this.blue_input,
                red: this.red_input,
                black: this.black_input,
                force_mule_hours: this.force_mule_hours,
                force_mule_minutes: this.force_mule_minutes
            }
        }
    },
    template: `<!---->
<b-tab title="Tan" class="text-center">
    <b-form-group label="Green"
                  label-for="green-input"
                  label-align="center">
        <b-form-spinbutton id="green-input"
                           min="0"
                           v-model="green_input"
                           required></b-form-spinbutton>
    </b-form-group>
    <b-form-group label="Blue"
                  label-for="blue-input"
                  label-align="center">
        <b-form-spinbutton id="blue-input"
                           min="0"
                           v-model="blue_input"
                           required></b-form-spinbutton>
    </b-form-group>
    <b-form-group label="Red"
                  label-for="red-input"
                  label-align="center">
        <b-form-spinbutton id="red-input"
                           min="0"
                           v-model="red_input"
                           required></b-form-spinbutton>
    </b-form-group>
    <b-form-group label="Black"
                  label-for="black-input"
                  label-align="center">
        <b-form-spinbutton id="black-input"
                           min="0"
                           v-model="black_input"
                           required></b-form-spinbutton>
    </b-form-group>
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