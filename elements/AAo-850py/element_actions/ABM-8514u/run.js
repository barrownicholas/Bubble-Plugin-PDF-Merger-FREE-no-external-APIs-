function(instance, properties, context) {
    const fName = properties.filename;
    const numDocs = properties.pdf_list.length();
    const urls = properties.pdf_list.get(0,numDocs);
    
    const arrFiltered = urls.filter(el => {return el != null && el != '';});
    for(var i = 0; i < arrFiltered.length; i++) {
        arrFiltered[i] = "https://stormy-bastion-35201.herokuapp.com/https:" + arrFiltered[i];
    }
    //console.log(newList);
    
	console.log(arrFiltered);
    instance.data.mergeAllPDFs(arrFiltered, fName);
}