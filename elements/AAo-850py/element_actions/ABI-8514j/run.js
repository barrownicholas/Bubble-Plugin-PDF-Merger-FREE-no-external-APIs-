function(instance, properties, context) {
    const fName = properties.filename;
    const ignore_encryption = instance.data.ignore_encryption;
    //"https://stormy-bastion-35201.herokuapp.com/https:"
    const a = properties.pdf_1;
    const b = properties.pdf_2;
    instance.data.mergeTwoPDFs(a,b,fName, ignore_encryption);
    //Adds the CORS Proxy in the function itself
}