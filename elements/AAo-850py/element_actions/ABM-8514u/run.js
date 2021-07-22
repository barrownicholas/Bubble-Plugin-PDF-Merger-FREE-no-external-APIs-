function(instance, properties, context) {
    const fName = properties.filename;
    const numDocs = properties.pdf_list.length();
    const urls = properties.pdf_list.get(0,numDocs);
    const inputAsBase64 = properties.use_base64_strings;
    const directDownload = properties.direct_download;
    const doNotUpload = properties.do_not_upload_to_database;
    const arrFiltered = urls.filter(el => {return el != null && el != '';}); //Filters out empty values
    if(!inputAsBase64){
        for(var i = 0; i < arrFiltered.length; i++) {
            arrFiltered[i] = "https://stormy-bastion-35201.herokuapp.com/https:" + arrFiltered[i];
        }
    }
    instance.data.mergeAllPDFs(arrFiltered, fName, inputAsBase64, directDownload, doNotUpload);
}