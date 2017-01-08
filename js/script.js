var app=angular.module('single-page-app',['ngRoute', 'ui.bootstrap','datatables'])
var dataset;

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
app.directive('compile',function($compile, $timeout){
    return{
        restrict:'A',
        link: function(scope,elem,attrs){
            $timeout(function(){                
                $compile(elem.contents())(scope);    
            });
        }        
    };
});
app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });
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
                templateUrl: 'templates/home.html',
                controller: 'datasetOverviewController'
          })
          .when('/datasets/:datasetId/',{
                templateUrl: 'templates/tableOverview.html',
    			controller: 'tableOverviewController'
          })
          .when('/datasets/:datasetId/import',{
                templateUrl: 'templates/import.html',
    			controller: 'importContoller'
          })
          .when('/tables/:tableId',{
                templateUrl: 'templates/tableDetail.html',
    			controller: 'tableDetailController'
          })
          .when('/tables/:tableId/delete',{
                templateUrl: 'templates/deleteTable.html',
    			controller: 'deleteTableController'
          })
          .when('/tables/:tableId/createField',{
                templateUrl: 'templates/createField.html',
    			controller: 'createFieldController'
          })
          .when('/tables/:tableId/createForm',{
                templateUrl: 'templates/createForm.html',
    			controller: 'createFormController'
          })
          .when('/tables/:tableId/forms/:formId',{
                templateUrl: 'templates/createForm.html',
    			controller: 'updateFormController'
          })
          .when('/about',{
                templateUrl: 'about.html'
          });


});


