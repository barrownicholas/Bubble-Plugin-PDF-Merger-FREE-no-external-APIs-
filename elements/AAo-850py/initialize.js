function(instance, context) {

	//Do my changes push?
    
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
    
    //The addPage method of the final doc automatically adds to the end
    //So, create the final PDF doc and then use for-loop within a for-loop to loop through an individual page
    //in each pdf
	//async function copyPagesExample() {
  		//const url1 = 'https://pdf-lib.js.org/assets/with_update_sections.pdf'
  		//const url2 = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'

  		//const firstDonorPdfBytes = await fetch(url1).then(res => res.arrayBuffer())
  		//const secondDonorPdfBytes = await fetch(url2).then(res => res.arrayBuffer())

  		//const firstDonorPdfDoc = await PDFLib.PDFDocument.load(firstDonorPdfBytes)
  		//const secondDonorPdfDoc = await PDFLib.PDFDocument.load(secondDonorPdfBytes)

  		//const pdfDoc = await PDFLib.PDFDocument.create();

  		//const [firstDonorPage] = await pdfDoc.copyPages(firstDonorPdfDoc, [0])
  		//const [secondDonorPage] = await pdfDoc.copyPages(secondDonorPdfDoc, [1,742])

  		//pdfDoc.addPage(firstDonorPage)
  		//pdfDoc.insertPage(0, secondDonorPage)
        
        //const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
        //console.log(pdfDataUri)
        
        // strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
      	//var data_pdf = pdfDataUri.substring(pdfDataUri.indexOf(',')+1);
        //context.uploadContent("file.pdf", data_pdf, instance.data.uploadContentCallback);
    //}
    //instance.data.copyPagesExample = copyPagesExample;
    
    async function mergeTwoPDFs(urlA, urlB, fileName) {
    	const url1 = urlA;
    	const url2 = urlB;

    	const firstDonorPdfBytes = await fetch(url1).then(res => res.arrayBuffer());
    	const secondDonorPdfBytes = await fetch(url2).then(res => res.arrayBuffer());

    	const firstDonorPdfDoc = await PDFLib.PDFDocument.load(firstDonorPdfBytes);
    	const secondDonorPdfDoc = await PDFLib.PDFDocument.load(secondDonorPdfBytes);

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
    
    async function mergeAllPDFs(urls, fileName) {
        
        const pdfDoc = await PDFLib.PDFDocument.create();
        const numDocs = urls.length;
        
        for(var i = 0; i < numDocs; i++) {
            const donorPdfBytes = await fetch(urls[i]).then(res => res.arrayBuffer());
            const donorPdfDoc = await PDFLib.PDFDocument.load(donorPdfBytes);
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
    
    function _base64ToArrayBuffer(base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
    instance.data._base64ToArrayBuffer = _base64ToArrayBuffer;
    
    async function mergeAllPDFsDirect(strings, fileName) {
        const pdfDoc = await PDFLib.PDFDocument.create();
        const numDocs = strings.length;
        
        for(var i = 0; i < numDocs; i++) {
            const donorPdfBytes = instance.data._base64ToArrayBuffer(strings[i]);
            const donorPdfDoc = await PDFLib.PDFDocument.load(donorPdfBytes);
            const docLength = donorPdfDoc.getPageCount();
            for(var k = 0; k < docLength; k++) {
            	const [donorPage] = await pdfDoc.copyPages(donorPdfDoc, [k]);
            	console.log("PDF Merger: Added Doc " + i+ ", page " + k);
        		pdfDoc.addPage(donorPage);
    		}
        }

    	const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    	//console.log(pdfDataUri);
  
  		// strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
    	var data_pdf = pdfDataUri.substring(pdfDataUri.indexOf(',')+1);
    	context.uploadContent(fileName + ".pdf", data_pdf, instance.data.uploadContentCallback);
	}
	instance.data.mergeAllPDFsDirect = mergeAllPDFs;
    
    
    
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