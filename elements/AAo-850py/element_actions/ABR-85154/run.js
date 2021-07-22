function(instance, properties, context) {
    const fName = properties.filename;
    const firstPDF = properties.single_pdf;
    const numListPDFs = properties.list_of_pdfs.length();
    const listPDFs = properties.list_of_pdfs.get(0,numListPDFs);
    listPDFs.unshift(firstPDF);
    
    //Filter out empty items
    const arrFiltered = listPDFs.filter(el => {return el != null && el != '';});
	
    
    for(var i = 0; i < arrFiltered.length; i++) {
        arrFiltered[i] = "https://stormy-bastion-35201.herokuapp.com/https:" + arrFiltered[i];
    }
    //console.log(newList);
    console.log(arrFiltered);
    
    instance.data.mergeAllPDFs(arrFiltered, fName);
}