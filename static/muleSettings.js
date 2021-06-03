Vue.component('mule_settings_tab', {
    data: function () {
        return {
            configs: {},
            create_form_submitted: null,
            create_config_name: "",
            selected_config: ""
        }
    },
    computed: {
        invalidConfigName() {
            if (this.create_config_name.length === 0) {
                return "Config name may not be empty"
            } else if (this.create_config_name in this.configs) {
                return "Config name must be unique"
            }
            return "Invalid config name"
        },
        createConfigValidation() {
            if (this.create_form_submitted == null) return null;
            else if (this.create_form_submitted) return true;
            return this.create_config_name.length > 0 && !(this.create_config_name in this.configs)
        }
    },
    methods: {
        resetSettings(data) {
            this.configs = data
            this.resetSelection()
        },
        getSettings() {
            return this.configs
        },
        resetCreateConfigModal() {
            this.create_form_submitted = null;
            this.create_config_name = ""
        },
        handleCreateConfigOk(bvModalEvt) {
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            // Trigger submit handler
            this.handleCreateConfigSubmit()
        },
        handleCreateConfigSubmit() {
            this.create_form_submitted = false
            // Exit when the form isn't valid
            if (!this.$refs.form.checkValidity() || this.create_config_name in this.configs) {
                return
            }
            this.create_form_submitted = true
            // this.configs[this.create_config_name] = {}\
            this.$set(this.configs, this.create_config_name, {})
            let muleOptions = this.optionNames()
            for (const option of Object.keys(muleOptions)) {
                // this.configs[this.create_config_name][option] = false
                this.$set(this.configs[this.create_config_name], option, false)
            }
            this.selected_config = this.create_config_name
            this.$nextTick(() => {
                this.$bvModal.hide('add-config')
            })
            this.$forceUpdate()
        },
        selectConfig(config) {
            this.selected_config = config
            this.$forceUpdate()
        },
        deleteConfig() {
            delete this.configs[this.selected_config]
            this.resetSelection()
            this.$forceUpdate()
        },
        configNames() {
            return Object.keys(this.configs)
        },
        optionNames() {
            return this.$root.muleInfo['options'];
        },
        resetSelection() {
            let keys = Object.keys(this.configs)
            if (keys.length > 0) {
                this.selected_config = keys[0]
            } else {
                this.selected_config = ""
            }
        }
    },
    template: `<!---->
<b-tab title="Mule" class="text-center">
        <b-form-group label="Configs">
    <div v-if="Object.keys(configs).length > 0">
        <b-dropdown :text="selected_config">
            <b-dropdown-item-button v-for="config in configNames()"
                                    v-if="config != selected_config"
                                    @click="selectConfig(config)">
                {{ config }}
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button v-b-modal.add-config>
                Create Config
            </b-dropdown-item-button>
        </b-dropdown>
        <b-dropdown text="-" no-caret>
            <b-dropdown-item @click="deleteConfig">
                Delete Config
            </b-dropdown-item>
        </b-dropdown>
    </div>
    <div v-else>
        <b-button v-b-modal.add-config>
            Create Config
        </b-button>
    </div>
    <b-modal id="add-config"
             ref="modal"
             title="Create Config"
             @show="resetCreateConfigModal"
             @hidden="resetCreateConfigModal"
             @ok="handleCreateConfigOk">
        <form ref="form" @submit.stop.prevent="handleCreateConfigSubmit">
            <b-form-group :state="createConfigValidation"
                          label="Name"
                          label-for="text-input"
                          :invalid-feedback="invalidConfigName">
                <b-form-input id="text-input"
                              v-model="create_config_name"
                              :state="createConfigValidation"
                              required></b-form-input>
            </b-form-group>
        </form>
    </b-modal>
            </b-form-group>
    <div v-if="Object.keys(configs).length > 0">
        <b-form-group label="Options">
            <div v-for="option in Object.keys(optionNames())">
                <b-form-checkbox v-model="configs[selected_config][option]">
                    {{ optionNames()[option] }}
                </b-form-checkbox>
            </div>
        </b-form-group>
    </div>
</b-tab>`
})