Vue.component('add_account_modal', {
    data: function () {
        return {
            account_form_submitted: false,
            account_username: '',
            account_password: '',
            account_proxy_ip: '',
            account_proxy_port: '',
        }
    },
    computed: {
        accountUsernameValidation() {
            if (!this.account_form_submitted) return null
            return this.account_username.length > 0
        },
        accountPasswordValidation() {
            if (!this.account_form_submitted) return null
            return this.account_password.length > 0
        },
        accountProxyIpValidation() {
            if (!this.account_form_submitted) return null
            return this.account_proxy_ip.length > 0
        },
        accountProxyPortValidation() {
            if (!this.account_form_submitted) return null
            return this.account_proxy_port.length > 0
        }
    },
    methods: {
        resetAccountModal() {
            this.account_form_submitted = false
            this.account_username = ''
            this.account_password = ''
            this.account_proxy_ip = ''
            this.account_proxy_port = ''
        },
        handleAccountOk(bvModalEvt) {
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            // Trigger submit handler
            this.handleAccountSubmit()
        },
        handleAccountSubmit() {
            this.account_form_submitted = true
            // Exit when the form isn't valid
            if (!this.$refs.form.checkValidity()) {
                return
            }
            // post the vps data
            let data = {
                username: this.account_username,
                password: this.account_password,
                proxy_ip: this.account_proxy_ip,
                proxy_port: this.account_proxy_port
            }
            axios.post('/new_account', data).then((res) => {
                console.log(res.data)
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide('add-account')
                })
                // reload page to refresh view with new data
                // window.history.go()
                this.$root.loadData()
            }).catch((error) => console.log(error))
        },
    },
    template: `<!---->
<b-modal id="add-account"
         ref="modal"
         title="Add New Account"
         @show="resetAccountModal"
         @hidden="resetAccountModal"
         @ok="handleAccountOk">
    <form ref="form" @submit.stop.prevent="handleAccountSubmit">
        <b-form-group :state="accountUsernameValidation"
                      label="Username"
                      label-for="username-input"
                      invalid-feedback="Username is required">
            <b-form-input id="username-input"
                          v-model="account_username"
                          :state="accountUsernameValidation"
                          required></b-form-input>
        </b-form-group>
        <b-form-group :state="accountPasswordValidation"
                      label="Password"
                      label-for="password-input"
                      invalid-feedback="Password is required">
            <b-form-input id="password-input"
                          v-model="account_password"
                          :state="accountPasswordValidation"
                          required></b-form-input>
        </b-form-group>
        <b-row>
            <b-col>
                <b-form-group :state="accountProxyIpValidation"
                              label="Proxy Ip"
                              label-for="proxy-input"
                              invalid-feedback="Password is required">
                    <b-form-input id="proxy-input"
                                  v-model="account_proxy_ip"
                                  :state="accountProxyIpValidation"
                                  required></b-form-input>
                </b-form-group>
            </b-col>
            <b-col>
                <b-form-group :state="accountProxyPortValidation"
                              label="Proxy Port"
                              label-for="proxy-input"
                              invalid-feedback="Password is required">
                    <b-form-input id="proxy-input"
                                  v-model="account_proxy_port"
                                  :state="accountProxyPortValidation"
                                  required></b-form-input>
                </b-form-group>
            </b-col>
        </b-row>
    </form>
</b-modal>
`
})