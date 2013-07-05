ko.extenders.logChange = function(target, option) {
    target.subscribe(function(newValue) {
       console.log(option + ": " + newValue);
    });
    return target;
};

// Initialize the KO view model
var vm = { };

vm.tree = ko.observable(null);

vm.activeNodes = ko.observableArray([]).extend({ logChange: 'nodes' });

// Note
vm.setActiveNodes = function(node){
    var testIndex = 1;
    ko.utils.arrayForEach(node.children, function(childNode){
        childNode.assignedHotkey = testIndex;
        testIndex++;
    })
    vm.activeNodes(node.children);
};

vm.selectNode = function(node){
    if(node.url){ // If this is a link, follow it
        chrome.tabs.create({ url: node.url })
    } else { // folder
        vm.setActiveNodes(node);
    }
};

vm.reset = function(){
    vm.setActiveNodes(vm.tree());
};

vm.hotkey = function(data, event){
    console.log(event);

    var index = parseInt(event.keyCode) - 48;
    var match = ko.utils.arrayFirst(vm.activeNodes(), function(node){
        return node.assignedHotkey === index;
    });
    if(match != null){
        vm.selectNode(match);
    }
};

// Load the data from chrome
chrome.bookmarks.getTree(function(tree){
    vm.tree(tree[0]);
    vm.setActiveNodes(tree[0]);
    console.log(tree[0]);
});

// This is the non-jquery way to be ready for something
document.addEventListener('DOMContentLoaded', function () {
  ko.applyBindings(vm);
});