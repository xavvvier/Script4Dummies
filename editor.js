
angular.module('scriptApp', [])
    .controller('scriptCtrl', function ($scope) {

        $scope.Name = '';
        $scope.Description = '';

        $scope.parameterTypes = [
            'acl',
            'constant',
            'sql',
            'fields',
            'search'
        ];
        $scope.dataTypes = ['Date', 'DateTime', 'Text', 'User', 'Number'];
        $scope.typeartifactid = '';

        $scope.parameters = [
            // { parameterType: 'constant', id: 'initDate', name: 'Initial Date', dataType: 'Date' },
            // { parameterType: 'constant', id: 'endDate', name: 'End Date' },
            // { parameterType: 'constant', id: 'price', name: 'Product price', type: 'Number', precision: 2, scale: 10 },
            // { parameterType: 'sql', id: 'endDate', name: 'End Date', sql: 'select top 10 ArtifactID from Artifact' }
        ];

        $scope.addParameter = function () {
            $scope.parameters.push({});
        };

        $scope.clearParameters = function () {
            $scope.parameters = [];
        }

        init();
    });

function init() {
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