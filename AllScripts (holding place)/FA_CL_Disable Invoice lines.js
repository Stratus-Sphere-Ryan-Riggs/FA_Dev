function lineInit(type, name) {

    nlapiLogExecution('Debug', 'lineinit-postsource    ' + type + ' name ' + name);
    if (type == 'item') {
        nlapiDisableLineItemField('item', 'item', true);
        nlapiDisableLineItemField('item', 'amount', true);
      nlapiDisableLineItemField('item', 'taxcode', true);
      nlapiDisableLineItemField('item', 'custcol_cseg_projects_cseg', true);
    }

}

function validateInsert(type){
  if(type == 'item'){
    alert('You do not have permission to insert items');
    return false;
  }
  
}

function validateDelete(type){
  if(type == 'item'){
    alert('You do not have permission to Delete items');
    return false;
  }
  
}