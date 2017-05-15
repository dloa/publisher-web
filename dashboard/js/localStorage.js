// This local storage array holds all artifacts that have yet to show up in LibraryD/OIP Libraries
/*var artifactsLocalStorage = [
	{
		timestamp: creationStartTimestamp,
		status: ['draft' || 'ipfs-upload-err' || 'tx-send-failure' || 'pending-block'],
		artifactJSON: artifactJSON...
	}
]*/
var PubLS = (function () {
	function PubLS(something) {
		this.artifacts = [];
	};

	PubLS.prototype.addArtifact = function(timestamp, status, artifactJSON){
		try {
			var pndArts = Storage.getItem('pendingArtifacts');
			pndArts.push({timestamp: timestamp, status: status, artifactJSON: artifactJSON});
			Storage.setItem('pendingArtifacts', pndArts);
		} catch (e) {
			console.log("Err saving to Local Storage: " + e);
		}
	};

	PubLS.prototype.updateArtifact = function(){
		
	};

	PubLS.prototype.removeArtifact = function(){
		
	};

	PubLS.prototype.getAllArtifacts = function(){
		
	};

	return PubLS;
})();