Vue.component('add_vps_modal', {
    data: function () {
        return {
            vps_form_submitted: false,
            vps_ip: '',
            vps_port: '',
            vps_username: '',
            vps_password: ''
        }
    },
    computed: {
        vpsIpValidation() {
            if (!this.vps_form_submitted) return null
            return this.vps_ip.length > 0
        },
        vpsPortValidation() {
            if (!this.vps_form_submitted) return null
            return this.vps_port.length > 0
        },
        vpsUsernameValidation() {
            if (!this.vps_form_submitted) return null
            return this.vps_username.length > 0
        },
        vpsPasswordValidation() {
            if (!this.vps_form_submitted) return null
            return this.vps_password.length > 0
        }
    },
    methods: {
        resetVpsModal() {
            this.vps_form_submitted = false
            this.vps_ip = ''
            this.vps_username = ''
            this.vps_password = ''
        },
        handleVpsOk(bvModalEvt) {
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            // Trigger submit handler
            this.handleVpsSubmit()
        },
        handleVpsSubmit() {
            this.vps_form_submitted = true
            // Exit when the form isn't valid
            if (!this.$refs.form.checkValidity()) {
                return
            }
            // post the vps data
            let data = {
                group: this.group_name,
                ip: this.vps_ip,
                port: this.vps_port,
                username: this.vps_username,
                password: this.vps_password
            }
            axios.post('new_vps', data).then((res) => {
                console.log(res.data)
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide('add-vps' + this.group_name)
                })
                // reload page to refresh view with new data
                // window.history.go()
                this.$root.loadData()
            })
        },
    },
    props: ['group_name'],
    template: `<!---->
<b-modal :id="'add-vps' + group_name"
         ref="modal"
         title="Add New Vps"
         @show="resetVpsModal"
         @hidden="resetVpsModal"
         @ok="handleVpsOk">
    <form ref="form" @submit.stop.prevent="handleVpsSubmit">
        <b-row>
            <b-col>
                <b-form-group label="IP"
                              label-for="ip-input">
                    <b-form-input id="ip-input"
                                  v-model="vps_ip"
                                  :state="vpsIpValidation"
                                  required></b-form-input>
                    <b-form-invalid-feedback :state="vpsIpValidation">
                        Your user ID must be 5-12 characters long.
                    </b-form-invalid-feedback>
                </b-form-group>
            </b-col>
            <b-col>
                <b-form-group label="Port"
                              label-for="port-input">
                    <b-form-input id="port-input"
                                  v-model="vps_port"
                                  :state="vpsPortValidation"
                                  required></b-form-input>
                    <b-form-invalid-feedback :state="vpsPortValidation">
                        Your user ID must be 5-12 characters long.
                    </b-form-invalid-feedback>
                </b-form-group>
            </b-col>
        </b-row>
        <b-form-group :state="vpsUsernameValidation"
                      label="Username"
                      label-for="username-input"
                      invalid-feedback="Username is required">
            <b-form-input id="username-input"
                          v-model="vps_username"
                          :state="vpsUsernameValidation"
                          required></b-form-input>
        </b-form-group>
        <b-form-group :state="vpsPasswordValidation"
                      label="Password"
                      label-for="password-input"
                      invalid-feedback="Password is required">
            <b-form-input id="password-input"
                          v-model="vps_password"
                          :state="vpsPasswordValidation"
                          required></b-form-input>
        </b-form-group>
    </form>
</b-modal>
`
})