ko.extenders.logChange = function(target, option) {
    target.subscribe(function(newValue) {
       console.log(option + ": " + newValue);
    });
    return target;
};

// Current hotkey plan is 12 keys, 3 rows of 4
var alphaHotkeys = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];

// Initialize the KO view model
var vm = { };
vm.tree = ko.observable(null);
vm.rootNode = ko.observable(null);
vm.selectedNode = ko.observable();

//vm.activeNodes = ko.observableArray([]).extend({ logChange: 'nodes' });
vm.activeNodes = ko.computed(function(){
    if(!vm.selectedNode()) return [];

    var nodes = vm.selectedNode().children;
    for(var index in nodes){
        nodes[index].assignedHotkey = alphaHotkeys[index];
    }
    return nodes;
});

vm.nodeClicked = function(node){
    if(node.url){
        chrome.tabs.create({ url: node.url });
        // Add this back in to make it close itself.
        // chrome.tabs.getCurrent(function(tab) {chrome.tabs.remove(tab.id); });
    } else { 
        //vm.nodeHistory.push(node);
        vm.selectedNode(node);
    }
};

vm.reset = function(){
    vm.selectedNode(vm.rootNode());
};

vm.breadcrumbs = ko.computed(function(){
    if(!vm.selectedNode()) return null;

    var node = vm.selectedNode();
    var crumbs = [];
   
    // Add 'dead' crumb for current
    crumbs.push({
        data: null,
        clickFunction: null,
        name: node.title
    });

    // iterate upwards through node parents
    while(node.parentNode){
        crumbs.push({
            data: node.parentNode,
            clickFunction: function() {
                vm.selectedNode(this.data);
            },
            name: node.parentNode.title
        });
        node = node.parentNode;
    }

    return crumbs.reverse();
});

function goUpHierarchy(){
    // TODO: Do this
}

function handleHotkey(keyCode, keyValue){
    // alphabetic keys
    if(keyCode >= 65 && keyCode <= 90){
        var match = ko.utils.arrayFirst(vm.activeNodes(), function(node){
            return node.assignedHotkey === keyValue;
        });

        if(match != null){
            vm.nodeClicked(match);
        }
        return;
    }

    // Other keys
    switch(keyCode){
        case 32:
            alert('!');
            break;
        case 192: case 27:
            goUpHierarchy();
            break;
    }
}

vm.hotkey = function(data, event){
    var keyValue = String.fromCharCode(event.keyCode).toUpperCase();
    console.log('keycode', event.keyCode, keyValue);
    handleHotkey(event.keyCode, keyValue);
};

function prepareBookmarkNodeRecursive(node, parent){
    if(parent !== null){
        node.parentNode = parent;
    }

    if(node.hasOwnProperty('children')){
        ko.utils.arrayForEach(node.children, function(child) {
            prepareBookmarkNodeRecursive(child, node);
        });
    }
}

// Load the data from chrome.bookmarks
chrome.bookmarks.getTree(function(tree){
    var rootNode = tree[0].children[0]; // this is the 'bookmarks bar'
    rootNode.parentId = null;

    prepareBookmarkNodeRecursive(rootNode, null);

    vm.tree(rootNode);
    vm.rootNode(rootNode);
    vm.selectedNode(rootNode);
});

// This is the non-jquery way to be ready for something
document.addEventListener('DOMContentLoaded', function () {
  ko.applyBindings(vm);
});