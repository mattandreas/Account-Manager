console.log("testing js")

const socket = io()

socket.on('message', data => {
    console.log('received message')
    console.log(data)
    for (let username of data['running']) {
        console.log(username)
        app.$set(app.colors, username, '#00de04')
        // app.$set(app.statuses, username, 'starting')
    }
    // for (let [account, status] of Object.entries(data['statuses'])) {
    //     app.$set(app.statuses, account, status)
    // }
})

socket.on('update', data => {
    console.log('received update')
    console.log(data)
    if ('running' in data) {
        for (let [account, state] of Object.entries(data['running'])) {
            if (state === 0) {
                app.$delete(app.colors, account)
            } else {
                app.$set(app.colors, account, '#00de04')
            }
        }
    }
    // if ('statuses' in data) {
    //     for (let [account, status] of Object.entries(data['statuses'])) {
    //         app.$set(app.statuses, account, status)
    //     }
    // }
})

const app = new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        name: '',
        group_tabs_initialized: false,
        vpsTabsInitialized: {},
        vpsList: [],
        accountList: [],
        vpsGroups: [],
        colors: {},
        // local storage
        group_tab: 0,
        vps_tabs: {},
        // post data
        import_form_submitted: false,
        import_text: '',
        scriptOptions: [],
        scriptsAndConfigs: [],
        muleInfo: {},
        statuses: {},
        loading: false
    },
    beforeCreate() {
    },
    mounted() {
        this.loadData()
    },
    updated() {
    },
    watch: {
        group_tab(newTab) {
            if (this.group_tabs_initialized)
                localStorage.group_tab = newTab;
        },
        vps_tabs: {
            deep: true,
            handler() {
                for (let tab in this.vps_tabs) {
                    if (this.vpsTabsInitialized[tab]) {
                        localStorage['vps_tab' + tab] = this.vps_tabs[tab]
                    }
                }
            }
        }
    },
    computed: {
        showAlert() {
            console.log("computed")
        },
        importValidation() {
            if (!this.import_form_submitted) return null
            return this.import_text.length > 0
        },
    },
    methods: {
        loadData() {
            axios.get('get_data').then((res) => {
                this.vpsList = res.data['vps_list']
                this.accountList = res.data['account_list']
                this.vpsGroups = res.data['group_list']
                this.muleInfo = res.data['mule_info']
                this.scriptOptions = res.data['script_options']
                this.scriptsAndConfigs = [].concat(this.scriptOptions)
                Object.keys(this.muleInfo.configs).forEach(config => {
                    this.scriptsAndConfigs.push({value: `Mule:${config}`, text: config})
                })
                app.$forceUpdate()
            }).catch((error) => console.log(error))
        },
        getStatuses() {
            this.loading = true
            axios.get('status').then((res) => {
                this.statuses = res.data
            }).catch((error) => console.log(error))
                .finally(() => this.loading = false)
        },
        groupTabsChanged() {
            console.log("Tabs changed")
            if (!this.group_tabs_initialized) {
                this.group_tab = localStorage.group_tab || 0
                this.group_tabs_initialized = true
            }
        },
        vpsTabsChanged(group) {
            console.log("Tabs changed")
            if (!this.vpsTabsInitialized[group]) {
                this.vps_tabs[group] = localStorage['vps_tab' + group] || 0
                this.vpsTabsInitialized[group] = true
            }
        },
        resetImportModal() {
            this.import_form_submitted = false
            this.import_text = ''
        },
        handleImportOk(bvModalEvt) {
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            // Trigger submit handler
            this.handleImportSubmit()
        },
        handleImportSubmit() {
            this.import_form_submitted = true
            // Exit when the form isn't valid
            if (!this.$refs.form.checkValidity()) {
                return
            }
            let parent = this
            this.postData('/import_accounts', {import_text: this.import_text}, () => {
                // Hide the modal manually
                parent.$nextTick(() => {
                    parent.$bvModal.hide('account-import')
                })
                // reload page to refresh view with new data
                // window.history.go()
                this.loadData()
            })
        },
        deleteVpsButtonClick(ip) {
            console.log("Delete button pressed for " + ip)
            let data = {
                ip: ip
            }
            this.postData('/delete_vps', data, () => {
                // reload page to refresh view with new data
                // window.history.go()
                this.loadData()
            })
        },
        deleteAccountButtonClick(username) {
            console.log("Requesting delete account for " + username)
            let data = {
                username: username
            }
            this.postData('/delete_account', data, () => {
                // reload page to refresh view with new data
                // window.history.go()
                this.loadData()
            })
        },
        assignAccountTo(account, vps) {
            console.log('assigning ' + account + ' to ' + vps)
            let data = {
                account: account,
                vps: vps
            }
            this.postData('/assign_to_vps', data, () => {
                // reload page to refresh view with new data
                // window.history.go()
                this.loadData()
            })
        },
        startAll(members, setNameOnly = false) {
            console.log("Request to start all")
            this.postData("start_all", {
                members: members,
                set_name_only: setNameOnly
            })
        },
        clipboardImport() {
            console.log("Clipboard import requested")
            navigator.clipboard.readText().then(text => {
                console.log('Pasted content: ', text);
                this.postData('clipboard_import', {text: text}, () => {
                    // reload page to refresh view with new data
                    // window.history.go()
                    this.loadData()
                })
            }).catch(err => {
                console.error('Failed to read clipboard contents: ', err);
            });
        },
        autoAssign(group) {
            console.log('requesting to auto-assign')
            this.postData('auto_assign', {group: group}, () => {
                // reload page to refresh view with new data
                // window.history.go()
                this.loadData()
            })
        },
        assignVps(vps_ip, group) {
            console.log('requesting to reassign vps')
            let data = {
                vps_ip: vps_ip,
                group: group
            }
            this.postData('assign_vps', data, () => {
                // reload page to refresh view with new data
                // window.history.go()
                this.loadData()
            })
        },
        deleteAll() {
            console.log("Deleting all unassigned accounts")
            this.postData('delete_all', {}, () => this.loadData())
        },
        killAll() {
            console.log("Request to kill all")
            this.postData('kill_all')
        },
        killOne(username) {
            console.log("Request to kill " + username)
            this.postData('kill_one', {username: username})
        },
        startOne(username, script) {
            console.log("Request to start " + username)
            this.postData('start_one', {
                username: username,
                script: script
            })
        },
        getColor: function (username) {
            console.log("Setting color")
            let style = {
                color: this.colors[username] || '#000000'
            }
            return style
        },
        rebootAll: function () {
            axios.get('reboot').then((res) => {
                console.log(res.data)
            }).catch((error) => console.log(error))
        },
        vncserverAll: function () {
            axios.get('vncserver').then((res) => {
                console.log(res.data)
            }).catch((error) => console.log(error))
        },
        analyze: function () {
            axios.get('analyze').then((res) => {
                console.log(res.data)
            }).catch((error) => console.log(error))
        },
        postData(url, data = {}, callback = null) {
            console.log("Posting data: " + JSON.stringify(data))
            axios({
                method: 'post',
                url: url,
                data: data
            }).then((res) => {
                console.log(res.data)
                callback && callback()
            }).catch((error) => console.log(error))
        }
    }
})