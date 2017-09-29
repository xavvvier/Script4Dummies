
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
        ],
        action: {
            timeout: '',
            returns: '',
            displaywarning: '',
            allowhtmltagsinoutput: '',
            name: ''
        }
    };

    $scope.addParameter = function(){
        model.parameters.push({});
    };

    $scope.read = function () {
        var targetElement = document.getElementById('targetElement');
        loadScript(targetElement, $scope.script);
    };

    $scope.write = function() {
        createXml($scope.script);
    };

    $scope.init = function() {
        editor.setTheme("ace/theme/solarized_dark");
        editor.getSession().setMode("ace/mode/sqlserver");
        $scope.write();
    }

    $scope.init(); 

    function createXml(script){
        var xw = new XMLWriter('UTF-8');
        xw.formatting = 'indented';//add indentation and newlines
        xw.indentChar = ' ';//indent with spaces
        xw.indentation = 2;//add 2 spaces per level

        xw.writeStartDocument( );
        xw.writeStartElement( 'script' );

        xw.writeComment('Create with Script4Dummies');
        xw.writeElementString('name', script.Name);
        xw.writeElementString('description', script.Description);
        xw.writeElementString('category', script.Category);
        xw.writeStartElement('input');
        for (var i = 0, len = script.parameters.length; i < len; i++) {
            var parameter = script.parameters[i];
            writeParameter(xw, parameter);
        }
        xw.writeEndElement();//input
        xw.writeEndElement(); //script
        xw.writeEndDocument();

        var xml = xw.flush(); //generate the xml string
        console.log(xml);
    }

    function writeParameter(xw, parameter){
        xw.writeStartElement(parameter.parameterType);
        xw.writeAttributeString('id', parameter.id);
        xw.writeAttributeString('name', parameter.name);
        switch(parameter.parameterType){
            case 'constant':
                xw.writeAttributeString('type', parameter.dataType);
                if(parameter.required!=null){
                    xw.writeAttributeString('required', String(parameter.required));
                }
                if(parameter.option && parameter.option.length>0){
                     for (var i = 0, len=parameter.option.length; i < len; i++) {
                         xw.writeElementString('option', parameter.option[i].text);
                     }
                }
                break;
            case 'sql':
                xw.writeCDATA(parameter.sql);
                break;
            case 'field':
                xw.writeStartElement('filters');
                var types = parameter.filters.types;
                for (var i = 0, len = types.length; i < len; i++) {
                    xw.writeElementString('type', types[i]);
                }
                var categories = parameter.filters.categories;
                for (var i = 0, len = categories.length; i < len; i++) {
                    xw.writeElementString('category', categories[i]);
                }
                xw.writeEndElement();//filters
                break;
            case 'object':
                if(parameter.required!=null){
                    xw.writeAttributeString('required', String(parameter.required));
                }
                var writeIfNotNull = function(name, value) {
                    if(value!=null){
                        xw.writeAttributeString(name, value);
                    }
                };
                writeIfNotNull('typeartifactid', parameter.typeartifactid);
                writeIfNotNull('rdoviewartifactid', parameter.rdoviewartifactid);
                writeIfNotNull('displaytype', parameter.displaytype);
                writeIfNotNull('typeartifactguid', parameter.typeartifactguid);
                writeIfNotNull('rdoviewartifactguid', parameter.rdoviewartifactguid);
                break;
        }
        xw.writeEndElement();
    }

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
                values.push({text: nodeText(child)});
            }
            return values;
        }
        return null;
    }

    function nodeText(node){
        return node.firstChild.nodeValue;
    }
});