app.factory('typeFactory', function() {
  	var types = 
[{"id":"4","0":"4","title":"id","1":"id","syntax":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%next_auto_index%\" class=\"int\"  %ngm% disabled>","2":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%next_auto_index%\" class=\"int\"  %ngm% disabled>","info_text":"","3":"","order_id":"0","4":"0","active":"1","5":"1"},{"id":"1","0":"1","title":"int","1":"int","syntax":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"int\"  %ngm%>","2":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"int\"  %ngm%>","info_text":"zB 1,2,3,4 usw.","3":"zB 1,2,3,4 usw.","order_id":"1","4":"1","active":"1","5":"1"},{"id":"2","0":"2","title":"float","1":"float","syntax":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"float\"  %ngm%>","2":"<input type=\"number\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"float\"  %ngm%>","info_text":"zb 7,5 oder 1,1415\r\n","3":"zb 7,5 oder 1,1415\r\n","order_id":"2","4":"2","active":"1","5":"1"},{"id":"3","0":"3","title":"text","1":"text","syntax":"<input type=\"text\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"text\" %ngm%>","2":"<input type=\"text\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"text\" %ngm%>","info_text":"","3":"","order_id":"3","4":"3","active":"1","5":"1"},{"id":"5","0":"5","title":"date","1":"date","syntax":"<input type=\"datetime-local\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"datetime\" %ngm%>","2":"<input type=\"datetime-local\" name=\"%field_id%\" id=\"%field_id%\" value=\"%field_value%\" class=\"datetime\" %ngm%>","info_text":"","3":"","order_id":"5","4":"5","active":"1","5":"1"},{"id":"8","0":"8","title":"dropdown","1":"dropdown","syntax":"<select name=\"%field_id%\" id=\"%field_id%\" %ngm%>%dropdown_values%<\/select>","2":"<select name=\"%field_id%\" id=\"%field_id%\" %ngm%>%dropdown_values%<\/select>","info_text":"","3":"","order_id":"8","4":"8","active":"1","5":"1"}];

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

app.factory('tableDataFactory', function($http) {
  var data = {};
  var fieldValues = {};

  var factory = {
  	 init:function(cb){
		$http.post('api.php?action=tables/get', {dataset_id:dataset}, {
		        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		        	transformRequest: transform
		}).then(function successCallback(response) {
				    // this callback will be called asynchronously
				    // when the response is available
				    data.tables = response.data;
				    if(typeof cb === 'function')
				    	cb();
				    //$location.path('tables/'+$scope.field.table_id);
		}, function errorCallback(response) {
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.
		});
  	 },
  	 getTableData:function(id){
	  	var result = {};
		angular.forEach(data.tables, function(value, key) {
			

		  if(value.id == id){
		  	result = value;
		  }
		});
		return result;
	 },
	 fieldIdToFieldIndex:function(field_id, table_id){
	  	var tabledata = this.getTableData(table_id);
	  	var i = 1;
	  	var result = field_id;

	  	if(tabledata.fields)
		angular.forEach(tabledata.fields, function(value, key) {
		  if(value.id == field_id){
		  	result = i;
		  }
		  i++;
		});
	  	return parseInt(result);

	 },
	 fieldIndexToFieldId:function(field_index, table_id){
	  	var tabledata = this.getTableData(table_id);
	  	var i = 1;
	  	var result = field_index;

	  	if(tabledata.fields)
		angular.forEach(tabledata.fields, function(value, key) {
		  if(i == field_index){
		  	result = value.id;
		  }
		  i++;
		});
	  	return result;
	 },
	 rowExists:function(table_id,row_index){
	  	var tableData = this.getTableData(table_id);
	  	var result = false;
		angular.forEach(tableData.field_values, function(value, key) {
		  if(value.row == row_index){
		  	result = true;
		  }
		});
		return result;
	 },
	 getFieldValueArray:function(table_id, field_index, row, transformed_data){

	  	var tableData = this.getTableData(table_id);
	  	var field_id = this.fieldIndexToFieldId(field_index,table_id);
	  	var fieldData = this.getFieldData(field_id, table_id);
	  	var self = this;
	  	var result = [];

	  	//linked tables
	  	if(transformed_data == true && parseInt(fieldData.type) == 8){


			angular.forEach(tableData.field_values, function(value, key) {
			  if(value.field_id == field_id && value.row == row){
			  	var fieldData = self.getFieldData(field_id, table_id);


			  	if(typeof fieldData.additional == 'string')
			  		fieldData.additional = JSON.parse(fieldData.additional);


			  	var fieldValueArray = self.getFieldValueArray(table_id, field_index, row);

			  	var newArray = [];
				//loop through all values and replace them with "real value"
				angular.forEach(fieldValueArray, function(value, index) {
					//console.error(fieldData.additional);
								//loop through all linked fields and add value to result
								angular.forEach(fieldData.additional.dropdown_shown_values, function(nvalue) {
									if(!isNaN(nvalue)&&!isNaN(value.value)&&nvalue.length>0){
										var tempArray = self.getFieldValueArray(fieldData.additional.dropdown_table, self.fieldIdToFieldIndex(nvalue), value.value);
							  			newArray.push({timestamp:value.timestamp, value:tempArray[0].value});
									}
								});


				});
				result = newArray;
			  }
			});

	  	}else{
	  		
			angular.forEach(tableData.field_values, function(value, key) {
			  if(value.field_id == field_id && value.row == row){
			  	result.push(value);
			  }
			});
	  	}



		return result;
	 },
	 getTableOverview:function(){
	 	var result = [];
	 	angular.forEach(data.tables, function(value, key) {
		  result.push({id:value.id,title:value.title});
		});
		return result;
	 },
	 getFieldData:function(field_id, table_id){
	  	var tables = [];
	  	if(table_id)
	  		tables.push(this.getTableData(table_id));

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
	  },
	 getNextAutoIndex:function(field_id, table_id){
	  	var fieldData = this.getFieldData(field_id, table_id);
	  	var tableData = this.getTableData(fieldData.table_id);
	  	var result = 0;
		angular.forEach(tableData.field_values, function(value, key) {
		  if(value.field_id == field_id && parseInt(value.value)>result){
		  	result = parseInt(value.value);
		  }
		});
		return result+1;
	 },
  	 all:function(){
  	 	return data;
  	 },

  	 removeRow:function(table_id, row){


  	 	$http.post('api.php?action=rows/remove',{ 'table_id' : table_id, 'row_id': row }, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                        transformRequest: transform
                }).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    tableDataFactory.init();
		    //$location.path('tables/'+$scope.field.table_id);
		}, function errorCallback(response) {

		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
  	 },
         getFormData:function(row_id){
            var tableData = this.getTableData(row_id);
            var result;
            angular.forEach(tableData.forms, function(value, key) {
              if(value.field_id == row_id){
                    result = value
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
app.factory('datasetFactory', function($http) {
  var datasets = [{id:1, title:'sw-volunteers'}
  ]
  var factory = {

  	 init:function(cb){
		$http.post('api.php?action=datasets/get', {dataset_id:1}, {
		        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		        	transformRequest: transform
		}).then(function successCallback(response) {
				    // this callback will be called asynchronously
				    // when the response is available
				    datasets = response.data;
				    if(typeof cb === 'function')
				    	cb(datasets);
				    //$location.path('tables/'+$scope.field.table_id);
		}, function errorCallback(response) {
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.
		});
  	 },
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

app.controller('tableController',function($scope,$compile, $sce, $http, typeFactory, tableDataFactory){

	  $scope.loadTables = function(){
	  	console.log('loading tables...');
		$http.post('api.php?action=tables/get', {dataset_id:1}, {
        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        	transformRequest: transform
    	}).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    $scope.tables = response.data;

	  		console.log($scope.tables);
	  		console.log('... done');
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
	  	var tableData = tableDataFactory.getTableData(table_id);
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
	  };
	  $scope.prepareDropdownArray = function(table_id, fields){
	  };
	  $scope.generateDropdownOptions = function(fieldObj){
	  	var options = '',fieldData = fieldObj;
	  	if(fieldData.additional){

	  		if(typeof fieldData.additional == 'string')
	  			var dropdown_info = JSON.parse(fieldData.additional);
	  		else
	  			var dropdown_info = fieldData.additional;

			var i = 0;
			var options = '';

			//loop trough table rows
			if(dropdown_info)
				while(i < $scope.numberOfRows(dropdown_info.dropdown_table)){
				
					var text = '', index = '';

					//get values for option value
					angular.forEach(dropdown_info.dropdown_shown_values, function(value, key) {
						if(value != ''){
					  		text += $scope.getFieldValue(dropdown_info.dropdown_table,
					  									tableDataFactory.fieldIdToFieldIndex(parseInt(value),dropdown_info.dropdown_table),
					  									i+1);
						}
					});

					//get value for index
					index = $scope.getFieldValue(dropdown_info.dropdown_table,
					  									tableDataFactory.fieldIdToFieldIndex(parseInt(dropdown_info.dropdown_index),dropdown_info.dropdown_table),
					  									i+1);


					var selected = '';
					if(typeof dropdown_info.default_value !== 'undefined'&&i+1 == dropdown_info.default_value)
						selected = 'selected';

					if(index!='undefined'&&text!='undefined'&&index.length>0&&text.length>0)
						options += '<option value="'+index+'" '+selected+'>'+text+'</option>';
					

					i++;
				}
		}
		return options
	  }
	  $scope.getDropdownOptions = function(field_id,table_id,value){
	  	if(!value){
	  		value = '';
	  	}
	  	

	 

	  	return this.generateDropdownOptions(this.getFieldData(field_id,table_id));
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
	  		ngm = ngm+' class="field '+options.field_class+'"';

	  	var typeObject = typeFactory.getById(parseInt(fieldData.type));

	  	var syntax = typeObject.syntax;
	  	syntax=syntax.replace('%field_id%', 'field_id');
	  	syntax=syntax.replace('%field_value%', value);

	  	if(syntax.indexOf('%next_auto_index%') > -1){
	  		var next_index = tableDataFactory.getNextAutoIndex(field_id, table_id);

	  		ngm += ' ng-init="fields['+field_id+']= '+next_index+'"';

	  		syntax=syntax.replace('%next_auto_index%', next_index);
	  	}

	  	syntax=syntax.replace('%ngm%', ngm);
	  	var dropdownValues = $scope.getDropdownOptions(field_id, table_id, value);


	  	syntax=syntax.replace('%dropdown_values%', $scope.getDropdownOptions(field_id, table_id, value));

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
	  	var result;

	  	if(tabledata.fields)
		angular.forEach(tabledata.fields, function(value, key) {
		  if(i == field_index){
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
	  	var field_id = $scope.fieldIndexToFieldId(field_index,table_id);
	  	var field_selector = '#field_'+table_id+'_'+field_index+'_'+row;
	  	var value = $(field_selector+' input, '+field_selector+' select').val();

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
		    tableDataFactory.removeRow(table_id, row);
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
	  tableDataFactory.init();
	  $scope.getFieldValueArray = tableDataFactory.getFieldValueArray;
	  $scope.rowExists = tableDataFactory.rowExists;
	  //@param transformed_data 	if false -> values in dropdown are the row indexes of the dropdown table
	  $scope.getFieldValue = function(table_id, field_index, row_index,transformed_data){
	  	var fieldValueArray = tableDataFactory.getFieldValueArray(table_id, field_index, row_index,transformed_data);
	  	
		if(fieldValueArray[0])
		return fieldValueArray[0].value;
	  };
	  $scope.generateHistoryButton = function(table_id, field_index, row){

		var fieldValueArray = tableDataFactory.getFieldValueArray(table_id, field_index, row,true);
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
	  $scope.getTableData = tableDataFactory.getTableData;
      $scope.message="Hello mthrfckr";

});	
app.controller('datasetOverviewController',function($scope, $controller, datasetFactory){

	$scope.datasets = {};
	if(typeof $scope.datasets.fields === 'undefined')
		datasetFactory.init(function(result){
			$scope.datasets = datasetFactory.all();
		});


});
app.controller('createDatasetController',function($scope, $controller, $route, $http,$location){
	
  	$scope.addDatasetFormOpen = false;
  	$scope.dataset = {};
  	$scope.createDataset = function(){
  		$http.post('api.php?action=datasets/create', $scope.dataset, {
        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        	transformRequest: transform
    	}).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    alert('dataset created');
		    $location.path('/');
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
  	};
});

app.controller('formController',['$scope', '$controller', '$route', '$http','$location','tableDataFactory','$sce', function ($scope, $controller, $route, $http,$location,tableDataFactory,$sce){

  	$controller('tableController', {$scope: $scope});
  	$scope.tableId = $route.current.params.tableId;
  	$scope.showAdvanced = false;
	$scope.formData = {};
	$scope.formData.rows = [];
	$scope.getFormData = function(){
		return $scope.formData;
	};
        $scope.saveForm = function(){
                $http.post('api.php?action=forms/create', {'formData':{title:$scope.formData.title,json:angular.toJson($scope.formData),table_id:$scope.tableId}}, {
                    headers:{ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    transformRequest: transform
                }).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    //$location.path('datasets/'+$scope.dataset_id);
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
        };
	$scope.tableData = tableDataFactory.getTableData($scope.tableId);
	if(typeof $scope.tableData.fields === 'undefined')
		tableDataFactory.init(function(result){
			$scope.tableData = result;
		});

	$scope.rows = 1;
	$scope.addedField = {};
	$scope.addedField.column_width = 1;
	$scope.addRow = function(index){
		if(typeof index !== 'undefined'){

			$scope.formData.rows.splice(index+1, 0, {id:$scope.rows,fields:[]});

		}
		else{
			$scope.formData.rows.push({id:$scope.rows,fields:[]});
			$scope.rows++;
		}
	};
	var fieldTypesPushed = false;
	$scope.getFieldTypes = function(){
		var result = [];
		result = $scope.tableData.fields;
		if(!fieldTypesPushed){
			result.push({id:'textfield',title:'textfield'});
			result.push({id:'button',title:'button'});
			fieldTypesPushed = true;
		}
		return result;
	};
	$scope.removeRow = function(row_index){
		$scope.formData.rows.splice(row_index, 1);
	};
	$scope.colsInRow = function(row_index){
		var cols = 0;
		angular.forEach($scope.formData.rows[row_index].fields, function(value){
			if(value.column_width)
				cols = cols+parseInt(value.column_width);
			else
				cols++;
		});
		return cols;
	}
	$scope.parseField = function(fieldData, row_index, field_index, show_edit_button){
		var optionsbutton="";
		if(show_edit_button){
			optionsbutton += "";
			optionsbutton += "          <div class=\"btn-group field-options\" uib-dropdown>";
			optionsbutton += "            <button type=\"button\" ng-click=\"removeField("+row_index+", "+field_index+")\" class=\"btn btn-default\"><span class=\"glyphicon glyphicon-trash\"><\/span><\/button>";
			optionsbutton += "            <button id=\"btn-append-to-body\" type=\"button\" class=\"btn btn-default\" uib-dropdown-toggle>";
			optionsbutton += "              <span class=\"glyphicon glyphicon-pencil\"><\/span>";
			optionsbutton += "            <\/button>";
			optionsbutton += "          <\/div>";

		}

		switch(fieldData.field){
			default:
				var fieldInput = $scope.generateFieldInput(tableDataFactory.fieldIdToFieldIndex(fieldData.field, $scope.tableId), $scope.tableId, '');
			break;
			case'button':
				fieldInput = '<button>'+fieldData.button_text+'</button';
			break;
			case'textarea':
				fieldInput = '<span>'+fieldData.field_caption+'</span>';
			break;
		}

		var html = '<div class="ouick_field col_'+fieldData.column_width+' position_'+fieldData.caption_position+'">';

			html += '<span class="caption">'+fieldData.caption+'</span>';
			html += fieldInput+optionsbutton;
			html += '</div>';
		return $sce.trustAsHtml(html);
	};
	$scope.addField = function(row_index, field_index){
		if($scope.colsInRow(row_index) < 4)
			$scope.formData.rows[row_index].fields[$scope.formData.rows[row_index].fields.length] = angular.copy($scope.addedField);
		else
			alert('Already 4 columns');
	}
	$scope.removeField = function(row_index,field_index){
		console.error('asdasd');
		console.error(row_index, field_index);
		var row = $scope.formData.rows[row_index];
		console.error($scope.formData.rows[row_index]);
		row.fields.splice(field_index, 1);
		$scope.formData.rows[row_index] = row;
	}

}]);
app.controller('createFormController',['$scope', '$controller', '$route', '$http','$location','tableDataFactory','$sce', function ($scope, $controller, $route, $http,$location,tableDataFactory,$sce){
    $controller('formController', {$scope: $scope});
}]);
app.controller('createTableController',function($scope, $controller, $route, $http,$location){

  	$scope.dataset_id = $route.current.params.datasetId;
  	dataset = $scope.dataset_id;

  	$controller('tableOverviewController', {$scope: $scope});
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
app.controller('tableOverviewController',function($scope, $controller, $route){

  	$scope.dataset_id = $route.current.params.datasetId;
  	dataset = $scope.dataset_id;
  	$controller('tableController', {$scope: $scope});

});
app.controller('tableDetailController',function($scope, $controller, $route, $location, $http,$timeout,DTOptionsBuilder, tableDataFactory){
   	
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
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withPaginationType('full_numbers');

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
		    tableDataFactory.init(function(){
		    	//$scope.tableData = tableDataFactory.getTableData($scope.tableId);
		    });
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});


	};

});



app.factory('importFactory', function($http) {
  /*var data = {};
  var fieldValues = {};*/
  var tableData = {};
  var factory = {
  	 getDBInformation:function(host, port, dbname, dbuser, dbpassword, charset,cb){
		$http.post('api.php?action=mysql/getDBInformation', {host:host, port:port, dbname:dbname, dbuser:dbuser, dbpassword:dbpassword, charset:charset}, {
		        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		        	transformRequest: transform
		}).then(function successCallback(response) {
				    // this callback will be called asynchronously
				    // when the response is available
				    tableData = response.data;
				    if(typeof cb === 'function')
				    	cb(response.data);
		}, function errorCallback(response) {
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.
		});
  	 },
  	 importTables:function(mysqlinfo, tableData, cb){
		$http.post('api.php?action=mysql/importTables', {mysqlinfo:mysqlinfo, tableData:tableData}, {
		        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		        	transformRequest: transform
		}).then(function successCallback(response) {
				    // this callback will be called asynchronously
				    // when the response is available
				    if(typeof cb === 'function'){
				    	cb();
				    }
		}, function errorCallback(response) {
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.
		});

  	 }
  };
  return factory;
});
app.controller('importContoller',function($scope, $controller, $http, $route, $location, importFactory, $sce){
	$scope.step = 0;
	$scope.mysqlData = {};
	$scope.mysqlData.charset = 'utf8';
	$scope.dbData = {tables:[]};
	$scope.selectedtables = {};
	$scope.tableSelection = {};
	$scope.tableImportSelection = {};

	$scope.dataset_id = $route.current.params.datasetId;
	$scope.chooseType = function(type){
		$scope.step = 1;
	}

	$scope.log = function(){
		console.log($scope.selectedtables, $scope.tableSelection,$scope.tableImportSelection);
	}

	$scope.generateTypeSelect = function(type, extra, ngm){
		var typetext = type.replace(/\(.*\)/,'');


		var options = [];
		switch(typetext){
			case'int':
			case'double':
			case'tinyint':
			case'smallint':
			case'mediumint':
			case'bigint':
			case'float':
			case'decimal':
				if(extra == 'auto_increment'){
					options.push('id');
				}
				options.push('int');
				options.push('float');
			break;
			case'text':
			case'varchar':
			case'bit':
			case'char':
			case'tinytext':
			case'mediumtext':
			case'longtext':
			case'binary':
			case'varbinary':
			case'tinyblow':
			case'blob':
			case'mediumblob':
			case'longblog':
			case'enum':
			case'set':
			case'data':
			case'datetime':
			case'time':
			case'timestamp':
			case'year':
			options.push('text');
			break;
		}

		var optionsHTML = '';
		angular.forEach(options, function(value){
			optionsHTML += '<option>'+value+'</option>';
		})

		var ngm = 'ng-model="'+ngm+'"';
		var select = '<select '+ngm+'>'+optionsHTML+'</select>';


		return $sce.trustAsHtml(select+'<input type="text" name="importtype" value="'+type+'">');
	}

	$scope.submitStepTwo = function(){

		var result = {};

		angular.forEach($scope.selectedtables, function(value, key) {
		   result[key] = {fields:[],dataset_id:$scope.dataset_id};
		});

		angular.forEach($scope.tableImportSelection, function(value, table_name) {

			result[table_name].import_data = value.import_data;
			angular.forEach(value.import_types, function(field_type, field_name){
				var temp = {};
				temp[field_name] = field_type;
				result[table_name].fields.push(temp);
			});
		   
		});

		$scope.log();

		importFactory.importTables($scope.mysqlData, result,function(){

		});
		return result;
	}

	$scope.submitStepOne = function(){
		importFactory.getDBInformation($scope.mysqlData.host, 
										$scope.mysqlData.port, 
										$scope.mysqlData.dbname, 
										$scope.mysqlData.dbuser, 
										$scope.mysqlData.dbpassword, 
										$scope.mysqlData.charset,
										function(response){
											console.log(response);
											if(response.tables.length > 0){
												$scope.dbData = response;
												$scope.step=2;
											}

										});
	};

});
app.controller('createFieldController',function($scope, $controller, $http, $route, $location, typeFactory,tableDataFactory){
	$scope.field = {};
	tableDataFactory.init(function(){
		$scope.tables = tableDataFactory.getTableOverview();
	});
	$scope.field.table_id = $route.current.params.tableId;
	$scope.fieldTypes = typeFactory.all();
	$scope.field.additional = {};
	$scope.dropDownTableData = [];
	$scope.updateDropDownTableData = function(){
		console.log($scope.field.additional.dropdown_table);
		$scope.table = tableDataFactory.getTableData($scope.field.additional.dropdown_table);
		$scope.dropDownTableData.fields = $scope.table.fields;
	}

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


app.controller('deleteTableController',function($scope, $controller, $http, $route, $location, typeFactory,tableDataFactory){
	$scope.table_id = $route.current.params.tableId;
	$scope.tabledata = tableDataFactory.getTableData($scope.table_id);

	$scope.deleteTable = function(){
		alert('ayayay');
		$http.post('api.php?action=tables/delete', {table_id:$scope.table_id}, {
        	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        	transformRequest: transform
    	}).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available

		    $location.path('/');
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

function removeField(row_index,field_index){
	var scope = angular.element(document.getElementById('ngView')).scope();
	scope.$apply(function(){
		scope.removeField(row_index,field_index);
	});
	alert('wouhuhuhuh');
};
