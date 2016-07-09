var app=angular.module('single-page-app',['ngRoute', 'ui.bootstrap','datatables'])

function RerenderDefaultRendererCtrl(DTOptionsBuilder, DTColumnDefBuilder) {
    var vm = this;
    vm.dtOptions = DTOptionsBuilder.newOptions();
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1).notVisible(),
        DTColumnDefBuilder.newColumnDef(2).notSortable()
    ];
    vm.dtInstance = {};
}
app.directive('compileTemplate', function($compile, $parse){
    return {
        link: function(scope, element, attr){
            var parsed = $parse(attr.ngBindHtml);
            function getStringValue() { return (parsed(scope) || '').toString(); }

            //Recompile if the template changes
            scope.$watch(getStringValue, function() {
                $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
            });
        }         
    }
});
app.filter('toRange', function(){
  return function(input) {
    var lowBound, highBound;
    if (input.length == 1) {       
      lowBound = 0;
      highBound = +input[0] - 1;      
    } else if (input.length == 2) {      
      lowBound = +input[0];
      highBound = +input[1];
    }
    var i = lowBound;
    var result = [];
    while (i <= highBound) {
      result.push(i);
      i++;
    }
    return result;
  }
});
app.config(function($routeProvider){


      $routeProvider
          .when('/',{
                templateUrl: 'home.html',
                controller: 'datasetOverviewController'
          })
          .when('/datasets/:datasetId/',{
                templateUrl: 'tableOverview.html',
    			controller: 'tableOverviewController'
          })
          .when('/tables/:tableId',{
                templateUrl: 'tableDetail.html',
    			controller: 'tableDetailController'
          })
          .when('/tables/:tableId/createField',{
                templateUrl: 'createField.html',
    			controller: 'createFieldController'
          })
          .when('/about',{
                templateUrl: 'about.html'
          });


});


app.factory('typeFactory', function() {
  var types = 
[{"id":"1","0":"1","title":"int","1":"int","syntax":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"int\"  %ngm%>","2":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"int\"  %ngm%>","info_text":"zB 1,2,3,4 usw.","3":"zB 1,2,3,4 usw."},{"id":"2","0":"2","title":"float","1":"float","syntax":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"float\"  %ngm%>","2":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"float\"  %ngm%>","info_text":"zb 7,5 oder 1,1415\r\n","3":"zb 7,5 oder 1,1415\r\n"},{"id":"3","0":"3","title":"text","1":"text","syntax":"<input type=\"text\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"text\" %ngm%>","2":"<input type=\"text\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"text\" %ngm%>","info_text":"","3":""},{"id":"4","0":"4","title":"id","1":"id","syntax":"","2":"","info_text":"","3":""},{"id":"5","0":"5","title":"date","1":"date","syntax":"","2":"","info_text":"","3":""},{"id":"6","0":"6","title":"file","1":"file","syntax":"","2":"","info_text":"","3":""},{"id":"7","0":"7","title":"image","1":"image","syntax":"","2":"","info_text":"jpgeg\/png\/gif","3":"jpgeg\/png\/gif"},{"id":"8","0":"8","title":"int","1":"int","syntax":"","2":"","info_text":"","3":""}];

  var factory = {
  	 all:function(){
  	 	return types;
  	 },
  	 getById:function(id){
  	 	var result = [];
		angular.forEach(types, function(value, key) {
		  if(value.id == id){
		  	result = value;
		  }
		});
		return result;
  	 }
  };
  return factory;
});
app.factory('userFactory', function() {
  var users = [{"id":"1","username":"niczem", "name":"nic", "surname":"zemke"}];

  var factory = {
  	 all:function(){
  	 	return users;
  	 },
  	 currentUserId:function(id){
  	 	return 1;
  	 },
  	 getById:function(id){
  	 	var result = [];
		angular.forEach(users, function(value, key) {
		  if(value.id == id){
		  	result = value;
		  }
		});
		return result;
  	 }

  };
  return factory;
});
app.factory('datasetFactory', function() {
  var datasets = [{id:1, title:'sw-volunteers'}
  ]
  var factory = {
  	 all:function(){
  	 	return datasets;
  	 },
  	 getById:function(id){
  	 	var result = [];
		angular.forEach(datasets, function(value, key) {
		  if(value.id == id){
		  	result = value;
		  }
		});
		return result;
  	 }
  };
  return factory;
});




