const config = {
    'base_url' : 'http://localhost:3000/api', 
};

var queue_id;

$(document).ready(function() {
    queue_id = Cookies.get('queue_id');

    if (queue_id !== undefined) {
        setUpQueue();
        $('#service-section').show();
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
        setUpQueue();
        $('#selection-section').hide();
        $('#service-section').show();

        Cookies.set('queue_id', queue_id);
    }
}

/**
 * Clear section of list
 */
function clearSelection() {
    queue_id = null;
    $('#service-section').hide();
    var queue_selector = document.getElementById('queue-selector');
    queue_selector.selectedIndex = 0;
    getQueues();
    
    $('#selection-section').show();
    Cookies.remove('queue_id', queue_id);
    
}

/**
 * Set up the queue
 */
function setUpQueue() {
    var queue_list = document.getElementById('queue-list');

    populateQueue(queue_list);
}

/**
 * Set the next person to be service
 */
function updateNext() {
    var queue_list = $('#queue-list');
    if (queue_list.children().length === 0) {
        $('#next-node').text('Queue is empty :)');
    } else {
        var next = $('#queue-list > li:first-child');
        $('#next-node').text(next.data().name);
    }
}

/**
 * Populate queue with data from backend
 */
function populateQueue(queue_list) {
    const url = config.base_url + '/queues/' + queue_id; // TODO FIX this shit
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    
    request.onload = function () {
        // Clear old list
        queue_list.innerHTML = '';
        
        if (request.status === 200) {
            var data = JSON.parse(request.responseText).content.data;
            var nodes = data.nodes;
            for (let i = 0; i < nodes.length; i++) {
                addNode(queue_list, nodes[i]);
            }
            updateNext();
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
 * Add a node to the list
 * 
 * @param {object} queue_list 
 * @param {string} name 
 */
function addNode(queue_list, node) {
    // Create list item
    var list_item = document.createElement('li');
    list_item.appendChild(document.createTextNode(node.name));
    queue_list.appendChild(list_item);

    // Set metadata
    list_item.dataset.id = node.id;
    list_item.dataset.name = node.name;

    // Add delete button to list item
    var delete_button = document.createElement('SPAN');
    var text = document.createTextNode('\u00D7');
    delete_button.className = 'close-button';
    delete_button.appendChild(text);
    list_item.appendChild(delete_button);

    delete_button.onclick = deleteNode;

    // Add service button to list item
    var service_button = document.createElement('SPAN');
    var text = document.createTextNode('\u2713');
    service_button.className = 'service-button';
    service_button.appendChild(text);
    list_item.appendChild(service_button);

    service_button.onclick = serviceNode;
}

/**
 * Service a node
 */
function serviceNode() {
    // POST service
    var list_item = this.parentElement;
    var id = list_item.dataset.id;

    // POST service
    const url = config.base_url + '/nodes/' + id + '/service'; // TODO FIX this shit
    const request = new XMLHttpRequest();
    request.open('POST', url, true);
    
    request.onload = function () {
        if (request.status === 202) {
            var content = JSON.parse(request.responseText).content;
            console.log(content, 'node service'); // TODO remove from list
            list_item.parentElement.removeChild(list_item);
            updateNext();
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
 * Delete a node
 */
function deleteNode() {
    var list_item = this.parentElement;
    var id = list_item.dataset.id;

    // POST delete
    const url = config.base_url + '/nodes/' + id; // TODO FIX this shit
    const request = new XMLHttpRequest();
    request.open('DELETE', url, true);
    
    request.onload = function () {
        if (request.status === 204) {
            console.log('node deleted'); // TODO remove from list, no content
            list_item.parentElement.removeChild(list_item);
            updateNext();
        } else {
            alert('request succeeded, but response was no good');
        }
    }
    
    request.onerror = function () {
        alert('server did not respond yo');
    };
    
    request.send();
}
