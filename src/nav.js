ko.extenders.logChange = function(target, option) {
    target.subscribe(function(newValue) {
       console.log(option + ": " + newValue);
    });
    return target;
};

// Current hotkey plan is 12 keys, 3 rows of 4
var alphaHotkeys = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];

var pageSize = 12;

// Initialize the KO view model
var vm = { };
vm.tree = ko.observable(null);
vm.rootNode = ko.observable(null);
vm.selectedNode = ko.observable();

vm.childNodes = ko.computed(function(){
    if(!vm.selectedNode()) return [];
    return vm.selectedNode().children;
});
vm.childNodesLength = ko.computed(function(){
    return vm.childNodes().length;
});
vm.activeNodeIndex = ko.observable(0);//.extend({ logChange: 'activeNodeIndex'});

// this resets the page index as nodes are selected
vm.selectedNode.subscribe(function(newValue){
    vm.activeNodeIndex(0);
});

vm.startIndex = ko.computed(function(){
    return vm.activeNodeIndex() * pageSize;
});//.extend({ logChange: 'startIndex'});
vm.endIndex = ko.computed(function(){
    var index = vm.startIndex() + pageSize;
    return index > vm.childNodesLength() ? vm.childNodesLength() : index;
});//.extend({ logChange: 'endIndex'});

// This computed returns the nodes to be shown, with their hotkeys
vm.activeNodes = ko.computed(function(){
    var page = vm.activeNodeIndex();
    var nodes = vm.childNodes();
    
    var start = vm.startIndex(), end = vm.endIndex();

    nodes = nodes.slice(start, end);

    // assign hotkeys
     for(var index in nodes){
        nodes[index].assignedHotkey = alphaHotkeys[index];
    }

    return nodes;
});

vm.showPrev = ko.computed(function(){
    return false;
});
vm.showNext = ko.computed(function(){
    return vm.childNodes().length > pageSize;
});
vm.nextPage = function(){
    vm.activeNodeIndex(vm.activeNodeIndex() + 1);

    // If we're too far, loop back around
    if(vm.activeNodeIndex() * pageSize > vm.childNodes().length){
        vm.activeNodeIndex(0);
    }
};

vm.nodeClicked = function(node, closeSelf){
    if(node.url){
        chrome.tabs.create({ url: node.url, active: closeSelf });
        // Add this back in to make it close itself.
        if(closeSelf){
            chrome.tabs.getCurrent(function(tab) {chrome.tabs.remove(tab.id); });
        }
    } else { 
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

vm.breadcrumbText = ko.computed(function(){
    return '(' + (vm.startIndex() + 1) + ' to ' + vm.endIndex() + ' of ' + vm.childNodes().length + ' items)';
});

function goUpHierarchy(){
    if(vm.selectedNode().parentNode){
        vm.selectedNode(vm.selectedNode().parentNode);
    }
}

function handleHotkey(keyCode, keyValue, keyEvent){
    // alphabetic keys
    if(keyCode >= 65 && keyCode <= 90){
        var match = ko.utils.arrayFirst(vm.activeNodes(), function(node){
            return node.assignedHotkey === keyValue;
        });

        if(match != null){
            vm.nodeClicked(match, !keyEvent.shiftKey);
        }
        return;
    }

    // Other keys
    switch(keyCode){
        case 32: // spacebar
            vm.nextPage();
            break;
        case 192: case 27: // esc and tilde
            goUpHierarchy();
            break;
    }
}

vm.hotkey = function(data, event){
    var keyValue = String.fromCharCode(event.keyCode).toUpperCase();
    console.log('keycode', event.keyCode, keyValue);
    handleHotkey(event.keyCode, keyValue, event);
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