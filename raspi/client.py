import configparser
import re
import shelve
import requests

config = configparser.ConfigParser()
config.read('config.ini')

queue_id = config['DEFAULT']['QUEUE_ID']
base_url = config['DEFAULT']['BASE_URL']

while True:
    magstripe_data = input('Swipe BuzzCard: ')
    magstripe_parts = magstripe_data.split("=")
    gtiD = magstripe_parts[1]

    # Get name of student
    my_students = shelve.open('students')
    if gtiD in my_students:
        my_data = {
            'queue_id': queue_id,
            'name': my_students[gtiD],
        }
        try:
            r = requests.post(base_url + '/nodes', data = my_data)
            print('Created node')
        except:
            print('Failed to create node')
    else:
        print('gtiD not recognized')
