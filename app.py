from gevent import monkey; monkey.patch_all()  # needed for pymongo
from flask import Flask, request, render_template, jsonify
from flask_socketio import SocketIO, send
import pymongo
from launcher import Launcher
from collections import deque
from account_state import AccountState
from database import Settings, Database
import gc

'''
[CRITICAL] WORKER TIMEOUT
gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker --workers 1 --bind 0.0.0.0:7000 app:app --error-logfile gunicorn.error.log --access-logfile gunicorn.log --capture-output --daemon
--timeout 90 ?
'''

# https://stackoverflow.com/questions/15204341/mongodb-logging-all-queries

app = Flask(__name__)

socket_io = SocketIO(app)

db_address = "mongodb://localhost:27017/"

db_client = pymongo.MongoClient(db_address)

# db_name = 'mmf_farm_prod'

# db_name = 'mmf_farm'

db_name = 'mmf_farm_new'


def emit_update(data):
    socket_io.emit('update', data)


account_state = AccountState(emit_update)

db_new = Database(db_address, db_name)

launcher = Launcher(account_state, db_new)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/get_data', methods=['GET'])
def get_data():
    vps_list = {}
    for vps in db_new.get_all_vps():
        vps['accounts'] = []
        vps_list[vps['ip']] = vps
    account_list = []
    for account in db_new.get_all_accounts():
        assigned_vps = account['vps']
        assigned_list = account_list if assigned_vps is None else vps_list[assigned_vps]['accounts']
        assigned_list.append(account)
    group_list = db_new.get_all_groups()
    mule_info = {
        'options': Settings.Mule.options,
        'configs': db_new.get_setting(Settings.Mule)
    }
    script_options = Settings.Script.options
    data = {
        'vps_list': list(vps_list.values()),
        'account_list': account_list,
        'group_list': group_list,
        'mule_info': mule_info,
        'script_options': script_options
    }
    return jsonify(data)


@app.route('/new_group', methods=['POST'])
def new_group():
    name = request.json['name']
    print("Got post for new group:{}".format(name))

    db_new.add_vps_group(name)

    return jsonify("success")


@app.route('/new_vps', methods=['POST'])
def new_vps():
    group = request.json['group']
    ip = request.json['ip']
    port = request.json['port']
    username = request.json['username']
    password = request.json['password']
    print("Got post for {}:{}, {}, {}, group: {}".format(ip, port, username, password, group))

    db = db_client[db_name]
    vps_collection = db['vps']
    data = {
        'group': group,
        'ip': ip,
        'port': int(port),
        'username': username,
        'password': password
    }
    vps_collection.insert_one(data)
    return jsonify("success")


@app.route('/assign_vps', methods=['POST'])
def assign_vps():
    vps_ip = request.json['vps_ip']
    group = request.json['group']
    print('got request to reassign {} to {}'.format(vps_ip, group))

    db_new.assign_vps_to_group(vps_ip, group)
    return jsonify("success")


@app.route('/new_account', methods=['POST'])
def new_account():
    username = request.json['username']
    password = request.json['password']
    proxy_ip = request.json['proxy_ip']
    proxy_port = request.json['proxy_port']
    print("Got post for {}, {}, {}, {}".format(username, password,
                                               proxy_ip, proxy_port))
    print(request.json)

    db = db_client[db_name]
    account_collection = db['account']
    data = {
        'username': username,
        'password': password,
        'proxy_ip': proxy_ip,
        'proxy_port': proxy_port,
        'members': False,
        'vps': None
    }
    account_collection.insert_one(data)
    return jsonify("success")


@app.route('/delete_vps', methods=['POST'])
def delete_vps():
    ip = request.json['ip']
    print('received request to delete {}'.format(ip))

    db = db_client[db_name]
    # Delete the vps
    vps_collection = db['vps']
    query = {
        'ip': ip
    }
    vps_collection.delete_one(query)

    # Un-assign all accounts associated with vps
    account_collection = db['account']
    query = {
        'vps': ip
    }
    new_value = {
        '$set': {
            'vps': None
        }
    }
    account_collection.update_many(query, new_value)
    return jsonify("success")


@app.route('/delete_account', methods=['POST'])
def delete_account():
    username = request.json['username']
    print('received request to delete {}'.format(username))

    db = db_client[db_name]
    account_collection = db['account']
    query = {
        'username': username
    }
    account_collection.delete_one(query)
    return jsonify("success")


@app.route('/assign_to_vps', methods=['POST'])
def assign_to_vps():
    account = request.json['account']
    vps = request.json['vps']
    print('received request to assign {} to {}'.format(account, vps))

    db = db_client[db_name]
    account_collection = db['account']
    query = {
        'username': account
    }
    new_value = {
        '$set': {
            'vps': vps
        }
    }
    account_collection.update_one(query, new_value)

    return jsonify("success")


