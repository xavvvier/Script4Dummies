
angular.module('scriptApp', [])
.controller('scriptCtrl', function($scope){

    var editor = ace.edit("sqlEditor");

    $scope.script = {
        Name: '',
        Description: '',
        parameters: [
            {id: 'initDate', name:'Initial Date'},
            {id: 'endDate', name:'End Date'}
        ]
    };

    $scope.addParameter = function(){
        model.parameters.push({});
    };

    $scope.read = function () {
        var targetElement = document.getElementById('targetElement');
        loadScript(targetElement, $scope.script);
    };

    $scope.init = function() {
        editor.setTheme("ace/theme/solarized_dark");
        editor.getSession().setMode("ace/mode/sqlserver");
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

