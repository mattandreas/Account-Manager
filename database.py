import pymongo
from enum import Enum


class Settings(Enum):

    def __init__(self, setting_name, default, options=None):
        self.setting_name = setting_name
        self.default = default
        self.options = options

    @staticmethod
    def setting_for_name(name):
        for setting in Settings:
            if setting.setting_name != name:
                continue
            return setting
        return None

    Launcher = ('launcher', {
        'assign_amount': 3,
        'run_interval': 15,
        'proxy_username': '',
        'proxy_password': '',
        'bond_accounts': False
    })
    MMF = ('MMF', {
        'hours_until_short_mule': 8,
        'short_mule_time_min': 20,
        'short_mule_time_max': 30,
        'long_mule_time': 2,
        'long_mule_deviation': 15
    })
    Mud = ('Mud', {
        'hours_until_short_mule': 8,
        'short_mule_time_min': 20,
        'short_mule_time_max': 30,
        'long_mule_time': 2,
        'long_mule_deviation': 15
    })
    Tan = ('Tan', {
        'green': 10,
        'blue': 10,
        'red': 5,
        'black': 5,
        'force_mule_hours': 16,
        'force_mule_minutes': 0
    })
    Rings = ('Rings', {
        'force_mule_hours': 16,
        'force_mule_minutes': 0
    })
    Pizza = ('Pizza', {
        'force_mule_hours': 16,
        'force_mule_minutes': 0
    })
    Spin = ('Spin', {
        'hours_until_short_mule': 16
    })
    RedEggs = ('RedEggs', {
        'hours_until_short_mule': 8,
        'short_mule_time_min': 20,
        'short_mule_time_max': 30,
        'long_mule_time': 2,
        'long_mule_deviation': 15
    })
    Wine = ('Wine', {
        'hours_until_short_mule': 8,
        'minutes_until_short_mule': 0,
        'short_mule_time_min': 20,
        'short_mule_time_max': 30,
        'long_mule_time': 2,
        'long_mule_deviation': 15
    })
    Plank = ('Plank', {
        'oak': 1,
        'oak_smartbuy_increase': 1,
        'oak_buy_amount': 3000,
        'teak': 1,
        'teak_smartbuy_increase': 1,
        'teak_buy_amount': 3000,
        'mahogany': 1,
        'mahogany_smartbuy_increase': 1,
        'mahogany_buy_amount': 3000,
        'force_mule_hours': 16,
        'force_mule_minutes': 0
    })
    Grass = ('Grass', {})
    Lava = ('Lava', {})
    Mule = ('Mule', {},  # Empty defaults, should not be able to run without a config anyway
            {
                # Available options and their display name
                'FUNGUS': 'Mort myre fungus',
                'GREEN': 'Green dragon leather',
                'BLUE': 'Blue dragon leather',
                'RED': 'Red dragon leather',
                'BLACK': 'Black dragon leather',
                'BOWSTRING': 'Bow string',
                'MUD_RUNE': 'Mud rune',
                'RED_EGG': 'Red spiders\' eggs',
                'RINGS': 'Ring of recoil',
                'PIZZA': 'Pineapple pizza',
                'WINE': 'Wine of zamorak',
                'OAK_PLANK': 'Oak plank',
                'TEAK_PLANK': 'Teak plank',
                'MAHOGANY_PLANK': 'Mahogany plank',
                'SNAPE_GRASS': 'Snape grass',
                'LAVA_DRAGON_BONES': 'Lava dragon bones',
                'ONYX_BOLT_TIPS': 'Onyx bolt tips',
                'LAVA_SCALE': 'Lava scale',
                'BLACK_DRAGONHIDE': 'Black dragonhide'
            })
    Switcher = ('Switcher', {})
    WitchsHouseWaterfall = ('WitchsHouseWaterfall', {})
    Script = ('Script', {}, [
        {'value': 'SetNameOnly', 'text': "Set Name Only"},
        {'value': 'MMF', 'text': "MMF"},
        {'value': 'RedEggs', 'text': "Red Eggs"},
        {'value': 'Mud', 'text': "Mud"},
        {'value': 'Tan', 'text': "Tan"},
        {'value': 'Spin', 'text': "Spin"},
        {'value': 'Rings', 'text': "Ring Enchanter"},
        {'value': 'Pizza', 'text': "Pizza"},
        {'value': 'Wine', 'text': 'Wine'},
        {'value': 'Plank', 'text': 'Plank'},
        {'value': 'Switcher', 'text': 'Switcher'},
        {'value': 'WitchsHouseWaterfall', 'text': 'Witchs House & Waterfall'},
        {'value': 'Grass', 'text': 'Snape Grass'},
        {'value': 'Lava', 'text': 'Lava Dragons'}
    ])


