function(instance, properties, context) {
    const fName = properties.filename;
    //"https://stormy-bastion-35201.herokuapp.com/https:"
    const a = properties.pdf_1;
    const b = properties.pdf_2;
    instance.data.mergeTwoPDFs(a,b,fName);
    //Adds the CORS Proxy in the function itself
}