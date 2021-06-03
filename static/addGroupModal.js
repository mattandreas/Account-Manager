Vue.component('add_group_modal', {
    data: function () {
        return {
            form_submitted: false,
            name: ""
        }
    },
    computed: {
        nameValidation() {
            if (!this.form_submitted) return null
            return this.name.length > 0
        },
    },
    methods: {
        resetModal() {
            this.form_submitted = false
            this.name = ''
        },
        handleOk(bvModalEvt) {
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            // Trigger submit handler
            this.handleSubmit()
        },
        handleSubmit() {
            this.form_submitted = true
            // Exit when the form isn't valid
            if (!this.$refs.form.checkValidity()) {
                return
            }
            // post the vps data
            let data = {
                name: this.name
            }
            axios.post('new_group', data).then((res) => {
                console.log(res.data)
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide('add-group')
                })
                // reload page to refresh view with new data
                // window.history.go()
                this.$root.loadData()
            })
        },
    },
    template: `<!---->
<b-modal id="add-group"
         ref="modal"
         title="Add New Group"
         @show="resetModal"
         @hidden="resetModal"
         @ok="handleOk">
    <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group :state="nameValidation"
                      label="Group Name"
                      label-for="input"
                      invalid-feedback="Group name is required">
            <b-form-input id="input"
                          v-model="name"
                          :state="nameValidation"
                          required></b-form-input>
        </b-form-group>
    </form>
</b-modal>
`
})