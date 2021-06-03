Vue.component('kill_group_modal', {
    data: function () {
        return {
            form_submitted: false,
            selectedVps: [],
            vpsOptions: [],
        }
    },
    computed: {
        groupVpsValidation() {
            if (!this.form_submitted) return null
            return this.selectedVps.length > 0
        },
    },
    methods: {
        resetModal() {
            this.form_submitted = false
            this.selectedVps = []
            this.vpsOptions = []
            axios.get('available_vps').then((res) => {
                this.vpsOptions = res.data
            }).catch((error) => console.log(error))
        },
        handleOk(bvModalEvt) {
            bvModalEvt.preventDefault()
            this.handleSubmit()
        },
        handleSubmit() {
            this.form_submitted = true
            console.log("Submitting group")
            if (!this.$refs.form.checkValidity()) {
                return
            }
            let data = {
                'vps_list': this.selectedVps
            }
            axios.post('kill_group', data).then((res) => {
                console.log(res.data)
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide('kill-group')
                })
                // reload page to refresh view with new data
                // window.history.go()
                this.$root.loadData()
            }).catch((error) => console.log(error))
        },
    },
    template: `<!---->
<b-modal id="kill-group"
         ref="modal"
         title="Kill Group"
         @show="resetModal"
         @ok="handleOk">
    <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group label="Available Vps"
                      label-for="vps-selection"
                      :state="groupVpsValidation"
                      invalid-feedback="At least one vps must be selected">
            <b-form-select v-model="selectedVps"
                           :options="vpsOptions"
                           :state="groupVpsValidation"
                           multiple
                           :select-size="10"
                           required></b-form-select>
        </b-form-group>
    </form>
</b-modal>
`
})