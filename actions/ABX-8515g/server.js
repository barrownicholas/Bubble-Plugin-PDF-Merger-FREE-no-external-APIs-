function(properties, context) {
    console.log("[PDF Merger] Initializing Object States")
    const PDFLib = require('pdf-lib');
    const fetch = require('node-fetch');
    var url1 = properties.pdf_1;
    var url2 = properties.pdf_2;
    var filename = properties.filename;
    var returner = '';

    // Check to make sure the 'http:' prefix is included since Bubble does not include it.
    if(url1.substring(0,5) != 'http:') {
        url1 = 'http:' + url1
        console.log("[PDF Merger] Fixed URL 1: " + url1)
    }
    else {
        console.log("[PDF Merger] Accepted URL 1: " + url1)
    }
    if(url2.substring(0,5) != 'http:') {
        url2 = 'http:' + url2
        console.log("[PDF Merger] Fixed URL 2: " + url2)
    }
    else {
        console.log("[PDF Merger] Accepted URL 2: " + url2)
    }

    // Check to see if filename contains '.pdf'
    if(filename.split('.').pop() != '.pdf') {
        filename = filename + '.pdf'
        console.log("[PDF Merger] Fixed Filename: " + filename)
    }
    else {
        console.log("[PDF Merger] Accepted Filename: " + filename)
    }

    console.log("[PDF Merger] Building Helper Function: mergeTwoPDFs")
    // Helper function that does the actual merging
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
        returner = data_pdf
    	// context.uploadContent(fileName + ".pdf", data_pdf, instance.data.uploadContentCallback);
	}
    console.log("[PDF Merger] Initialization Complete")
    
    console.log("[PDF Merger] Attempting to Merge")
    try {
        mergeTwoPDFs(url1, url2, filename)
        console.log("[PDF Merger] Successful Merge: (base 64) " + returner)
    } catch (error) {
        console.log("[PDF Merger] Error: " + error)
    }
    
    
}