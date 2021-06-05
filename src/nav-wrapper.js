var iframe = document.getElementById('sandbox-host-frame');

// This is the non-jquery way to be ready for something
document.addEventListener('load', function () {

iframe.src = "nav.html";

  var message = {
     command: 'bookmarks-tree-data',
     context: {
       thing: 'world'
     }
   };

   iframe.contentWindow.postMessage(message, '*');
});
