
angular.module('scriptApp', [])
.controller('scriptCtrl', function(){
    var model = this;
    model.Name = '';
    model.Description = '';

    model.parameters = [
        {id: 'initDate', name:'Initial Date'},
        {id: 'endDate', name:'End Date'}
    ];

    model.addParameter = function(){
        model.parameters.push({});
    };

    init(); 
});

function init(){
    var editor = ace.edit("sqlEditor");
    editor.setTheme("ace/theme/solarized_dark");
    editor.getSession().setMode("ace/mode/sqlserver");


    var sqlScript = "CREATE PROCEDURE dbo.Test2 \n " +
" \n " +
"    CREATE TABLE #t(x INT PRIMARY KEY) \n " +
"    INSERT INTO #t VALUES (2 \n " +
"    SELECT Test2Col = x FROM # \n " +
        " \n " +
"CREATE PROCEDURE dbo.Tes \n " +
" \n " +
"    CREATE TABLE #t(x INT PRIMARY KEY) \n " +
"    INSERT INTO #t VALUES (1 \n " +
"    SELECT Test1Col = x FROM # \n " +
"EXEC Test2 \n " +
" \n " +
"CREATE TABLE #t(x INT PRIMARY KEY) \n " +
"INSERT INTO #t VALUES (99) \n " +
"EXEC Test1 \n " +
"GO";

    editor.setValue(sqlScript);
    editor.gotoLine(1);

}
