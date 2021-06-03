Vue.component('group_action_modal', {
    data: function () {
        return {
            form_submitted: false,
            selectedGroups: [],
            groupOptions: [],
            scriptOptions: [],
            selectedScript: null,
            optionsToDelete: [
                { text: 'Accounts', value: 'accounts' },
                { text: 'VPS', value: 'VPS' },
                { text: 'Group', value: 'group' }
            ],
            selectedToDelete: []
        }
    },
    watch: {
        selectedToDelete(newVal, oldVal) {
            // VPS must be selected if group is selected
            if (newVal.includes('group') && !oldVal.includes('group')) {
                if (!this.selectedToDelete.includes('VPS')) {
                    this.selectedToDelete.push('VPS')
                }
            } else if (!newVal.includes('VPS') && oldVal.includes('VPS')) {
                if (this.selectedToDelete.includes('group')) {
                    this.selectedToDelete = this.selectedToDelete.filter(item => item !== 'group')
                }
            }
        }
    },
    computed: {
        groupValidation() {
            if (!this.form_submitted) return null
            return this.selectedGroups.length > 0
        },
        groupScriptValidation() {
            if (!this.form_submitted) return null
            return this.selectedScript != null
        },
        groupDeleteValidation() {
            if (!this.form_submitted) return null
            return this.selectedToDelete.length > 0
        }
    },
    methods: {
        resetGroupModal() {
            this.form_submitted = false
            this.selectedGroups = []
            this.scriptOptions = this.$root.scriptOptions
            this.groupOptions = this.$root.vpsGroups
        },
        handleGroupOk(bvModalEvt) {
            bvModalEvt.preventDefault()
            this.handleGroupSubmit()
        },
        handleGroupSubmit() {
            this.form_submitted = true
            console.log("Submitting group")
            if (!this.$refs.form.checkValidity()) {
                return
            }
            let data = {
                'action': this.action,
                'group_list': this.selectedGroups
            }
            if (this.action === 'start')
                data.script = this.selectedScript
            else if (this.action === 'delete')
                data.delete_items = this.selectedToDelete

            axios.post('group_action', data).then((res) => {
                console.log(res.data)
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide('group_action' + this.action)
                })
                // reload page to refresh view with new data
                // window.history.go()
                if (this.action === 'delete')
                    this.$root.loadData()
            }).catch((error) => console.log(error))
        },
        formatAction() {
            if (this.display != null) return this.display
            return this.action.charAt(0).toUpperCase() + this.action.slice(1);
        }
    },
    props: {
        action: {
            type: String
        },
        display: {
            type: String,
            default: null
        }
    },
    template: `<!---->
<b-modal :id="'group_action' + action"
         ref="modal"
         :title="formatAction() + ' Group'"
         @show="resetGroupModal"
         @ok="handleGroupOk">
    <form ref="form" @submit.stop.prevent="handleGroupSubmit">
        <b-form-group v-if="action == 'delete'" label="Items To Delete"
                      label-for="items"
                      :state="groupDeleteValidation"
                      invalid-feedback="At least one item must be selected">
            <b-form-checkbox-group id="items"
                                   v-model="selectedToDelete"
                                   :options="optionsToDelete"
                                   name="items"></b-form-checkbox-group>
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
        <b-form-group v-if="action == 'start'" label="Script"
                      label-for="script-selection"
                      :state="groupScriptValidation"
                      invalid-feedback="Script must be selected">
            <b-form-select v-model="selectedScript"
                           :state="groupScriptValidation"
                           :options="scriptOptions"
                           required></b-form-select>
        </b-form-group>
    </form>
</b-modal>
`
})