function(instance, properties, context) {
    const fName = properties.filename;
    var a = null; 
    var b = null; 
    const inputAsBase64 = properties.use_base64_strings;
    if(inputAsBase64){
        a = properties.pdf_1;
        b = properties.pdf_2;
    }
    else {
        a = "https://stormy-bastion-35201.herokuapp.com/https:" + properties.pdf_1;
        b = "https://stormy-bastion-35201.herokuapp.com/https:" + properties.pdf_2;
    }
    const directDownload = properties.direct_download;
    const doNotUpload = properties.do_not_upload_to_database;
    instance.data.mergeTwoPDFs(a,b,fName,inputAsBase64, directDownload, doNotUpload);
    //Adds the CORS Proxy in the function itself (if needed?)
}