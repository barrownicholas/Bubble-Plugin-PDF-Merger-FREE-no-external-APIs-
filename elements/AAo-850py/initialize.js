function(instance, context) {
    
    //Checks if the "https:" is included at the begining of a string since Bubble does not include it
    function checkURL (iUrl) {
        var firstFiveChars = iUrl.substring(0,6);
    	var returnMe;
    	if(firstFiveChars === "https:") {
        	returnMe = iUrl;
    	}
    	else {
        	returnMe = "https:" + iUrl;
    	}
    	return returnMe;
	}
    instance.data.checkURL = checkURL;
    
    
    async function mergeTwoPDFs(urlA, urlB, fileName, ignore_encryption) {
    	const url1 = urlA;
    	const url2 = urlB;

    	const firstDonorPdfBytes = await fetch(url1).then(res => res.arrayBuffer());
    	const secondDonorPdfBytes = await fetch(url2).then(res => res.arrayBuffer());

    	const firstDonorPdfDoc = await PDFLib.PDFDocument.load(firstDonorPdfBytes, {ignoreEncryption: ignore_encryption});
    	const secondDonorPdfDoc = await PDFLib.PDFDocument.load(secondDonorPdfBytes, {ignoreEncryption: ignore_encryption});

    	const pdfDoc = await PDFLib.PDFDocument.create();

    	//Define a function to fill an array with each value
    	const doc1length = firstDonorPdfDoc.getPageCount();
    	const doc2length = secondDonorPdfDoc.getPageCount();
    	var filledPageArray1 = new Array(doc1length);
    	var filledPageArray2 = new Array(doc2length);
    	for(var i = 0; i < filledPageArray1.length; i++) {
        	filledPageArray1[i] = i;
    	}
    	for(var j = 0; j < filledPageArray2.length; j++) {
        	filledPageArray2[j] = j;
    	}

    	
    	const [secondDonorPage] = await pdfDoc.copyPages(secondDonorPdfDoc, filledPageArray2);

    	for(var k = 0; k < filledPageArray1.length; k++) {
            const [firstDonorPage] = await pdfDoc.copyPages(firstDonorPdfDoc, [k]);
            //console.log("Doc 1, page " + k);
        	pdfDoc.addPage(firstDonorPage);
    	}

    	for(var l = 0; l < filledPageArray2.length; l++) {
            const [secondDonorPage] = await pdfDoc.copyPages(secondDonorPdfDoc, [l]);
			//console.log("Doc 2, page " + l);
        	pdfDoc.addPage(secondDonorPage);
    	}
    	const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    	//console.log(pdfDataUri);
  
  		// strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
    	var data_pdf = pdfDataUri.substring(pdfDataUri.indexOf(',')+1);
    	context.uploadContent(fileName + ".pdf", data_pdf, instance.data.uploadContentCallback);
	}
	instance.data.mergeTwoPDFs = mergeTwoPDFs;
    
    
    async function mergeAllPDFs(urls, fileName, ignore_encryption) {
        
        const pdfDoc = await PDFLib.PDFDocument.create();
        const numDocs = urls.length;
        
        for(var i = 0; i < numDocs; i++) {
            const donorPdfBytes = await fetch(urls[i]).then(res => res.arrayBuffer());
            const donorPdfDoc = await PDFLib.PDFDocument.load(donorPdfBytes, {ignoreEncryption: ignore_encryption});
            const docLength = donorPdfDoc.getPageCount();
            for(var k = 0; k < docLength; k++) {
            	const [donorPage] = await pdfDoc.copyPages(donorPdfDoc, [k]);
            	//console.log("Doc " + i+ ", page " + k);
        		pdfDoc.addPage(donorPage);
    		}
        }

    	const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    	//console.log(pdfDataUri);
  
  		// strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
    	var data_pdf = pdfDataUri.substring(pdfDataUri.indexOf(',')+1);
    	context.uploadContent(fileName + ".pdf", data_pdf, instance.data.uploadContentCallback);
	}
	instance.data.mergeAllPDFs = mergeAllPDFs;
    
    
    
    function uploadContentCallback(err, url) {
    	if (url) {
      		instance.publishState('file_url', url);
      		instance.triggerEvent('is_generated', function(err) {});
    	} 
        else {
      		console.error("PDFMerger plugin", "Error on uploadContent:", err);
    	}
  	}
  	instance.data.uploadContentCallback = uploadContentCallback;
}