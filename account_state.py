from gevent import sleep, spawn


class AccountState:

    def __init__(self, update_func):
        self.running = {}
        self.statuses = {}
        self.running_updates = {}
        self.update_func = update_func
        spawn(self.send_updates)

    def get_state(self):
        state = {
            'running': [username for username in self.running.keys()],
        }
        return state

    def set_account_start(self, username):
        if username in self.running:
            self.running[username] += 1
        else:
            self.running[username] = 1
            self.running_updates[username] = 1
            self.statuses[username] = 'start'

    def set_account_end(self, username):
        self.running[username] -= 1
        if self.running[username] == 0:
            del self.running[username]
            self.running_updates[username] = 0
            del self.statuses[username]

    def set_status(self, username, status):
        self.statuses[username] = status

    def get_statuses(self):
        return self.statuses

    def send_updates(self):
        while True:
            update = {}
            if len(self.running_updates) > 0:
                update['running'] = self.running_updates
                self.running_updates = {}
            if len(update) > 0:
                self.update_func(update)
            sleep(5)
