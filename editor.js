
angular.module('scriptApp', [])
.controller('scriptCtrl', function($scope){

    var editor = ace.edit("sqlEditor");
    //var editorParameter = ace.edit("sqlEditorParameter");

    $scope.parameterTypes = ['constant', 'sql', 'search'];
    $scope.types = ['Date', 'DateTime', 'Text', 'User', 'Number', 'TimeZone'];

    $scope.script = {
        Name: '',
        Description: '',
        Category: '',
        parameters: [
            {id: 'initDate', name:'Initial Date', parameterType: 'constant', type: 'User', precision: '', required: true},
            {id: 'endDate', name:'End Date', parameterType: 'constant', type: 'Number', option: [
                {text: '1'}, {text: '2'}
            ]}
        ]
    };

    $scope.addParameter = function(){
        $scope.script.parameters.push({});
    };

    $scope.addOption = function (parameter) {
        if (parameter.option == null)
            parameter.option = [];
        parameter.option.push({});
        console.log(parameter.option)
    }

    $scope.read = function () {
        var targetElement = document.getElementById('targetElement');
        loadScript(targetElement, $scope.script);
    };

    $scope.init = function() {
        editor.setTheme("ace/theme/solarized_dark");
        editor.getSession().setMode("ace/mode/sqlserver");
        //editorParameter.setTheme("ace/theme/solarized_dark");
        //editorParameter.getSession().setMode("ace/mode/sqlserver");
        //$scope.read();
    }

    $scope.init();

    function loadScript(element, script){
        var scriptDefinition = targetElement.value;
        var parser = new DOMParser();
        var xmlScript = parser.parseFromString(scriptDefinition, "text/xml");
        var scriptNode = xmlScript.firstChild;

        //Script Basic Properties
        script.Name = nodeText(scriptNode.getElementsByTagName('name')[0]);
        script.Description = nodeText(scriptNode.getElementsByTagName('description')[0]);
        script.Category = nodeText(scriptNode.getElementsByTagName('category')[0]);

        //Script parameters
        var inputNode = xmlScript.getElementsByTagName('input')[0];
        var parameterNodes = inputNode.children;
        for (var i = 0, len = parameterNodes.length; i < len; i++) {
            var parameterNode = parameterNodes[i];
            console.log(parameterNode.nodeName);
        }
        var actionNode = scriptNode.getElementsByTagName('action')[0];
        var sqlScript = actionNode.firstChild.wholeText;
        editor.setValue(sqlScript);
        editor.gotoLine(1);
    }

    function nodeText(node){
        return node.firstChild.nodeValue;
    }
});