class Database:

    def __init__(self, address, schema):
        db_client = pymongo.MongoClient(address)
        self.database = db_client[schema]

    def get_setting(self, setting):
        settings_collection = self.database['settings']
        query = {
            'setting': setting.setting_name
        }
        saved_setting = settings_collection.find_one(query)
        return saved_setting['value'] if saved_setting is not None else setting.default

    def set_setting(self, setting, value):
        settings_collection = self.database['settings']
        query = {
            'setting': setting.setting_name
        }
        document = {
            'setting': setting.setting_name,
            'value': value
        }
        settings_collection.replace_one(query, document, upsert=True)

    def update_account_members(self, username, members):
        account_collection = self.database['account']
        query = {
            'username': username
        }
        new_value = {
            '$set': {
                'members': members
            }
        }
        account_collection.update_one(query, new_value)

    def get_vps_for_ip(self, ip):
        vps_collection = self.database['vps']
        query = {
            'ip': ip
        }
        return vps_collection.find_one(query)

    def get_all_vps(self):
        vps_collection = self.database['vps']
        vps_list = [
            {
                'group': vps['group'],
                'ip': vps['ip'],
                'port': vps['port'],
                'username': vps['username'],
                'password': vps['password']
            }
            for vps in vps_collection.find()]
        return vps_list

    def add_vps_group(self, name):
        group_collection = self.database['vps_groups']
        group = {
            'name': name
        }
        group_collection.insert(group)

    def assign_vps_to_group(self, vps_ip, group):
        vps_collection = self.database['vps']
        query = {
            'ip': vps_ip
        }
        new_value = {
            '$set': {
                'group': group
            }
        }
        vps_collection.update_one(query, new_value)

    def delete_groups(self, groups, delete_accounts=False, delete_vps=False, delete_groups=False):
        # get all vps in groups
        vps_collection = self.database['vps']
        vps_query = {
            'group': {
                '$in': groups
            }
        }
        if delete_accounts:
            vps_list = vps_collection.find(vps_query)
            ip_list = list(map(lambda vps: vps['ip'], vps_list))
            # delete all accounts assigned to vps
            account_collection = self.database['account']
            account_query = {
                'vps': {
                    '$in': ip_list
                }
            }
            account_collection.delete_many(account_query)
        if delete_vps:
            if not delete_accounts:
                vps_list = vps_collection.find(vps_query)
                ip_list = list(map(lambda vps: vps['ip'], vps_list))
                # un-assign all associated accounts
                account_collection = self.database['account']
                account_query = {
                    'vps': {
                        '$in': ip_list
                    }
                }
                new_value = {
                    '$set': {
                        'vps': None
                    }
                }
                account_collection.update_many(account_query, new_value)
            # delete all vps in group
            vps_collection.delete_many(vps_query)
        if delete_groups:
            # delete groups
            group_collection = self.database['vps_groups']
            group_query = {
                'name': {
                    '$in': groups
                }
            }
            group_collection.delete_many(group_query)

    def get_vps_for_groups(self, groups):
        vps_collection = self.database['vps']
        vps_query = {
            'group': {
                '$in': groups
            }
        }
        return vps_collection.find(vps_query)

    def get_all_groups(self):
        group_collection = self.database['vps_groups']
        group_list = [group['name'] for group in group_collection.find()]
        return group_list

    def get_all_accounts(self):
        account_collection = self.database['account']
        account_list = [
            {
                'username': account['username'],
                'password': account['password'],
                'proxy_ip': account['proxy_ip'],
                'proxy_port': account['proxy_port'],
                'proxy_username': account['proxy_username'] if 'proxy_username' in account else None,
                'proxy_password': account['proxy_password'] if 'proxy_password' in account else None,
                'members': account['members'],
                'vps': account['vps']
            }
            for account in account_collection.find()]
        return account_list

    def delete_accounts(self, account_list):
        account_collection = self.database['account']
        query = {
            'username': {
                '$in': account_list
            }
        }
        account_collection.delete_many(query)

    def get_mule_settings_for_config(self, config):
        all_configs = self.get_setting(Settings.Mule)
        return all_configs[config] if config in all_configs else {}