@app.route('/group_action', methods=['POST'])
def group_action():
    action = request.json['action']
    groups = request.json['group_list']

    print('received group action request ({}) for {}'.format(action, groups))

    if action == 'delete':
        items = request.json['delete_items']
        db_new.delete_groups(groups,
                             delete_accounts='accounts' in items,
                             delete_vps='VPS' in items,
                             delete_groups='group' in items)

    elif action == 'kill':
        vps_list = db_new.get_vps_for_groups(groups)
        launcher.kill_all(vps_list)

    elif action == 'start':
        script_name = request.json['script']
        print('start action for script {}'.format(script_name))

        vps_list = {}
        for vps in db_new.get_vps_for_groups(groups):
            vps['accounts'] = []
            vps_list[vps['ip']] = vps

        for account in db_new.get_all_accounts():
            if account['vps'] is not None and account['vps'] in vps_list:
                vps = vps_list[account['vps']]
                vps['accounts'].append(account)

        script_settings = Settings.setting_for_name(script_name)

        script_args = db_new.get_setting(script_settings) if script_settings is not None else {}

        script = {
            'name': script_name,
            'settings': script_args
        }

        launcher_settings = db_new.get_setting(Settings.Launcher)
        launcher.run_all(vps_list.values(), script, launcher_settings)

    elif action == 'remove_account_ages':
        print(f'requesting to remove account age from vps group {groups}')

        vps_list = db_new.get_vps_for_groups(groups)

        launcher.remove_account_ages(vps_list)

    else:
        print("Unknown action request")

    return jsonify("success")


@app.route('/start_group', methods=['POST'])
def start_group():
    vps_ip_list = request.json['vps_list']
    script_name = request.json['script']
    print('starting all accounts on vps {} with script {}'.format(vps_ip_list, script_name))

    db = db_client[db_name]
    vps_list = {}
    vps_collection = db['vps']
    for vps in vps_collection.find():
        if vps['ip'] not in vps_ip_list:
            continue
        vps['accounts'] = []
        vps_list[vps['ip']] = vps

    account_collection = db['account']
    for account in account_collection.find():
        if account['vps'] is not None and account['vps'] in vps_list:
            vps = vps_list[account['vps']]
            vps['accounts'].append(account)

    script_settings = Settings.setting_for_name(script_name)

    script = {
        'name': script_name,
        'settings': db_new.get_setting(script_settings) if script_settings is not None else {}
    }

    launcher_settings = db_new.get_setting(Settings.Launcher)

    launcher.run_all(vps_list.values(), script, launcher_settings)

    return jsonify("success")


@app.route('/delete_group', methods=['POST'])
def delete_group():
    vps_ip_list = request.json['vps_list']
    print('deleting all accounts on vps'.format(vps_ip_list))

    db = db_client[db_name]
    vps_list = {}
    vps_collection = db['vps']
    for vps in vps_collection.find():
        if vps['ip'] not in vps_ip_list:
            continue
        vps['accounts'] = []
        vps_list[vps['ip']] = vps

    account_collection = db['account']
    for account in account_collection.find():
        if account['vps'] is not None and account['vps'] in vps_list:
            vps = vps_list[account['vps']]
            vps['accounts'].append(account)

    account_list = [account['username'] for vps in vps_list.values() for account in vps['accounts']]

    db_new.delete_accounts(account_list)

    return jsonify("success")


@app.route('/kill_group', methods=['POST'])
def kill_group():
    vps_ip_list = request.json['vps_list']
    print('killing all accounts on vps'.format(vps_ip_list))

    vps_list = map(db_new.get_vps_for_ip, vps_ip_list)

    launcher.kill_all(vps_list)

    return jsonify("success")


@app.route('/start_one', methods=['POST'])
def start_one():
    username = request.json['username']
    script_name = request.json['script']
    print('received request to start {}'.format(username))

    db = db_client[db_name]
    account_collection = db['account']
    query = {
        'username': username
    }
    account = account_collection.find_one(query)

    vps_collection = db['vps']
    query = {
        'ip': account['vps']
    }
    vps = vps_collection.find_one(query)

    if Settings.Mule.setting_name in script_name:
        split = script_name.split(':')

        script_name = split[0]

        script_args = db_new.get_mule_settings_for_config(split[1])
    else:
        script_settings = Settings.setting_for_name(script_name)

        script_args = db_new.get_setting(script_settings) if script_settings is not None else {}

    script = {
        'name': script_name,
        'settings': script_args
    }

    launcher_settings = db_new.get_setting(Settings.Launcher)

    print('starting {} on {}'.format(account, vps))

    launcher.run(vps, account, script, launcher_settings)

    return jsonify("success")


