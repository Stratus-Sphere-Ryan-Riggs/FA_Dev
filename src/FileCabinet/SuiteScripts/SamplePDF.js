function EmailTemplate(){
var Transaction_PDF = nlapiPrintRecord('TRANSACTION', 59791730, 'PDF', null);
nlapiSendEmail(696602,'drhoden@feedingamerica.org','Testing',"Testing",null,null,{ 'transaction': 59791730 },  Transaction_PDF, true)
}