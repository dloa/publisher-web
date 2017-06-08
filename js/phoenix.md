# What is Phoenix?
Phoenix is the backend that runs the publisher. It has two main parts:
- `phoenix-api` provides an object that contains the current status of the publisher overall. It emits events that you can subscribe to so that you can keep the UI updated.
- `phoenix-ui` is a sample utilization of the event system in `phoenix-api` that updates the publisher frontend.

## Phoenix API
In order to start using the API, you will need to import the javascript file in your project. From there the `Phoenix` object becomes exposed. However, you cannot do much with the API until you "login". After you have logged in, you then will be able to see more information specifically about the user inside the Phoenix object. For example, you can use `Phoenix.artifacts` (after the artifacts have been loaded) to access all of the currently logged in users

## Events
Here are a list of the events currently used by the `phoenix-api`:
- `onLogin`
- `onLoginSuccess`
- `onLoginFail`
- `onArtifactsLoad` this event is sent out after the user has logged in and the aftifacts have been successfully retreived from LibraryD
- `onArtifactValidation` called when the validation completes, contains pass/fail information for each artifact field.
- `onPublish` called when the publish process is started
- `onPublishSuccess` called every time there is any progress happening with a publisher
- `onPublishFail` called every time there is any progress happening with a publisher
- `onPublishProgress` called every time there is any progress happening with a publisher
- `onPublishFee` called when the publish fee is calculated
- `onIPFSUploadStart`
- `onIPFSUploadProgress`
- `onIPFSUploadSuccess`
- `onIPFSUploadFail`
- `onAutosave` called on every autosave (happens every 30 seconds when working on publishing an artifact if anything has changed.)
- `onError` called every time an error happens
- `onTradebotStart`
- `onTradebotProgress`
- `onTradebotSuccess`
- `onTradebotFail`
- ``
- ``
- ``
- ``

## UI Methods
The UI has the following methods in addition to implementing events from the PhoenixAPI event system.
```
PhoenixUI.generateArtifactJSONFromView(selectorObject) // Pulls from all the available fields on the UI to return just the JSON for the artifact.
PhoenixUI.loadArtifactIntoView(artifactJSON) // Calls the three methods below, you can overwrite any of them in case your UI needs different code.
PhoenixUI.loadArtifactMetadata(artifactJSON)
PhoenixUI.loadArtifactPaymentTable(paymentJSON)
PhoenixUI.loadArtifactFileTable(filesJSON)
PhoenixUI.updateValidationStatus(validationStatus) // Updates the metadata fields based on the results
PhoenixUI.
PhoenixUI.
```

## API Methods
The API exposes the following methods.

```
PhoenixAPI.login() // If you attempt to login with blank then it will attempt to load credentials from the HTML5 LocalStorage
PhoenixAPI.login(identifier, password)
PhoenixAPI.login(floPubAddrPrivateKey) // This login method has not yet been implemented, but in the future it would allow you to login just using your wallet private key. Currently Phoenix requires users to use FLO Vault.
PhoenixAPI.setIPFSProvider(host, port, protocol) // formats: {host: 'ipfs.alexandria.io', port: '443', protocol: 'https'}
PhoenixAPI.uploadFilesToIPFS(files[]) // Uploads all the files to IPFS and wraps them in a directory. This method is called by `publishArtifact`
PhoenixAPI.publishArtifact(artifact)
PhoenixAPI.validateArtifact(artifact) // Returns information about if every field is valid, and if not, returns info object on what specifically failed/passed the validation. 
PhoenixAPI.calculatePublishFee(artifact)
PhoenixAPI.resumePublisherQueue()
PhoenixAPI.pausePublisherQueue() // This entirely pauses all uploads/other.
```
