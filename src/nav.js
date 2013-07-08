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

// Current hotkey plan is 12 keys, 3 rows of 4
var alphaHotkeys = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];

// Note
vm.setActiveNodes = function(node){
    for(var i=0; i<12; i++){
        // todo

    }
    var index = 0;
    ko.utils.arrayForEach(node.children, function(childNode){
        childNode.assignedHotkey = alphaHotkeys[index];
        index++;
    })
    vm.activeNodes(node.children);
};

vm.selectNode = function(node){
    if(node.url){ // If this is a link, follow it
        chrome.tabs.create({ url: node.url });
        // Add this back in to make it close itself.
        // chrome.tabs.getCurrent(function(tab) {
        //     chrome.tabs.remove(tab.id);
        // });
    } else { // folder
        vm.setActiveNodes(node);
    }
};

vm.reset = function(){
    vm.setActiveNodes(vm.tree());
};

vm.levels = ko.observableArray();

vm.breadcrumbs = ko.computed(function(){
    var crumbs = [{
        clickFunction: vm.reset,
        name: 'Root'
    }];
    ko.utils.arrayForEach(vm.levels(), function(item){
        crumbs.push({ 
            clickFunction: alert('!'),
            name: item.title  
        });
    });
    return crumbs;
});

function goUpHierarchy(){
    // TODO: Do this
    // var firstNode = vm.activeNodes()[0];
    // if(firstNode){
    //     var secondNode = firstNode.parent
    // }
}

function handleHotkey(keyCode, keyValue){
    // Number key checks
    // if(!isNaN(keyValue)){
    //     var match = ko.utils.arrayFirst(vm.activeNodes(), function(node){
    //         return node.assignedHotkey === keyValue;
    //     });

    //     if(match != null){
    //         vm.selectNode(match);
    //     }
    //     return;
    // }

    // letter keys
    if(keyCode >= 65 && keyCode <= 90){
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
            goUpHierarchy();
            break;
    }
}

vm.hotkey = function(data, event){
    var keyValue = String.fromCharCode(event.keyCode).toUpperCase();
    console.log('keycode', event.keyCode, keyValue);
    handleHotkey(event.keyCode, keyValue);
};

// Load the data from chrome.bookmarks
chrome.bookmarks.getTree(function(tree){
    var rootNode = tree[0].children[0]; // this is the 'bookmarks bar'
    vm.tree(rootNode);
    vm.setActiveNodes(rootNode);
});

// This is the non-jquery way to be ready for something
document.addEventListener('DOMContentLoaded', function () {
  ko.applyBindings(vm);
});