// Initialize the KO view model
var vm = { };

vm.rootNode = ko.observable(null);
vm.rootNodeJSON = ko.computed(function(){
    return JSON.stringify(rootNode);
});

chrome.bookmarks.getTree(function(tree){
    vm.rootNode(tree);
})

// This is the non-jquery way to be ready for something
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded');
  ko.applyBindings(vm);
});