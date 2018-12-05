const base_url = 'http://localhost:3000/api';

getQueues();
setUpQueue();

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

    const url = base_url + '/queues';
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
                option.value = data[i].abbreviation;
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
 * Set up the queue
 */
function setUpQueue() {
    var queue_list = document.getElementById("queue-list");

    populateQueue(queue_list);

}

/**
 * Populate queue with data from backend
 */
function populateQueue(queue_list) {
    const url = base_url + '/queues/3'; // TODO FIX this shit
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    
    request.onload = function () {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText).content.data;
            var nodes = data.nodes;
            for (let i = 0; i < nodes.length; i++) {
                addNode(queue_list, nodes[i]);
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

    // Add delete button to list item
    var delete_button = document.createElement("SPAN");
    var text = document.createTextNode("\u00D7");
    delete_button.className = "close-button";
    delete_button.appendChild(text);
    list_item.appendChild(delete_button);

    delete_button.onclick = deleteNode;

    // Add service button to list item
    var service_button = document.createElement("SPAN");
    var text = document.createTextNode("\u2713");
    service_button.className = "service-button";
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
    const url = base_url + '/nodes/' + id + '/service'; // TODO FIX this shit
    const request = new XMLHttpRequest();
    request.open('POST', url, true);
    
    request.onload = function () {
        if (request.status === 202) {
            var content = JSON.parse(request.responseText).content;
            console.log(content, 'node service');
            alert('node serviced'); // TODO remove from list
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
    const url = base_url + '/nodes/' + id; // TODO FIX this shit
    const request = new XMLHttpRequest();
    request.open('DELETE', url, true);
    
    request.onload = function () {
        if (request.status === 204) {
            console.log('node deleted'); // TODO remove from list, no content
            alert('node deleted');
        } else {
            alert('request succeeded, but response was no good');
        }
    }
    
    request.onerror = function () {
        alert('server did not respond yo');
    };
    
    request.send();
}
