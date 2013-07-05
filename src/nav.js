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

// $('body').keyup(function(event){
//     console.log(event);
// });

function handleHotkey(keyCode, keyValue){
    // Number key checks
    if(!isNaN(keyValue)){
        var match = ko.utils.arrayFirst(vm.activeNodes(), function(node){
            return node.assignedHotkey === keyValue;
        });

        if(match != null){
            vm.selectNode(match);
        }
        return;
    }

    // Other keys
    switch(keyCode){
        case 32:
            alert('!');
            break;
        case 192: case 27:
            alert('go up');
            break;
    }
}

vm.hotkey = function(data, event){
    var keyValue = parseInt(String.fromCharCode(event.keyCode));
    console.log('keycode', event.keyCode, keyValue);
    handleHotkey(event.keyCode, keyValue);
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