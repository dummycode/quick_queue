import configparser
import re
import shelve
import requests

config = configparser.ConfigParser()
config.read('config.ini')

queue_id = config['DEFAULT']['QUEUE_ID']
base_url = config['DEFAULT']['BASE_URL']
api_token = config['DEFAULT']['API_TOKEN']

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
        my_headers = {
            'x-access-token': api_token, 
        }

        try:
            r = requests.post(base_url + '/nodes', data = my_data, headers = my_headers)
            if (r.status_code == 201):
                print('Created node')
            else:
                print('Server rejected our request')
        except:
            print('Failed to connect to server')
    else:
        print('gtiD not recognized')
