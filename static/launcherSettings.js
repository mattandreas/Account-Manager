Vue.component('launcher_settings_tab', {
    data: function () {
        return {
            form_submitted: false,
            assign_amount: 0,
            run_interval: 0,
            proxy_username: '',
            proxy_password: '',
            bond_accounts: false
        }
    },
    computed: {
        accountProxyUsernameValidation() {
            if (!this.form_submitted) return null
            return this.proxy_username.length > 0
        },
        accountProxyPasswordValidation() {
            if (!this.form_submitted) return null
            return this.proxy_password.length > 0
        },
    },
    methods: {
        resetSettings(data) {
            this.form_submitted = false
            this.assign_amount = data['assign_amount']
            this.run_interval = data['run_interval']
            this.proxy_username = data['proxy_username']
            this.proxy_password = data['proxy_password']
            this.bond_accounts = data['bond_accounts']
        },
        getSettings() {
            return {
                assign_amount: this.assign_amount,
                run_interval: this.run_interval,
                proxy_username: this.proxy_username,
                proxy_password: this.proxy_password,
                bond_accounts: this.bond_accounts
            }
        }
    },
    template: `<!---->
<b-tab title="Launcher">
    <b-form-group label="Auto Assign Amount"
                  label-for="assign-input"
                  label-align="center">
        <b-form-spinbutton id="assign-input"
                           min="0"
                           v-model="assign_amount"
                           required></b-form-spinbutton>
    </b-form-group>
    <b-form-group label="Run Interval Delay"
                  label-for="run-interval-input"
                  label-align="center">
        <b-form-spinbutton id="run-interval-input"
                           min="0"
                           v-model="run_interval"
                           required></b-form-spinbutton>
    </b-form-group>
    <b-row>
        <b-col>
            <b-form-group :state="accountProxyUsernameValidation"
                          label="Proxy Username"
                          label-for="proxy-user-input"
                          invalid-feedback="Username is required">
                <b-form-input id="proxy-user-input"
                              v-model="proxy_username"
                              :state="accountProxyUsernameValidation"
                              required></b-form-input>
            </b-form-group>
        </b-col>
        <b-col>
            <b-form-group :state="accountProxyPasswordValidation"
                          label="Proxy Password"
                          label-for="proxy-pass-input"
                          invalid-feedback="Password is required">
                <b-form-input id="proxy-pass-input"
                              v-model="proxy_password"
                              :state="accountProxyPasswordValidation"
                              required></b-form-input>
            </b-form-group>
        </b-col>
    </b-row>
    <b-form-checkbox id="bond-checkbox"
                     v-model="bond_accounts"
                     name="bond-checkbox"
                     value="true"
                     unchecked-value="false">
        Enable Bond Accounts
    </b-form-checkbox>
</b-tab>
`
})