const request = indexedDB.open('localforage')
request.onerror = (error) => {
  console.error(error)
}
request.onsuccess = (event) => {
  const db = event.target.result

  const transaction = db.transaction('keyvaluepairs', 'readonly')

  const objectStore = transaction.objectStore('keyvaluepairs')
  const req = objectStore.get('reduxPersist:auth')
  req.onerror = (e) => {
    // Handle errors!
    console.log('error', e)
  }
  req.onsuccess = (result) => {
    // Do something with the request.result!
    console.log(`result`, result.target.result)
  }
}
