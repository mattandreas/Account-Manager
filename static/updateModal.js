Vue.component('update_files_modal', {
    data: function () {
        return {
            form_submitted: false,
            selectedGroups: [],
            groupOptions: [],
            update_file_disabled: true,
            osbot_file: null,
            script_file: null,
            loading: false
        }
    },
    computed: {
        groupValidation() {
            if (!this.form_submitted) return null
            return this.selectedGroups.length > 0
        }
    },
    methods: {
        resetFileModal() {
            this.form_submitted = false
            this.selectedGroups = []
            this.groupOptions = this.$root.vpsGroups
            this.update_file_disabled = true
            this.osbot_file = null
            this.script_file = null
            this.loading = false
        },
        onUpdateFileChange(file) {
            console.log("Update file changed")
            this.update_file_disabled = this.osbot_file == null && this.script_file == null
        },
        handleUpdateOk(bvModalEvt) {
            bvModalEvt.preventDefault()
            this.handleUpdateSubmit()
        },
        handleUpdateSubmit() {
            this.form_submitted = true
            console.log("Submitting group")
            if (!this.$refs.form.checkValidity()) {
                return
            }
            console.log("Updating files")
            let parent = this
            let formData = new FormData();
            formData.append('osbot_file', this.osbot_file)
            formData.append('script_file', this.script_file)
            this.selectedGroups.forEach(group => {
                formData.append('group', group)
            })
            this.loading = true
            axios.post('update_files', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((res) => {
                console.log(res.data)
                parent.$nextTick(() => {
                    parent.$bvModal.hide('update-files')
                })
            }).catch((error) => console.log(error))
                .finally(() => this.loading = false)
        },
    },
    template: `<!---->
<b-modal id="update-files"
         ref="modal"
         title="Update Files"
         @show="resetFileModal"
         @hidden="resetFileModal"
         @ok="handleUpdateOk"
         :ok-disabled="update_file_disabled"
         :busy="loading"
         :no-close-on-backdrop="loading"
         :no-close-on-esc="loading"
         :hide-header-close="loading">
    <form ref="form" @submit.stop.prevent="handleUpdateSubmit">
        <b-form-group label="OSBot File"
                      label-for="file-input"
                      invalid-feedback="File cannot be empty">
            <b-form-file id="file-input"
                         v-model="osbot_file"
                         placeholder="Choose File or Drag And Drop"
                         @input="onUpdateFileChange"
                         accept=".jar"></b-form-file>
        </b-form-group>
        <b-form-group label="Script File"
                      label-for="file-input2"
                      invalid-feedback="File cannot be empty">
            <b-form-file id="file-input2"
                         v-model="script_file"
                         placeholder="Choose File or Drag And Drop"
                         @input="onUpdateFileChange"
                         accept=".jar"></b-form-file>
        </b-form-group>
        <b-form-group label="Available Groups"
                      label-for="selection"
                      :state="groupValidation"
                      invalid-feedback="At least one group must be selected">
            <b-form-select v-model="selectedGroups"
                           :options="groupOptions"
                           :state="groupValidation"
                           multiple
                           :select-size="10"
                           required></b-form-select>
        </b-form-group>
    </form>
    <b-overlay :show="loading" no-wrap></b-overlay>
</b-modal>`
})