app.controller('cfgController',function($scope, $controller,datasetFactory,userFactory){
	$controller('tableController',{$scope:$scope});
	$scope.datasets = datasetFactory.all();
    $scope.message="Hello world";
    $scope.currentUser = userFactory.getById(userFactory.currentUserId());

});
app.controller('tableMenuController',function($scope){

      $scope.message="Hello world";

});
app.controller('tableController',function($scope,$compile, $sce, $http, typeFactory){

	  $scope.loadTables = function(){
		$http.post('api.php?action=tables/get', {dataset_id:1}, {
        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        	transformRequest: transform
    	}).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    $scope.tables = response.data;
		    //$location.path('tables/'+$scope.field.table_id);
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
	  };
	  $scope.loadTables();

	  $scope.renderHtml = function(html_code)
	  {
		    return $sce.trustAsHtml(html_code);
	  };
	  $scope.numberOfFields = function(table_id){
	  	var tableData = $scope.getTableData(table_id);
	  	if(tableData.fields)
	  	return tableData.fields.length+1;
	  }
	  $scope.getNextAutoIndex = function(field_id, table_id){
	  	var fieldData = $scope.getFieldData(field_id, table_id);
	  	var tableData = $scope.getTableData(fieldData.table_id);
	  	var result = 0;
		angular.forEach(tableData.field_values, function(value, key) {
		  if(value.field_id == field_id && parseInt(value.value)>result){
		  	result = parseInt(value.value);
		  }
		});
		return result+1;
	  }
	  $scope.numberOfRows = function(table_id){
	  	var tableData = $scope.getTableData(table_id);
	  	var no_of_rows = 0;
		angular.forEach(tableData.field_values, function(value, key) {
		  if(parseInt(value.row)>no_of_rows){
		  	no_of_rows = parseInt(value.row);
		  }
		});
		return no_of_rows;
	  }
	  $scope.generateFieldInput = function(field_index, table_id, value, options){
	  	if(!value){
	  		value = '';
	  	}


	  	var field_id = $scope.fieldIndexToFieldId(field_index, table_id);
	  	var fieldData = $scope.getFieldData(field_id, table_id);

	  	var result;
	  	if(!fieldData)
	  		return '';

	  	var ngm = 'ng-model="fields['+field_id+']"';

	  	if(options&&options.field_class)
	  		ngm = ngm+' class="'+options.field_class+'"';

	  	var typeObject = typeFactory.getById(parseInt(fieldData.type));
	  	var syntax = typeObject.syntax;
	  	syntax=syntax.replace('%field_id%', 'field_id');
	  	syntax=syntax.replace('%field_value%', value);
	  	syntax=syntax.replace('%ngm%', ngm);
	  	switch(parseInt(fieldData.type)){

	  		default:
	  			result = '<input type="text" name="field_id" id="field_id" '+ngm+' value="'+value+'">';
	  		break;

	  		/*case 1:
	  		break;
	  		case 2:
	  		break;
	  		case 3:
	  		break;*/
	  		case 4:
	  			result = '<input type="text" name="field_id" value="'+value+'" ng-init="fields['+field_id+']='+$scope.getNextAutoIndex(field_id, table_id)+'" id="field_id" '+ngm+' disabled>';
	  		break;
	  	}
	  	return syntax;
	  }
	  $scope.fieldIndexToFieldId = function(field_index, table_id){
	  	var tabledata = $scope.getTableData(table_id);
	  	var i = 1;
	  	var result = field_index;

	  	if(tabledata.fields)
		angular.forEach(tabledata.fields, function(value, key) {
		  if(i === field_index){
		  	result = value.id;
		  }
		  i++;
		});
	  	return result;
	  }
	  $scope.getFieldData = function(field_id, table_id){
	  	var tables = [];
	  	if(table_id)
	  		tables.push($scope.getTableData(table_id));
	  	else
	  		tables = $scope.tables;

	  	var result;
		angular.forEach(tables, function(value, key) {
		  if(value.id == table_id){
			angular.forEach(value['fields'], function(nvalue, nkey) {
				if(nvalue.id == field_id)
					result = nvalue;
			});
		  }
		});
		return result;
	  };
	  $scope.updateField = function(table_id, field_index, row, cb){
	  	var field_id = $scope.fieldIndexToFieldId(field_index);
	  	var value = $('#field_'+table_id+'_'+field_index+'_'+row+' input').val();

			$http.post('api.php?action=updateField', {table_id:table_id,field_id:field_id, row:row, value:value}, {
	        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
	        	transformRequest: transform
	    	}).then(function successCallback(response) {
			    // this callback will be called asynchronously
			    // when the response is available

			    cb(value);


			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
	  
	  };
	  $scope.removeRow = function(table_id, field_index, row, force){

		if (confirm("Are you sure to delete this row?")) {
		    
		} else {
		   
		}
	  };
	  $scope.loadInlineEditor = function(table_id, field_index, row, force){
	  	var new_html = $scope.generateFieldInput(parseInt(field_index), parseInt(table_id), $('#field_'+table_id+'_'+field_index+'_'+row).attr('data-value'),{field_class:'form-control'});
	  	new_html = '<div class="input-group"> '+new_html+' <span class="input-group-btn"> <button class="btn btn-default submit-field" data-table="'+table_id+'" data-field-index="'+field_index+'" data-row="'+row+'" type="button">Save</button> </span> </div>';
	  	

	  	if(!$('#field_'+table_id+'_'+field_index+'_'+row+'>.input-group').length||force){

		  	$('td>.input-group').each(function(){
		  		var val = $(this).find('input').val();
		  		$(this).parent().html('<span>'+val+'<span>'+$scope.generateHistoryButton(table_id, field_index, row));
		  	});
	  		$('#field_'+table_id+'_'+field_index+'_'+row).html(new_html);

	  		$('.submit-field').click(function(){
	  			var $submitField = $(this);
	  			var table_id = $submitField.attr('data-table');
	  			var field_index = $submitField.attr('data-field-index');
	  			var row = $submitField.attr('data-row');
	  			$scope.updateField(table_id,field_index,row,function(value){
	  				var $span = $('<span></span>');
	  				$span.html(value);
	  				$span.click(function(){
	  					$scope.loadInlineEditor(table_id, field_index, row,true);
	  				});
	  				$submitField.parent().parent().parent().html($span).append($scope.generateHistoryButton(table_id, field_index, row));
	  				//$scope.$apply();
	  			});
	  		});
	  	}
	  };
	  $scope.getFieldValueArray = function(table_id, field_index, row){
	  	var tableData = $scope.getTableData(table_id);
	  	var field_id = $scope.fieldIndexToFieldId(field_index,table_id);
	  	var result = [];
		angular.forEach(tableData.field_values, function(value, key) {
		  if(value.field_id == field_id && value.row == row){
		  	result.push(value);
		  }
		});
		return result;
	  };
	  $scope.getFieldValue = function(table_id, field_index, row){
	  	var fieldValueArray = $scope.getFieldValueArray(table_id, field_index, row);
	  	/*var tableData = $scope.getTableData(table_id);
	  	var result = 1337;
		angular.forEach(tableData.field_values, function(value, key) {
		  if(value.field_id == field_index && value.row == row){
		  	result = value.value;
		  }
		});*/
		if(fieldValueArray[0])
		return fieldValueArray[0].value;
	  };
	  $scope.generateHistoryButton = function(table_id, field_index, row){

		var fieldValueArray = $scope.getFieldValueArray(table_id, field_index, row);
		if(fieldValueArray.length>1){
	  	var html = '<div class="dropdown pull-right historyButton">';
			html += '<button class="btn btn-primary btn-sm dropdown-toggle" type="button" data-toggle="dropdown">';
			html += '		  <i class="fa fa-history" aria-hidden="true"></i>';
			html += '		  <span class="caret"></span></button>';
			html += '		  <ul class="dropdown-menu">';


			angular.forEach(fieldValueArray, function(value, key) {
			html += '		    <li><a href="#"><i>'+timeAgo(value.timestamp)+' ago</i> - '+value.value+'</a></li>';
			});
			html += '		  </ul>';
			html += '		</div>';


	  	return html;
	  	}
	  	return '';
	  };
	  $scope.getTableData = function(id){
	  	var result = {};
		angular.forEach($scope.tables, function(value, key) {
			

		  if(value.id == id){
		  	result = value;
		  }
		});
		return result;
	  };
      $scope.message="Hello mthrfckr";

});	
app.controller('datasetOverviewController',function($scope, $controller, datasetFactory){

	$scope.datasets = datasetFactory.all();

});
app.controller('createDatasetController',function($scope, $controller, $route, $http,$location){
	
  	$scope.addDatasetFormOpen = false;
});
app.controller('createTableController',function($scope, $controller, $route, $http,$location){

  	$controller('tableOverviewController', {$scope: $scope});
  	$scope.dataset_id = $route.current.params.datasetId;
  	$scope.table = {};
  	$scope.table.dataset_id = $scope.dataset_id;
  	$scope.addTableFormOpen = false;
  	$scope.createTable = function(){
  		$http.post('api.php?action=tables/create', $scope.table, {
        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        	transformRequest: transform
    	}).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    $location.path('datasets/'+$scope.dataset_id);
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
  	};

});
app.controller('tableOverviewController',function($scope, $controller){


  	$controller('tableController', {$scope: $scope});

});
app.controller('tableDetailController',function($scope, $controller, $route, $http,$timeout,DTOptionsBuilder){
   	
  	$controller('tableController', {$scope: $scope});

  	//$scope.table_id = $state.params.tableId;
  	$scope.tableId = $route.current.params.tableId;
    $timeout(function() {
  		$scope.tableData = $scope.getTableData($scope.tableId);
  		$scope.title = $scope.tableData.title;
    }, 1000);
  	$scope.no_of_rows = $scope.numberOfRows($scope.tableId);

  	//$controller('tableDetailController', {$scope: $scope});
	$scope.fields = {};
	$scope.createRow =function (){

		var request = {};
		request.table_id = $scope.tableId;
		request.fields = $scope.fields;


		$http.post('api.php?action=createRow', request, {
        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        	transformRequest: transform
    	}).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    $scope.loadTables();
		    //$location.path('tables/'+$scope.field.table_id);
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});


	};

});
app.controller('createFieldController',function($scope, $controller, $http, $route, $location){
	$scope.field = {};
	$scope.field.table_id = $route.current.params.tableId;
	$scope.fieldTypes = typeFactory.all();

	$scope.createField = function(){

		$http.post('api.php?action=createField', $scope.field, {
        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        	transformRequest: transform
    	}).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    $location.path('tables/'+$scope.field.table_id);
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
	};
});


	    var transform = function(data){
	        return $.param(data);
	    }
function timeAgo(time){
  var units = [
    { name: "second", limit: 60, in_seconds: 1 },
    { name: "minute", limit: 3600, in_seconds: 60 },
    { name: "hour", limit: 86400, in_seconds: 3600  },
    { name: "day", limit: 604800, in_seconds: 86400 },
    { name: "week", limit: 2629743, in_seconds: 604800  },
    { name: "month", limit: 31556926, in_seconds: 2629743 },
    { name: "year", limit: null, in_seconds: 31556926 }
  ];
  var diff = (new Date() - new Date(time*1000)) / 1000;
  if (diff < 5) return "now";
  
  var i = 0, unit;
  while (unit = units[i++]) {
    if (diff < unit.limit || !unit.limit){
      var diff =  Math.floor(diff / unit.in_seconds);
      return diff + " " + unit.name + (diff>1 ? "s" : "");
    }
  };
}
