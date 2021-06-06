// This is the non-jquery way to be ready post loading
document.addEventListener('DOMContentLoaded', function () {
  var iframe = document.getElementById('sandbox-host-frame');

  // Wait for the message from the nav iframe to say it's ready for data
  window.addEventListener("message", (event) => {
    console.log("nav-wrapper message received", event);
    switch (event.data.command) {
      case 'nav-window-ready':
        // Load the bookmarks async
        chrome.bookmarks.getTree(function(tree){
          // Send the bookmarks data to iframe
          iframe.contentWindow.postMessage({
            command: 'bookmarks-tree-data',
            context: tree
          }, '*');
        });
        break;
      case 'create-tab':
        chrome.tabs.create({ url: event.data.context.url, active: true });
        break;
      case 'nav-window-resized':
        //alert("window resize", event.data.context.width, event.data.context.height)
        console.log('nav wrapper resizing', event.data.context);
        iframe.style.height = (event.data.context.height + 84) + "px";
        break;
      default:
        console.error('unrecognized message', event);
        break;
    }

  }, false);

  // Iframe was set to no src, this delays loading until we're ready
  iframe.src = "nav.html";
});