@app.route('/import_accounts', methods=['POST'])
def clipboard_import():
    text = request.json['import_text'].replace('\r', '')
    print('received clipboard text: {}'.format(text))
    # proxy_ip:proxy_port:proxy_user:proxy_pass user:pass user:pass ...
    accounts = []
    for line in text.split('\n'):
        if len(line) == 0:
            continue
        args = line.split('\t')
        if len(args) < 2:
            return jsonify('Invalid format: must have more than one string per line')
        proxy = args.pop(0).split(':')
        if len(proxy) not in [2, 4]:
            return jsonify('Invalid format: proxy must be ip:port or ip:port:user:pass')
        for arg in args:
            if ':' in arg:
                username = arg.split(':')[0].strip()
                password = arg.split(':')[1].strip()
            else:
                username = arg.strip()
                password = 'burncoin'

            data = {
                'username': username,
                'password': password,
                'proxy_ip': proxy[0],
                'proxy_port': proxy[1],
                'members': False,
                'vps': None
            }
            if len(proxy) == 4:
                data['proxy_username'] = proxy[2]
                data['proxy_password'] = proxy[3]

            accounts.append(data)

        # accounts = accounts + [{
        #     'username': username.strip(),
        #     'password': 'burncoin',
        #     'proxy_ip': proxy[0],
        #     'proxy_port': proxy[1],
        #     'members': False,
        #     'vps': None
        # } for username in args]

    db = db_client[db_name]
    account_collection = db['account']
    account_collection.insert_many(accounts)

    return jsonify("success")


@app.route('/auto_assign', methods=['POST'])
def auto_assign():
    group = request.json['group']
    print('request to auto assign un-assigned accounts to {}'.format(group))

    db = db_client[db_name]
    vps_list = {}
    vps_collection = db['vps']
    for vps in vps_collection.find():
        if vps['group'] != group:
            continue
        vps['accounts'] = 0
        vps_list[vps['ip']] = vps

    account_collection = db['account']
    unassigned_account_list = deque([])
    for account in account_collection.find():
        ip = account['vps']
        if ip is not None:
            if ip in vps_list:
                vps_list[ip]['accounts'] += 1
        else:
            unassigned_account_list.append(account)

    assign_amount = db_new.get_setting(Settings.Launcher)['assign_amount']

    for vps in vps_list.values():
        while vps['accounts'] < assign_amount:
            if len(unassigned_account_list) == 0:
                break
            account = unassigned_account_list.popleft()
            query = {
                'username': account['username']
            }
            new_value = {
                '$set': {
                    'vps': vps['ip']
                }
            }
            account_collection.update_one(query, new_value)
            vps['accounts'] += 1

    return jsonify("success")


@app.route('/settings', methods=['GET', 'POST'])
def settings():
    if request.method == 'GET':
        values = {setting.setting_name: db_new.get_setting(setting)
                  for setting in Settings}
        return jsonify(values)
    else:
        values = request.json['values']
        for name, value in values.items():
            print(f'updating {name} with {value}')
            setting = Settings.setting_for_name(name)
            if setting is not None:
                db_new.set_setting(setting, value)
            else:
                print('setting non-existent')
        return jsonify("success")


@app.route('/delete_all', methods=['POST'])
def delete_all():
    db = db_client[db_name]
    account_collection = db['account']
    query = {
        'vps': None
    }
    account_collection.delete_many(query)

    return jsonify("success")


@app.route('/kill_one', methods=['POST'])
def kill_one():
    username = request.json['username']

    print('received request to kill {}'.format(username))

    db = db_client[db_name]
    account_collection = db['account']
    query = {
        'username': username
    }
    account = account_collection.find_one(query)

    vps_collection = db['vps']
    query = {
        'ip': account['vps']
    }
    vps = vps_collection.find_one(query)

    print('killing {} on {}'.format(account, vps))

    launcher.kill_one(vps, account)

    return jsonify("success")


@app.route('/kill_all', methods=['POST'])
def kill_all():
    print('received request to send message')

    db = db_client[db_name]
    vps_collection = db['vps']

    launcher.kill_all(vps_collection.find())

    return jsonify("success")


@app.route('/update_files', methods=['POST'])
def update_files():
    print('received request to update files')

    groups = request.form.getlist('group')

    osbot_file = request.files['osbot_file'] if 'osbot_file' in request.files else None
    script_file = request.files['script_file'] if 'script_file' in request.files else None

    if osbot_file is not None:
        osbot_file.save('osbot.jar')
    if script_file is not None:
        script_file.save('script.jar')

    launcher.update_files(groups, osbot_file=osbot_file, script_file=script_file)

    return jsonify("success")


@app.route('/available_vps', methods=['GET'])
def available_vps():
    print('requesting available vps')
    vps_list = [vps['ip'] for vps in db_new.get_all_vps()]

    return jsonify(vps_list)


@app.route('/status', methods=['GET'])
def status():
    print('requesting account statuses')
    status_map = account_state.get_statuses()
    return jsonify(status_map)


@app.route('/analyze', methods=['GET'])
def analyze():
    print('calling gc')
    gc.collect()
    return jsonify("success")


@app.route('/reboot', methods=['GET'])
def reboot():
    print('calling reboot')
    launcher.reboot_all()
    return jsonify("success")


@app.route('/vncserver', methods=['GET'])
def vncserver():
    print('calling vncserver')
    launcher.vnc_all()
    return jsonify("success")


@socket_io.on('connect')
def connect():
    print("Socket connected")
    send(account_state.get_state())


if __name__ == '__main__':
    socket_io.run(app, debug=True, log_output=True)
    # app.run(debug=True)
    # app.run()
