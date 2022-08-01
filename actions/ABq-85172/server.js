function(properties, context) {

    const { PDFDocument } = require("pdf-lib");
    const fetch = require("node-fetch");
    const validUrl = require('valid-url');
    
    const logs = [];

    // DEFINE PROPERTIES VARIABLES
    const urls = properties.list_of_pdfs.get(0, properties.list_of_pdfs.length());
    const fileName = properties.merged_file_name;
    const baseURL = properties.baseurl;
    
    function validate_urls(urls) {
        const validURLs = [];
        for (var i = 0; i < urls.length; i++) {
            const url = urls[i];
            if (validUrl.isWebUri(url)) {
                logs.push("[DEBUG] PDF Merger validated: " + url);
                validURLs.push(url);
            }
            else if (validUrl.isWebUri("https:" + url)) {
                let new_url = "https:" + url;
                logs.push("[WARNING] PDF Merger was unable to validate '" + url + "' but was able to validate '" + new_url + "'. This occurs because Bubble does not store the 'https' prefix. PDF Merger has automatically added this for you.");
                validURLs.push(new_url);
            }
            else {
                logs.push("[WARNING] PDF Merger cannot validate '" + url + "' as a valid web url, it will be ignored.");
            }
        }
        return validURLs;
    }
    const validated = validate_urls(urls);
    urls.length = 0;
    for (let i = 0; i < validated.length; i++) {
        urls.push(validated[i]);
    }


    function getURI(urls) {
        return context.async(async callback => {
            try {
                let return_var = "never set in code";

                // create the document object
                const pdfDoc = await PDFDocument.create();
                const numDocs = urls.length;

                // cycle over each document-url
                for(var i = 0; i < numDocs; i++) {
                    const donorPdfBytes = await fetch(urls[i]).then(res => res.arrayBuffer());
                    const donorPdfDoc = await PDFDocument.load(donorPdfBytes);
                    const docLength = donorPdfDoc.getPageCount();
                    for(var k = 0; k < docLength; k++) {
                        const [donorPage] = await pdfDoc.copyPages(donorPdfDoc, [k]);
                        pdfDoc.addPage(donorPage);
                    }
                }

                const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
                // strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
                const data_pdf = pdfDataUri.substring(pdfDataUri.indexOf(',')+1);

                return_var = data_pdf;
                callback(null, return_var);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    
    const uri = getURI(urls);
    
    let uploaded_file_url = null;
    if (!properties.do_not_upload) {
        uploaded_file_url = context.async(async callback => {
            try {
                let return_var = "never set in code";

                let payload = {
                    name: fileName,
                    contents: uri,
                    private: false
                }

                var options = {
                    uri: properties.baseurl + "fileupload",
                    method: "POST",
                    json: payload
                }

                var fileurl = context.request(options).body;

                return_var = "https:" + fileurl;

                callback(null, return_var);
            }
            catch (err) {
                callback(err);
            }
        });
    }

    
    
    return {
        "dataUri": uri,
        "file_url": uploaded_file_url,
        "logs": logs
    }


}