function(instance, properties, context) {
    const fName = properties.filename;
    const a = "https://stormy-bastion-35201.herokuapp.com/https:" + properties.pdf_1;
    const b = "https://stormy-bastion-35201.herokuapp.com/https:" + properties.pdf_2;
    instance.data.mergeTwoPDFs(a,b,fName);
    //Adds the CORS Proxy in the function itself
}