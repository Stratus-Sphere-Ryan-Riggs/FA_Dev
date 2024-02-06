 /**
  *@NApiVersion 2.x
  *@NScriptType ScheduledScript
  */
 define(['N/sftp', 'N/file', 'N/search', 'N/task'],
     function(sftp, file, search, task) {

      function execute(context)
      {
        /*var myPwdGuid = "bd0941571a5b45f7ad85ce1f4b620528";
        var myHostKey = "AAAAB3NzaC1kc3MAAACBAKS6np54cE26YZ/Hr2voNhAH3DBdUSNvwS/f3rxJB/i4qJJDSL499obSp3YTe3Z225hFXARbSecp7XrPQofKW9zG6o1P5f5gEa14ua/s16npOP2sFqHwL5uWO8cOhvQJrPI+oVOp4b+YCemFEqxR/30GlD7i+g28Tl1ZEDWd/5+FAAAAFQCBnqqzxJQILqh/1uxdsyChMTD/wwAAAIBLUHFHgJKsNhhrzNiapF/zOa4UzN8Q1mCulJoiu1ULAz6vAs2WpsckzvVdPOJ/bkfY/L4IKGGUaFhVbQxS/+eVHPCPx4uLpEloFunsnEb6pqUIckpdGL1+RN2kLG8FH0rxEPF7OPELU/gXSp3+pZjbmbewGQLgueFBHVTy6U4vLwAAAIBNfOeoAmwpfatdJ8BCe2bJUufOgRCwshkDOpWE2FWIPQIn6adU7u9RYGcKBbI7oZIQO+4JxTLx698n7GNuVsca74jOsEtWlTeuNUoSr7Rn47jXF8RZpKCsQ8RKwQbtGVhyLMd2FSf0HZTFrVjBJR1/GaE0igk9GQCDxa0NSCh5Dg==";

        var connection = sftp.createConnection({
            username: 'SVC_EnterpriseDataWarehouse',
            passwordGuid: myPwdGuid,
            url: 'secureftp.feedingamerica.org',
            hostKeyType: 'dsa',
            port: 22,
            hostKey: myHostKey
        });
        
        
        connection.upload({
            //directory: '\root',
            filename: 'results.csv',
            file: myFileToUpload,
            replaceExisting: true
        });
        
        */
        
        var username = 'SVC_EnterpriseDataWarehouse';
        var passwordGuid = 'f9efac6f50de42beb4dd9cbe5d3709e7';
        var url = 'SecureFTP.feedingamerica.org';
        var hostKey = 'AAAAB3NzaC1kc3MAAACBAKS6np54cE26YZ/Hr2voNhAH3DBdUSNvwS/f3rxJB/i4qJJDSL499obSp3YTe3Z225hFXARbSecp7XrPQofKW9zG6o1P5f5gEa14ua/s16npOP2sFqHwL5uWO8cOhvQJrPI+oVOp4b+YCemFEqxR/30GlD7i+g28Tl1ZEDWd/5+FAAAAFQCBnqqzxJQILqh/1uxdsyChMTD/wwAAAIBLUHFHgJKsNhhrzNiapF/zOa4UzN8Q1mCulJoiu1ULAz6vAs2WpsckzvVdPOJ/bkfY/L4IKGGUaFhVbQxS/+eVHPCPx4uLpEloFunsnEb6pqUIckpdGL1+RN2kLG8FH0rxEPF7OPELU/gXSp3+pZjbmbewGQLgueFBHVTy6U4vLwAAAIBNfOeoAmwpfatdJ8BCe2bJUufOgRCwshkDOpWE2FWIPQIn6adU7u9RYGcKBbI7oZIQO+4JxTLx698n7GNuVsca74jOsEtWlTeuNUoSr7Rn47jXF8RZpKCsQ8RKwQbtGVhyLMd2FSf0HZTFrVjBJR1/GaE0igk9GQCDxa0NSCh5Dg==';
        var hostKeyType = 'dsa';
        var port = 22;
        var directory = '/Exceptions';

        //create search tasks
        var myTask = task.create({
            taskType: task.TaskType.SEARCH
            });
        myTask.savedSearchId = 2544;
        myTask.filePath = '/scriptuse/exceptions.csv'; 
        var myTaskId = myTask.submit();
        
        var myFileToUpload = file.load({
            id: 7465084
        });
        log.audit({title:"Task submitted.",
                   details:"Put results of savedSearchId:2544 in csv file InternalID:7465084" + myTaskId});
        
        log.debug({title:"File",
                   details:JSON.stringify(myFileToUpload)});
        
        var myTask2 = task.create({
            taskType: task.TaskType.SEARCH
            });
        myTask2.savedSearchId = 2831;
        myTask2.filePath = '/scriptuse/cleared_exceptions.csv'; 
        var myTaskId2 = myTask2.submit();
        var myFileToUpload2 = file.load({
            id: 7491749
        });
        log.audit({title:"Task submitted.",
                   details:"Put results of savedSearchId:2831 in csv file InternalID:7491749" + myTaskId2});

        log.debug({title:"File",
                   details:JSON.stringify(myFileToUpload2)});
                   
        var sftpConnection = getSFTPConnection(username, passwordGuid, url, hostKey, hostKeyType, port, directory);
        var uploadFile = sftpConnection.upload({
            filename: 'exceptions.csv',
            file: myFileToUpload,
            replaceExisting: true
        });
        var uploadFile2 = sftpConnection.upload({
            filename: 'cleared_exceptions.csv',
            file: myFileToUpload2,
            replaceExisting: true
        });
      }
   
   function getSFTPConnection(username, passwordGuid, url, hostKey, hostKeyType, port, directory){
    var preConnectionObj = {};
    preConnectionObj.passwordGuid = passwordGuid;
    preConnectionObj.url = url;
    preConnectionObj.hostKey = hostKey;
    if(username){ preConnectionObj.username = username; }
    if(hostKeyType){ preConnectionObj.hostKeyType = hostKeyType; }
    if(port){ preConnectionObj.port = Number(port); }
    if(directory){ preConnectionObj.directory = directory; }
    
    var connectionObj = sftp.createConnection(preConnectionObj);
    return connectionObj;
}

    return {
        execute: execute
    };

    /*var downloadedFile = connection.download({
        directory: 'relative/path/to/file',
        filename: 'downloadMe.js'
    });*/
 });