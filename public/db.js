let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("new", 1);

request.onupgradeneeded = function(event) {
   // create object store called "store" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("store", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the store db with readwrite access
  const transaction = db.transaction(["store"], "readwrite");

  // access your store object store
  const store = transaction.objectStore("store");

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your store db
  const transaction = db.transaction(["store"], "readwrite");
  // access your store object store
  const store = transaction.objectStore("store");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // if successful, open a transaction on your store db
        const transaction = db.transaction(["store"], "readwrite");

        // access your store object store
        const store = transaction.objectStore("store");

        // clear all items in your store
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
