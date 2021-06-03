import os
import time
from logging import handlers, getLogger, DEBUG
from random import seed, randint

from gevent import spawn, sleep, joinall
from pssh.clients.native.single import SSHClient

import constants
from database import Settings

import traceback


def clear_old():
    while True:
        # print("Cleaning")
        try:
            now = time.time()
            for filename in os.listdir('logs'):
                if os.path.getmtime(os.path.join('logs', filename)) < now - 12 * 60 * 60:
                    if os.path.isfile(os.path.join('logs', filename)):
                        try:
                            os.remove(os.path.join('logs', filename))
                        except OSError:
                            # print('file is in use, skipping')
                            pass
        except Exception as e:
            print(e)
            traceback.print_exc()
        sleep(15 * 60)
        # sleep(1)


class Launcher:

    def __init__(self, account_state, database):
        self.account_state = account_state
        self.database = database
        self.restarting = set()
        seed(1)
        spawn(clear_old)

    def check_should_restart(self, output_line):
        if constants.should_restart_members == output_line:
            return True, True
        elif constants.should_restart_free == output_line:
            return True, False
        elif constants.should_restart_any == output_line or \
                output_line in constants.should_restart_messages or \
                output_line.startswith('Bot exited with code') and not output_line.endswith('143') or \
                output_line.startswith('[ERROR]') and output_line.endswith('Failed to load hooks!'):
            return True, None
        return False, None

    def read_output(self, output, logger, vps, account, script, launcher_settings):
        restart_flag = False
        bot_froze_flag = None
        for line in iter(output):
            try:
                if line.startswith('[STATUS UPDATE]'):
                    self.account_state.set_status(account['username'], line[17:])
                    continue
                # print(line)
                # print(line, file=file, flush=True)
                logger.debug(line)
                if restart_flag:
                    continue
                should_restart, should_change_mem = self.check_should_restart(line)
                if should_restart:
                    print('Received output signaling to restart {}: {}'.format(account['username'], line))
                    restart_flag = True
                    if should_change_mem is not None:
                        self.database.update_account_members(account['username'], should_change_mem)
                        account['members'] = should_change_mem
                    self.restart(vps, account, script, launcher_settings)
                elif line.startswith('[INFO][') and line.endswith(': Started bot #1'):
                    print('Got bot starting output for {}, starting timer'.format(account['username']))

                    def func():
                        sleep(120)
                        if bot_froze_flag:
                            print('Detected bot froze on initialization for {}, restarting: {}'
                                  .format(account['username'], output))
                            self.restart(vps, account, script, launcher_settings)
                            nonlocal restart_flag
                            restart_flag = True

                    bot_froze_flag = True
                    spawn(func)
                elif bot_froze_flag is not None and bot_froze_flag:
                    print('Detected output after bot initialization output for {}'.format(account['username']))
                    bot_froze_flag = False
            except Exception as e:
                print("Error reading output for {}".format(account['username']))
                print(e)
                traceback.print_exc()
        print('ending output read for {}'.format(account['username']))

    def run(self, vps, account, script, launcher_settings):
        def func():
            try:
                client = SSHClient(vps['ip'].strip(), user=vps['username'], password=vps['password'], port=vps['port'])
            except Exception as e:
                print(e)
                traceback.print_exc()
                return
            print("Connected")
            try:
                worlds = constants.member_worlds if account['members'] else constants.free_worlds
                settings = ['+{}~{}'.format(setting, value) for setting, value in script['settings'].items()]
                settings.append('+bond_accounts~{}'.format(launcher_settings['bond_accounts']))
                proxy_login = account if 'proxy_username' in account and account['proxy_username'] is not None \
                    else launcher_settings
                command = 'DISPLAY=:1 java -jar osbot.jar -allow norandoms,norender -login -autologin ' \
                          '-bot u:p:0000 ' \
                          '-proxy {}:{}:{}:{} ' \
                          '-script MMF_Farm:username~{}+password~{}+type~{}{} ' \
                          '-debug 0 -world {}'.format(account['proxy_ip'], account['proxy_port'],
                                                      proxy_login['proxy_username'],
                                                      proxy_login['proxy_password'],
                                                      account['username'], account['password'],
                                                      script['name'], ''.join(settings),
                                                      worlds[randint(0, len(worlds) - 1)])
                print(command)
                self.account_state.set_account_start(account['username'])
                output = client.run_command(command)
                # log_file = open('logs/{}.txt'.format(account['username']), 'a')
                logger = getLogger(account['username'])
                logger.setLevel(DEBUG)
                handler = handlers.RotatingFileHandler('logs/{}.log'.format(account['username']),
                                                       maxBytes=(10 ** 6) / 2, backupCount=2)
                logger.addHandler(handler)
                readers = [spawn(self.read_output, out, logger, vps, account, script, launcher_settings)
                           for out in (output.stdout, output.stderr)]
                client.wait_finished(output.channel)
                self.account_state.set_account_end(account['username'])
                client.disconnect()
                joinall(readers)
                logger.removeHandler(handler)
                handler.close()
            except Exception as e:
                print('Exception starting account {} on {}'.format(account['username'], vps['ip']))
                print(e)
                traceback.print_exc()
            print('end main')

        print('Starting {} on {}'.format(account['username'], vps['ip']))
        return spawn(func)

    def run_all(self, vps_list_with_accounts, script, launcher_settings):
        sleep_time = self.database.get_setting(Settings.Launcher)['run_interval']
        for element in vps_list_with_accounts:
            def func(vps):
                for account in vps['accounts']:
                    print('starting account: {}'.format(account))
                    self.run(vps, account, script, launcher_settings)
                    print(f'sleeping for {sleep_time}')
                    sleep(sleep_time)

            spawn(func, element)

    def kill_all(self, vps_list):
        for element in vps_list:
            def func(vps):
                print("about to kill all on {}".format(vps['ip']))
                try:
                    client = SSHClient(vps['ip'].strip(), user=vps['username'],
                                       password=vps['password'], port=vps['port'])
                except Exception as e:
                    print(e)
                    traceback.print_exc()
                    return
                print("Connected")
                command = 'pkill -f "[j]ava.*osbot"'
                print(command)
                output = client.run_command(command)
                client.wait_finished(output.channel)
                client.disconnect()
                print('end kill')

            spawn(func, element)

    def kill_one(self, vps, account, run_async=True):
        def func():
            print('about to kill {} on {}'.format(account['username'], vps['ip']))
            self.restarting.discard(account['username'])
            try:
                client = SSHClient(vps['ip'].strip(), user=vps['username'],
                                   password=vps['password'], port=vps['port'])
            except Exception as e:
                print(e)
                traceback.print_exc()
                return
            print('connected')
            command = 'pkill -f "[j]ava.*username~{}\\+password~{}"' \
                .format(account['username'], account['password'])
            output = client.run_command(command)
            client.wait_finished(output.channel)
            client.disconnect()
            print('end kill')

        if run_async:
            spawn(func)
        else:
            func()

    def restart(self, vps, account, script, launcher_settings):
        sleep_time = self.database.get_setting(Settings.Launcher)['run_interval']

        def func():
            self.kill_one(vps, account, run_async=False)
            self.restarting.add(account['username'])
            print(f'sleeping for {sleep_time}')
            sleep(sleep_time)
            if account['username'] not in self.restarting:
                return
            self.restarting.discard(account['username'])
            self.run(vps, account, script, launcher_settings)

        spawn(func)

    def update_files(self, groups, osbot_file=None, script_file=None):
        # for element in self.database.get_all_vps():
        def func(vps):
            print("about to update files on {}".format(vps['ip']))
            try:
                client = SSHClient(vps['ip'].strip(), user=vps['username'],
                                   password=vps['password'], port=vps['port'])
            except Exception as e:
                print(e)
                traceback.print_exc()
                return

            print('connected')

            if osbot_file is not None:
                try:
                    channel = client.open_session()
                    client.execute('rm -f osbot.jar', channel=channel)
                    client.wait_finished(channel)
                    print('sending osbot file')
                    client.scp_send('osbot.jar', 'osbot.jar')
                    sleep(5)
                except Exception as e:
                    print(e)
                    traceback.print_exc()

            if script_file is not None:
                try:
                    channel = client.open_session()
                    client.execute('rm -f OSBot/Scripts/script.jar', channel=channel)
                    client.wait_finished(channel)
                    print('sending script file')
                    client.scp_send('script.jar', 'OSBot/Scripts/script.jar')
                    sleep(5)
                except Exception as e:
                    print(e)
                    traceback.print_exc()

            print('Files sent')

            client.disconnect()

        joinall([spawn(func, vps) for vps in self.database.get_vps_for_groups(groups)])

    def reboot_all(self):
        def reboot(vps):
            print("about to reboot {}".format(vps['ip']))
            try:
                client = SSHClient(vps['ip'].strip(), user=vps['username'],
                                   password=vps['password'], port=vps['port'])
            except Exception as e:
                print(e)
                traceback.print_exc()
                return

            print('connected')
            try:
                channel = client.open_session()
                client.execute('sudo reboot', channel=channel)
                client.wait_finished(channel)
            except Exception as e:
                print(e)
                traceback.print_exc()
            print('finished')
            client.disconnect()
        vps_list = self.database.get_all_vps()
        for element in vps_list:
            spawn(reboot, element)

    def vnc_all(self):
        def vnc(vps):
            print("about to vnc {}".format(vps['ip']))
            try:
                client = SSHClient(vps['ip'].strip(), user=vps['username'],
                                   password=vps['password'], port=vps['port'])
            except Exception as e:
                print(e)
                traceback.print_exc()
                return

            print('connected')
            try:
                channel = client.open_session()
                client.execute('vncserver', channel=channel)
                client.wait_finished(channel)
            except Exception as e:
                print(e)
                traceback.print_exc()
            print('finished')
            client.disconnect()

        vps_list = self.database.get_all_vps()
        for element in vps_list:
            spawn(vnc, element)

    def remove_account_ages(self, vps_list):
        def remove_ages_from(vps):
            print(f'removing ages from {vps["ip"]}')

            try:
                client = SSHClient(vps['ip'].strip(), user=vps['username'],
                                   password=vps['password'], port=vps['port'])
            except Exception as e:
                print(e)
                traceback.print_exc()
                return

            print('connected')
            try:
                channel = client.open_session()
                client.execute('rm -rf /home/burntish/OSBot/Data/camaro/mmf_farm', channel=channel)
                client.wait_finished(channel)
            except Exception as e:
                print(e)
                traceback.print_exc()
            print('finished')
            client.disconnect()

        [spawn(remove_ages_from, vps) for vps in vps_list]
