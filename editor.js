
angular.module('scriptApp', [])
.controller('scriptCtrl', function($scope){

    var editor = ace.edit("sqlEditor");

    $scope.parameterTypes = ['constant', 'sql', 'search', 'field', 'object'];
    $scope.dataTypes = ['Date', 'DateTime', 'number', 'name', 'text'];

    $scope.script = {
        Name: '',
        Description: '',
        Category: '',
        parameters: [
            {id: 'initDate', name:'Initial Date', parameterType: 'constant' },
            {id: 'endDate', name:'End Date', parameterType: 'constant'}
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
        $scope.read();
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
        var parameters = [];
        for (var i = 0, len = parameterNodes.length; i < len; i++) {
            var parameterNode = parameterNodes[i];
            parameters.push(readParameter(parameterNode));
        }
        script.parameters = parameters;
        var actionNode = scriptNode.getElementsByTagName('action')[0];
        var sqlScript = actionNode.firstChild.wholeText;
        console.log(script);
        editor.setValue(sqlScript);
        editor.gotoLine(1);
    }

    function readParameter(node){
        var parameter = {
            parameterType: node.nodeName,
            id: node.id,
            name: node.getAttribute('name'),
        };
        switch(node.nodeName){
            case 'constant':
                parameter.required = node.getAttribute('required');
                parameter.dataType = node.getAttribute('type');
                parameter.option = readOption(node);
                break;
            case 'sql':
                parameter.sql = nodeText(node);
                break;
            case 'field':
                parameter.filters = readFilters(node);
                break;
            case 'object':
                parameter.required = node.getAttribute('required');
                parameter.typeartifactid = node.getAttribute('typeartifactid');
                parameter.rdoviewartifactid = node.getAttribute('rdoviewartifactid');
                parameter.displaytype = node.getAttribute('displaytype');
                parameter.typeartifactguid = node.getAttribute('typeartifactguid');
                parameter.rdoviewartifactguid = node.getAttribute('rdoviewartifactguid');
                break;
        }
        return parameter;
    }

    function readFilters(node){
        var categories= [];
        var types= [];
        var filtersNode = node.firstElementChild;
        for (var i = 0, len = filtersNode.children.length; i < len; i++) {
            var child = filtersNode.children[i];
            switch (child.nodeName) {
                case 'type':
                    types.push(nodeText(child));
                    break;
                case 'category':
                    categories.push(nodeText(child));
                    break;
            }
        }
        return {
            categories: categories,
            types: types
        };
    }

    function readOption(node){
        if(node.children){
            var values = [];
            for (var i = 0, len = node.children.length; i < len; i++) {
                var child = node.children[i];
                values.push(nodeText(child));
            }
            return values;
        }
        return null;
    }

    function nodeText(node){
        return node.firstChild.nodeValue;
    }
});

