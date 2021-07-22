function(instance, properties, context) {
    const fName = properties.filename;
    const firstPDF = properties.single_pdf;
    const numListPDFs = properties.list_of_pdfs.length();
    const listPDFs = properties.list_of_pdfs.get(0,numListPDFs);
    listPDFs.unshift(firstPDF);
    const inputAsBase64 = properties.use_base64_strings;
    const directDownload = properties.direct_download;
    const doNotUpload = properties.do_not_upload_to_database;
    
    //Filter out empty items
    const arrFiltered = listPDFs.filter(el => {return el != null && el != '';});
    
    if(!inputAsBase64){
        for(var i = 0; i < arrFiltered.length; i++) {
            arrFiltered[i] = "https://stormy-bastion-35201.herokuapp.com/https:" + arrFiltered[i];
        }
    }
    
    instance.data.mergeAllPDFs(arrFiltered, fName, inputAsBase64, directDownload, doNotUpload);
}