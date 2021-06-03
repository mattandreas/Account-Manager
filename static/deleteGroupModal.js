Vue.component('delete_group_modal', {
    data: function () {
        return {
            group_delete_form_submitted: false,
            selectedVps: [],
            vpsOptions: [],
        }
    },
    computed: {
        groupVpsValidation() {
            if (!this.group_delete_form_submitted) return null
            return this.selectedVps.length > 0
        },
    },
    methods: {
        resetGroupDeleteModal() {
            this.group_delete_form_submitted = false
            this.selectedVps = []
            this.vpsOptions = []
            axios.get('available_vps').then((res) => {
                this.vpsOptions = res.data
            }).catch((error) => console.log(error))
        },
        handleDeleteGroupOk(bvModalEvt) {
            bvModalEvt.preventDefault()
            this.handleDeleteGroupSubmit()
        },
        handleDeleteGroupSubmit() {
            this.group_delete_form_submitted = true
            console.log("Submitting group")
            if (!this.$refs.form.checkValidity()) {
                return
            }
            let data = {
                'vps_list': this.selectedVps
            }
            axios.post('delete_group', data).then((res) => {
                console.log(res.data)
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide('delete-group')
                })
                // reload page to refresh view with new data
                // window.history.go()
                this.$root.loadData()
            }).catch((error) => console.log(error))
        },
    },
    template: `<!---->
<b-modal id="delete-group"
         ref="modal"
         title="Delete Group"
         @show="resetGroupDeleteModal"
         @ok="handleDeleteGroupOk">
    <form ref="form" @submit.stop.prevent="handleDeleteGroupSubmit">
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