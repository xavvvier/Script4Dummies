
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

    var targetElement = document.getElementById('targetElement');
    var script = targetElement.value;
    var parser = new DOMParser();
    var xmlScript = parser.parseFromString(script, "text/xml");
    var actionNode = xmlScript.firstChild.getElementsByTagName('action')[0];
    var sqlScript = actionNode.firstChild.wholeText;
    editor.setValue(sqlScript);
    editor.gotoLine(1);

}
