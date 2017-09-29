
angular.module('scriptApp', [])
.controller('scriptCtrl', function($scope){

    var editor = ace.edit("sqlEditor");
    var parameterEditor = ace.edit("sqlParameterEditor");
    //var editorParameter = ace.edit("sqlEditorParameter");

    $scope.parameterTypes = ['constant', 'sql', 'field', 'search', 'searchprovider', 'object'];
    $scope.types = ['date', 'datetime', 'text', 'user', 'number', 'timezone'];
    $scope.returns = ['status', 'table'];
    $scope.displayTypes = ['report', 'table'];
    $scope.aclTypes = ['view', 'edit', 'delete'];
    $scope.fieldFiltersType = [
        "Fixed-Length Text",
        "Whole Number",
        "Date",
        "Yes/No",
        "Long Text",
        "Single-Choice List",
        "Decimal",
        "Currency",
        "Multiple-Choice List",
        "File <not in use in Relativity>",
         "Object <not in use in Relativity>",
         "User",
         "LayoutText <do not use>",
         "Objects"
    ];
    $scope.fieldFiltersCategory = [
        "Generic",
        "FullText",
        "Identifier",
        "Associative",
        "Comments",
        "Relational",
        "ProductionMarker",
        "AutoCreate",
        "<not in use>",
        "FolderName",
        "FileInfo",
        "ParentArtifact",
        "MarkupSetMarker",
        "GenericSystem",
        "MultiReflected",
        "Batch"
    ];

    $scope.openModal = false;
    $scope.editingParameter = null;

    $scope.script = {
        action: {
            returns: 'table',
            timeout: 12345,
            displaywarning: false,
            allowhtmltagsinoutput: true,
            name: 'test'
        },
        Name: '',
        Description: '',
        Category: '',
        version: '',
        key: '',
        parameters: [
            // {id: 'initDate', name:'Initial Date', parameterType: 'field', dataType: 'user', precision: '', required: true,
            // filters: {category: [
            //     {text: '4'}, {text: '2'}
            // ], type: [{text: '6'}, {text: '4'}]}},
            // {id: 'endDate', name:'End Date', parameterType: 'constant', dataType: 'number', option: [
            //     {text: '1'}, {text: '2'}
            // ], rdoviewartifactid: 123},
            // {id:'test3', name: 'Test3', parameterType: 'fields', filters: {
            //     category: [
            //         {text: 3},
            //         {text: 0}
            //     ],
            //     type: [
            //         {text: 6},
            //     ]
            // }}
        ],
        action: { },
        security: { },
        display: { }
    };

    $scope.closeModal = function (){
        $scope.openModal=false;
        $scope.editingParameter.sql = parameterEditor.getValue();
    };

    $scope.openModalFor = function (parameter){
        $scope.editingParameter = parameter;
        parameterEditor.setValue(parameter.sql || '');
        parameterEditor.gotoLine(1);
        $scope.openModal =true;
    };

    $scope.addParameter = function(){
        $scope.script.parameters.push({open: true});
    };

    $scope.addOption = function (parameter) {
        if (parameter.option == null)
            parameter.option = [];
        parameter.option.push({});
    }

    $scope.addFilter = function (parameter, category) {
        if(parameter.filters == null)
            parameter.filters = {};

        filters = parameter.filters;

        if(category) {
            if(filters.category == null)
                filters.category = [];
            filters.category.push({});
        } else {
            if(filters.type == null)
                filters.type = [];
            filters.type.push({});
        }
    }

    $scope.addAcl = function (parameter) {
        $scope.script.security.acl.push({});
    }

    $scope.read = function () {
		var targetElement = window.top.document.getElementsByClassName('script-body')[0];
        loadScript(targetElement, $scope.script);
    };

    $scope.write = function() {
        var script = createXml($scope.script);
        return script;
    };

    $scope.init = function() {
        editor.setTheme('ace/theme/sqlserver');
        editor.getSession().setMode("ace/mode/sqlserver");
        editor.getSession().on('change', function(e) {
            console.log(e);
        });
        parameterEditor.setTheme('ace/theme/sqlserver');
        parameterEditor.getSession().setMode("ace/mode/sqlserver");
        $scope.read();
    }

    $scope.init();

    function createXml(script){
        var xw = new XMLWriter('UTF-8');
        xw.formatting = 'indented';//add indentation and newlines
        xw.indentChar = ' ';//indent with spaces
        xw.indentation = 2;//add 2 spaces per level
        xw.writeStartDocument();
        xw.writeStartElement( 'script' );
        xw.writeComment('Created with Script4Dummies');
        if(script.Name){
            xw.writeElementString('name', script.Name);
        }
        if(script.Description){
            xw.writeElementString('description', script.Description);
        }
        if(script.Category){
            xw.writeElementString('category', script.Category);
        }
        if(script.key){
            xw.writeElementString('key', script.key);
        }
        if(script.version){
            xw.writeElementString('version', script.version);
        }
        xw.writeStartElement('input');
        for (var i = 0, len = script.parameters.length; i < len; i++) {
            var parameter = script.parameters[i];
            writeParameter(xw, parameter);
        }
        xw.writeEndElement();//input
        xw.writeStartElement('display');
        writeAttrIfNotNull(xw, 'type', script.display.type);
        if(script.display.settings && script.display.settings.reporttitle){
            xw.writeStartElement('settings');
            xw.writeAttributeString('reporttitle', script.display.settings.reporttitle);
            xw.writeEndElement();//settings
        }
        writeSecurity(xw, script.security);
        xw.writeEndElement();//display
        xw.writeStartElement('action');
        xw.writeAttributeString('returns', script.action.returns);
        writeAttrIfNotNull(xw, 'timeout', script.action.timeout);
        writeAttrIfNotNull(xw, 'displaywarning', script.action.displaywarning);
        writeAttrIfNotNull(xw, 'allowhtmltagsinoutput', script.action.allowhtmltagsinoutput);
        writeAttrIfNotNull(xw, 'name', script.action.name);
        xw.writeCDATA(editor.getValue());
        xw.writeEndElement(); //action
        xw.writeEndElement(); //script
        xw.writeEndDocument();
        var xml = xw.flush(); //generate the xml string
        return xml.replace('<?xml version="1.0" encoding="UTF-8" ?>', '');
    }

    function writeSecurity(xw, security){
        if(security && security.acl && security.acl.length){
            xw.writeStartElement('security');
            var acls = security.acl;
            for (var i = 0, len = acls.length; i < len; i++) {
                var acl = acls[i];
                xw.writeStartElement('acl');
                writeAttrIfNotNull(xw, 'id', acl.id);
                writeAttrIfNotNull(xw, 'typeartifactid', acl.typeartifactid);
                writeAttrIfNotNull(xw, 'typeartifactguid', acl.typeartifactguid);
                writeAttrIfNotNull(xw, 'type', acl.type);
                xw.writeEndElement();//acl
            }
            xw.writeEndElement();//security
        }
    }

    function writeAttrIfNotNull(xw, name, value) {
        if(value!=null){
            xw.writeAttributeString(name, value);
        }
    };
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
                    xw.writeElementString('type', types[i].text);
                }
                var categories = parameter.filters.categories;
                for (var i = 0, len = categories.length; i < len; i++) {
                    xw.writeElementString('category', categories[i].text);
                }
                xw.writeEndElement();//filters
                break;
            case 'object':
                if(parameter.required!=null){
                    xw.writeAttributeString('required', String(parameter.required));
                }
                writeAttrIfNotNull(xw, 'typeartifactid', parameter.typeartifactid);
                writeAttrIfNotNull(xw, 'rdoviewartifactid', parameter.rdoviewartifactid);
                writeAttrIfNotNull(xw, 'displaytype', parameter.displaytype);
                writeAttrIfNotNull(xw, 'typeartifactguid', parameter.typeartifactguid);
                writeAttrIfNotNull(xw, 'rdoviewartifactguid', parameter.rdoviewartifactguid);
                break;
        }
        xw.writeEndElement();
    }

    function loadScript(element, script){
        var scriptDefinition = element.value;
        var parser = new DOMParser();
        var xmlScript = parser.parseFromString(scriptDefinition, "text/xml");
        var scriptNode = xmlScript.firstChild;
        //Script Basic Properties
        script.Name = nodeText(scriptNode.getElementsByTagName('name')[0]);
        script.Description = nodeText(scriptNode.getElementsByTagName('description')[0]);
        script.Category = nodeText(scriptNode.getElementsByTagName('category')[0]);
        script.key = nodeText(scriptNode.getElementsByTagName('key')[0]);
        script.version = nodeText(scriptNode.getElementsByTagName('version')[0]);
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
        readAction(actionNode, script.action);
        editor.setValue(sqlScript);
        editor.gotoLine(1);
        var securityNode = scriptNode.getElementsByTagName('security')[0];
        readSecurity(securityNode, script.security);
        var displayNode = scriptNode.getElementsByTagName('display')[0];
        readDisplay(displayNode, script.display);
    }

    function readAction(actionNode, action){
        action.returns = actionNode.getAttribute('returns');
        action.timeout = actionNode.getAttribute('timeout');
        action.displaywarning = actionNode.getAttribute('displaywarning');
        action.allowhtmltagsinoutput = actionNode.getAttribute('allowhtmltagsinoutput');
        action.name = actionNode.getAttribute('name');
    }

    function readSecurity(securityNode, security){
        security.acl = [];
        if(securityNode){
            for (var i = 0, len = securityNode.children.length; i < len; i++) {
                var child = securityNode.children[i];
                security.acl.push({
                    id: child.getAttribute('id'),
                    typeartifactid: child.getAttribute('typeartifactid'),
                    typeartifactguid: child.getAttribute('typeartifactguid'),
                    type: child.getAttribute('type'),
                });
            }
        }
    }
    function readDisplay(displayNode, display){
        if(displayNode){
            display.type = displayNode.getAttribute('type'); 
            var settings = displayNode.firstElementChild;
            display.settings = null;
            if(settings){
                display.settings = {};
                display.settings.reporttitle = settings.getAttribute('reporttitle');
            }
        }
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
                    types.push({text: nodeText(child)});
                    break;
                case 'category':
                    categories.push({text: nodeText(child)});
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
        if(node && node.firstChild){
            return node.firstChild.nodeValue;
        }
        return null;
    }
});


function xmlScript(){
	var s = angular.element(document.body).scope();
	return s.write();
}
  
