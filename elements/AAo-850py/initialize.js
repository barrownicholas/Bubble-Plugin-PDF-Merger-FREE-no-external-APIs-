function(instance, context) {

    //##############################################################################
    //############################## HELPER FUNCTIONS ##############################
    //##############################################################################

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

    function base64ToArrayBuffer(base64) {
        var binary_string = atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
    instance.data.base64ToArrayBuffer = base64ToArrayBuffer;

    //##############################################################################
    //##############################################################################
    //##############################################################################

    //##############################################################################
    //############################## MERGER FUNCTIONS ##############################
    //##############################################################################

    //Takes two PDFs and merges them together
    async function mergeTwoPDFs(urlA, urlB, fileName, inputAsBase64, outputAsBase64, directDownload, doNotUpload) {

        var firstDonorPdfBytes = null;
        var secondDonorPdfBytes = null;

        //the IF uses URLs, the ELSE uses base64 strings -> both create arrayBuffer()'s
        if(inputAsBase64) {
            console.log("[PDF Merger] Loading via Base64");
            firstDonorPdfBytes = instance.data.base64ToArrayBuffer(urlA);
            secondDonorPdfBytes = instance.data.base64ToArrayBuffer(urlB);
        }
        else {
            console.log("[PDF Merger] Loading via URLs");
            firstDonorPdfBytes = await fetch(urlA).then(res => res.arrayBuffer());
            secondDonorPdfBytes = await fetch(urlB).then(res => res.arrayBuffer());
        }


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
        // strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
        var base64ContentArray = pdfDataUri.split(",");
        var mimeType = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0]
        var data_pdf = base64ContentArray[1]
        console.log(data_pdf)

        instance.publishState('base64_output', data_pdf);
        instance.triggerEvent('is_generated', function(err) {});
        
        console.log("[PDF Merger] Direct Download Status: " + directDownload)
        if(directDownload) {
            console.log("[PDF Merger] Direct Download Triggered")
            download(pdfDataUri, fileName, mimeType);
        }
        console.log("[PDF Merger] Upload Status: " + !doNotUpload)
        if(!doNotUpload) {
            console.log("[PDF Merger] Uploading Triggered")
            context.uploadContent(fileName + ".pdf", data_pdf, instance.data.uploadContentCallback);
        }
        
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

    //##############################################################################
    //##############################################################################
    //##############################################################################


    //Bubble's callback for uploading files
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