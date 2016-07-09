var app=angular.module('single-page-app',['ngRoute', 'ui.bootstrap','datatables'])
/*
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('app', {
    url: '/',
    abstract: true,
    templateUrl: 'home.html'
  })

  .state('app.tableOverview', {
    url: '/tables',
    templateUrl: 'tableOverview.html',
    controller: 'tableOverviewController'
  })
  .state('app.tableDetail', {
    url: '/tables/:tableId',
    templateUrl: 'tableDetail.html',
    controller: 'tableDetailController'
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
})*/
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

app.controller('cfgController',function($scope){

      $scope.message="Hello world";

});
app.controller('tableController',function($scope, $sce, $http){
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

	  /*$scope.tables = [
	  					{
	  						"id":"1",
	  						"title":"volunteers",
	  						"fields":
	  								[
	  									{"id":"1","0":"1","table_id":"1","1":"1","type":"4","2":"4","title":"id","3":"id"},
	  									{"id":"2","0":"2","table_id":"1","1":"1","type":"3","2":"3","title":"name","3":"name"},
	  									{"id":"3","0":"3","table_id":"1","1":"1","type":"3","2":"3","title":"surname","3":"surname"}
	  								],
	  						"field_values":
	  								[
	  									{"field_id":"3","0":"3","row":"2","1":"2","value":"zemke","2":"zemke","timestamp":"1467317629","3":"1467317629"},
	  									{"field_id":"3","0":"3","row":"1","1":"1","value":"zemke","2":"zemke","timestamp":"1467317629","3":"1467317629"},
	  									{"field_id":"2","0":"2","row":"2","1":"2","value":"nic","2":"nic","timestamp":"1467317602","3":"1467317602"},
	  									{"field_id":"2","0":"2","row":"1","1":"1","value":"nic","2":"nic","timestamp":"1467317602","3":"1467317602"},
	  									{"field_id":"1","0":"1","row":"2","1":"2","value":"2","2":"1","timestamp":"1467317602","3":"1467317602"},
	  									{"field_id":"1","0":"1","row":"1","1":"1","value":"1","2":"1","timestamp":"1467317602","3":"1467317602"}
	  								]
	  					}
	  					];*/

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


	  	console.log('GENFIELD');
	  	console.log(fieldData);
	  	console.log('field_index'+field_index);
	  	console.log('field_id'+field_id);
	  	console.log('table_id'+table_id);

	  	var result;
	  	if(!fieldData)
	  		return '';

	  	var ngm = 'ng-model="fields['+field_id+']"';

	  	if(options&&options.field_class)
	  		ngm = ngm+' class="'+options.field_class+'"';

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
	  	console.log(result);
	  	return result;
	  }
	  $scope.fieldIndexToFieldId = function(field_index, table_id){
	  	console.log(table_id);
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
		console.log('res');
		console.log(result);
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
	  $scope.updateField = function(table_id, field_index, row){
	  	var field_id = $scope.fieldIndexToFieldId(field_index);
	  	var value = $('#field_'+table_id+'_'+field_index+'_'+row+' input').val();

			$http.post('api.php?action=updateField', {table_id:table_id,field_id:field_id, row:row, value:value}, {
	        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
	        	transformRequest: transform
	    	}).then(function successCallback(response) {
			    // this callback will be called asynchronously
			    // when the response is available

			    console.log(response);


			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
	  
	  };
	  $scope.loadInlineEditor = function(table_id, field_index, row){
	  	var new_html = $scope.generateFieldInput(parseInt(field_index), parseInt(table_id), $('#field_'+table_id+'_'+field_index+'_'+row).html(),{field_class:'form-control'});

	  	new_html = '<div class="input-group"> '+new_html+' <span class="input-group-btn"> <button class="btn btn-default submit-field" data-table="'+table_id+'" data-field-index="'+field_index+'" data-row="'+row+'" type="button">Save</button> </span> </div>';
	  	


	  	if(!$('#field_'+table_id+'_'+field_index+'_'+row+'>.input-group').length){

		  	$('td>.input-group').each(function(){
		  		var val = $(this).find('input').val();
		  		$(this).parent().html(val);
		  	});
	  		$('#field_'+table_id+'_'+field_index+'_'+row).html(new_html);
	  		$('.submit-field').click(function(){
	  			var table_id = $(this).attr('data-table');
	  			var field_index = $(this).attr('data-field-index');
	  			var row = $(this).attr('data-row');
	  			$scope.updateField(table_id,field_index,row);
	  		});
	  	}
	  };
	  $scope.getFieldValueArray = function(table_id, field_index, row){

	  	var tableData = $scope.getTableData(table_id);
	  	var result = [];
		angular.forEach(tableData.field_values, function(value, key) {
		  if(value.field_id == field_index && value.row == row){
		  	result.push(value.value);
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
		return fieldValueArray[0];
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
app.controller('datasetOverviewController',function($scope, $controller){

	$scope.datasets = [
						{id:1, title:'sw-volunteers'}
						];

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
