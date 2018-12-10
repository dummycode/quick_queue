const config = {
    'base_url' : 'http://localhost:3000/api', 
};

var queue_id;
var queue_name;

$(document).ready(function() {
    queue_id = Cookies.get('queue_id');
    queue_name = Cookies.get('queue_name');

    if (queue_id !== undefined && queue_name !== undefined) {
        setUpStats();
        $('#stats-section').show();
    } else {
        getQueues();
        $('#selection-section').show();
    }

    $(document.getElementById('diff-queue')).click(clearSelection);
});

/**
 * Get queues from api
 */
function getQueues() {
    let dropdown = document.getElementById('queue-selector');
    dropdown.length = 0;

    let defaultOption = document.createElement('option');
    defaultOption.text = 'Choose Queue';

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    dropdown.onchange = selectQueue;

    const url = config.base_url + '/queues';
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    
    request.onload = function () {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText);
            data = data.content.data;
            let option;
            for (let i = 0; i < data.length; i++) {
                option = document.createElement('option');
                option.text = data[i].name;
                option.value = data[i].id;
                dropdown.add(option);
            }
        } else {
            alert('request succeeded, but response was no good');
        }
    }
    
    request.onerror = function () {
        alert('server did not respond yo');
    };
    
    request.send();
}

/**
 * Handle selection of queue
 */
function selectQueue() {
    if (this.selectedIndex !== 0) {
        queue_id = this.value;
        queue_name = this.options[this.selectedIndex].text;
        
        setUpStats();
        $('#selection-section').hide();
        $('#stats-section').show();

        Cookies.set('queue_id', queue_id);
        Cookies.set('queue_name', queue_name);
    }
}

/**
 * Clear section of list
 */
function clearSelection() {
    queue_id = null;
    $('#stats-section').hide();
    var queue_selector = document.getElementById('queue-selector');
    queue_selector.selectedIndex = 0;
    getQueues();
    
    $('#selection-section').show();
    Cookies.remove('queue_id', queue_id);
    
}

/**
 * Set up the queue
 */
function setUpStats() {
    $('#queue-name').text(queue_name);
    getCount();
}

/**
 * Populate queue with data from backend
 */
function getCount() {
    const url = config.base_url + '/queues/' + queue_id; // TODO FIX this shit
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    
    request.onload = function () {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText).content.data;
            var nodes = data.nodes;
            $('#current-count').text(nodes.length);
            $('#wait-time').text(nodes.length * 5 + ' min');
        } else {
            alert('request succeeded, but response was no good');
        }
    }
    
    request.onerror = function () {
        alert('server did not respond yo');
    };
    
    request.send();
}

