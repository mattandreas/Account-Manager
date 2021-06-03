Vue.component('settings_modal', {
    methods: {
        resetSettingsModal() {
            console.log("Resetting settings modal")
            axios.get('settings').then((res) => {
                this.$refs.launcher_settings.resetSettings(res.data['launcher'])
                this.$refs.tan_settings.resetSettings(res.data['Tan'])
                this.$refs.mmf_settings.resetSettings(res.data['MMF'])
                this.$refs.mud_settings.resetSettings(res.data['Mud'])
                this.$refs.red_eggs_settings.resetSettings(res.data['RedEggs'])
                this.$refs.spin_settings.resetSettings(res.data['Spin'])
                this.$refs.mule_settings.resetSettings(res.data['Mule'])
                this.$refs.rings_settings.resetSettings(res.data['Rings'])
                this.$refs.pizza_settings.resetSettings(res.data['Pizza'])
                this.$refs.wine_settings.resetSettings(res.data['Wine'])
                this.$refs.plank_settings.resetSettings(res.data['Plank'])
            }).catch((error) => console.log(error))
        },
        handleSettingsOk(bvModalEvt) {
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            // Trigger submit handler
            this.handleSettingsSubmit()
        },
        handleSettingsSubmit() {
            console.log("Settings submit")
            let data = {
                launcher: this.$refs.launcher_settings.getSettings(),
                Tan: this.$refs.tan_settings.getSettings(),
                MMF: this.$refs.mmf_settings.getSettings(),
                Mud: this.$refs.mud_settings.getSettings(),
                Spin: this.$refs.spin_settings.getSettings(),
                RedEggs: this.$refs.red_eggs_settings.getSettings(),
                Mule: this.$refs.mule_settings.getSettings(),
                Rings: this.$refs.rings_settings.getSettings(),
                Pizza: this.$refs.pizza_settings.getSettings(),
                Wine: this.$refs.wine_settings.getSettings(),
                Plank: this.$refs.plank_settings.getSettings()
            }
            axios.post('settings', {values: data}).then((res) => {
                console.log(res.data)
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide('settings')
                })
                this.$root.loadData()
            }).catch((error) => console.log(error))
        },
    },
    template: `<!---->
<b-modal id="settings"
         ref="modal"
         title="Settings"
         @show="resetSettingsModal"
         @ok="handleSettingsOk">
    <form ref="form" @submit.stop.prevent="handleSettingsSubmit">
        <b-tabs content-class="mt-3">
            <launcher_settings_tab ref="launcher_settings"></launcher_settings_tab>
            <b-tab title="Script" class="text-center">
                <b-tabs content-class="mt-3">
                    <mmf_settings_tab ref="mmf_settings"></mmf_settings_tab>
                    <red_egg_settings_tab ref="red_eggs_settings"></red_egg_settings_tab>
                    <mud_settings_tab ref="mud_settings"></mud_settings_tab>
                    <tan_settings_tab ref="tan_settings"></tan_settings_tab>
                    <rings_settings_tab ref="rings_settings"></rings_settings_tab>
                    <spin_settings_tab ref="spin_settings"></spin_settings_tab>
                    <mule_settings_tab ref="mule_settings"></mule_settings_tab>
                    <pizza_settings_tab ref="pizza_settings"></pizza_settings_tab>
                    <wine_settings_tab ref="wine_settings"></wine_settings_tab>
                    <plank_settings_tab ref="plank_settings"></plank_settings_tab>
                </b-tabs>
            </b-tab>
        </b-tabs>
    </form>
</b-modal>`
})