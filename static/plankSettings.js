Vue.component('plank_settings_tab', {
    data: function () {
        return {
            oak_input: 0,
            oak_smartbuy_increase: 1,
            oak_buy_amount: 3000,
            teak_input: 0,
            teak_smartbuy_increase: 1,
            teak_buy_amount: 3000,
            mahogany_input: 0,
            mahogany_smartbuy_increase: 1,
            mahogany_buy_amount: 3000,
            force_mule_hours: 0,
            force_mule_minutes: 0,
            options: ['Oak', 'Teak', 'Mahogany']
        }
    },
    methods: {
        resetSettings(data) {
            this.oak_input = data['oak']
            this.oak_smartbuy_increase = data['oak_smartbuy_increase']
            this.oak_buy_amount = data['oak_buy_amount']
            this.teak_input = data['teak']
            this.teak_smartbuy_increase = data['teak_smartbuy_increase']
            this.teak_buy_amount = data['teak_buy_amount']
            this.mahogany_input = data['mahogany']
            this.mahogany_smartbuy_increase = data['mahogany_smartbuy_increase']
            this.mahogany_buy_amount = data['mahogany_buy_amount']
            this.force_mule_hours = data['force_mule_hours']
            this.force_mule_minutes = data['force_mule_minutes']
        },
        getSettings() {
            return {
                oak: this.oak_input,
                oak_smartbuy_increase: this.oak_smartbuy_increase,
                oak_buy_amount: this.oak_buy_amount,
                teak: this.teak_input,
                teak_smartbuy_increase: this.teak_smartbuy_increase,
                teak_buy_amount: this.teak_buy_amount,
                mahogany: this.mahogany_input,
                mahogany_smartbuy_increase: this.mahogany_smartbuy_increase,
                mahogany_buy_amount: this.mahogany_buy_amount,
                force_mule_hours: this.force_mule_hours,
                force_mule_minutes: this.force_mule_minutes
            }
        }
    },
    template: `<!---->
<b-tab title="Plank" class="text-center">
        <b-form-group label="Oak"
                      label-for="input"
                      label-align="center">
            <b-form-row id="input" aligh-h="around">
                <b-col>
                    <label for="running">
                        Running
                    </label>
                    <b-form-spinbutton
                            id="running"
                            min="0"
                            v-model="oak_input"
                            required></b-form-spinbutton>
                </b-col>
                <b-col>
                    <label for="increase">
                        Smartbuy Increase
                    </label>
                    <b-form-spinbutton
                            id="increase"
                            min="1"
                            v-model="oak_smartbuy_increase"
                            required></b-form-spinbutton>
                </b-col>
                <b-col>
                    <label for="buy">
                        Buy Amount
                    </label>
                    <b-form-spinbutton
                            id="buy"
                            min="100"
                            max="10000"
                            step="100"
                            v-model="oak_buy_amount"
                            required></b-form-spinbutton>
                </b-col>
            </b-form-row>
        </b-form-group>
        <b-form-group label="Teak"
                      label-for="input"
                      label-align="center">
            <b-form-row id="input" aligh-h="around">
                <b-col>
                    <label for="running">
                        Running
                    </label>
                    <b-form-spinbutton
                            id="running"
                            min="0"
                            v-model="teak_input"
                            required></b-form-spinbutton>
                </b-col>
                <b-col>
                    <label for="increase">
                        Smartbuy Increase
                    </label>
                    <b-form-spinbutton
                            id="increase"
                            min="1"
                            v-model="teak_smartbuy_increase"
                            required></b-form-spinbutton>
                </b-col>
                <b-col>
                    <label for="buy">
                        Buy Amount
                    </label>
                    <b-form-spinbutton
                            id="buy"
                            min="100"
                            max="10000"
                            step="100"
                            v-model="teak_buy_amount"
                            required></b-form-spinbutton>
                </b-col>
            </b-form-row>
        </b-form-group>
        <b-form-group label="Mahogany"
                      label-for="input"
                      label-align="center">
            <b-form-row id="input" aligh-h="around">
                <b-col>
                    <label for="running">
                        Running
                    </label>
                    <b-form-spinbutton
                            id="running"
                            min="0"
                            v-model="mahogany_input"
                            required></b-form-spinbutton>
                </b-col>
                <b-col>
                    <label for="increase">
                        Smartbuy Increase
                    </label>
                    <b-form-spinbutton
                            id="increase"
                            min="1"
                            v-model="mahogany_smartbuy_increase"
                            required></b-form-spinbutton>
                </b-col>
                <b-col>
                    <label for="buy">
                        Buy Amount
                    </label>
                    <b-form-spinbutton
                            id="buy"
                            min="100"
                            max="10000"
                            step="100"
                            v-model="mahogany_buy_amount"
                            required></b-form-spinbutton>
                </b-col>
            </b-form-row>
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