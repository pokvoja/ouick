<?php
include('inc/class_db.php');


include('inc/ouick_classes.php');



switch($_GET['action']){
  case'tables/get':

    $ouick_table = new ouick_table();
    echo $ouick_table->toJson($_POST['dataset_id']);
    
  break;
  case'tables/create':

    $ouick_table = new ouick_table();
    $ouick_table->title = $_POST['title'];
    $ouick_table->dataset_id = $_POST['dataset_id'];
    $ouick_table->save();
    echo $ouick_table->table_id;
  break;
  case'createField':

    $ouick_field = new ouick_field();
    $ouick_field->table_id = $_POST['table_id'];
    $ouick_field->type = $_POST['type'];
    $ouick_field->title = $_POST['title'];
    $ouick_field->default_value = $_POST['default_value'];
    $ouick_field->additional = json_encode($_POST['additional']);
    $ouick_field->save();
    echo $ouick_field->id;

  break;
  case'updateField':
    $ouick_field = new ouick_field($_POST['field_id']);
    $ouick_field->row = $_POST['row'];
    $ouick_field->value = $_POST['value'];
    echo $ouick_field->update();

  break;
  case'tables/delete':
    $ouick_table = new ouick_table($_POST['table_id']);
    echo $ouick_table->remove();

  break;
  case'createRow':

    $ouick_table = new ouick_table($_POST['table_id']);
    $ouick_table->createRow($_POST['fields']);

  break;
  case 'rows/remove':

    $ouick_table = new ouick_table($_POST['table_id']);
    $ouick_table->deleteRow($_POST['row_id']);
  break;
  case'fieldtypes/get':
    $db = new db();
    echo json_encode($db->shiftResult($db->query("SELECT * FROM `field_types` WHERE active='1' ORDER BY order_id ASC"),'id'));

  break;
  case 'insertTestFields':
    $i = 8;
    $db = new db();
    while($i < 10000){

      $values = array();
      $values['field_id'] = ($i%8)+1;
      $values['row'] = round($i/8);
      $values['value'] = generateRandomString(50);
      if($i%8 == 0){
        $values['value'] = round($i/8);
      }
      $values['timestamp'] = time();
      $db->insert('field_values', $values);
      $i++;
      echo $i;

    }
  break;
  
  
  case'forms/create':
      
      $request = $_POST['formData'];
      var_dump($request);
      
      $values = array();
      $values['table_id'] = $request['table_id'];
      $values['json'] = $request['json'];
      $values['title'] = $request['title'];
      $db = new db();
      $form_id = $db->insert('forms', $values);
      echo $form_id;
      /*$_POST['title'];
      $_POST['subtitle'];
      $_POST['ngModel'];*/
  break;
  
  
  
  case'mysql/getDBInformation':
    $db = new db();
    $db->updateConnection($_POST['host'], $_POST['port'], $_POST['dbname'], $_POST['dbuser'], $_POST['dbpassword'], 'utf8');
    echo json_encode($db->getDBInformation());
  break;
  case'mysql/importTables':
    foreach($_POST['tableData'] AS $table_name=>$fieldArray){
      echo 'Create Table '.$table_name.' in dataset '.$fieldArray['dataset_id']."\n";

      $ouick_table = new ouick_table();
      $ouick_table->title = $table_name;
      $ouick_table->dataset_id = $fieldArray['dataset_id'];
      $ouick_table->save();
      $table_id = $ouick_table->table_id;

      echo "Adding fields...\n";
      $createdFields = array();
      $fieldIds = array();
      foreach($fieldArray['fields'] AS $fieldData){
        foreach($fieldData AS $field_name=>$field_type){

          $ouick_field = new ouick_field();
          $ouick_field->table_id = $table_id;
          $ouick_field->type = $field_type;
          $ouick_field->title = $field_name;
          $ouick_field->default_value = '';
          $ouick_field->save();

          $fieldIds[$field_name] = $ouick_field->id;
           
          $createdFields[] = $field_name;
          echo '  ...field '.$field_name.' was imported as '.$field_type."\n";

        }
      }
      var_dump($createdFields);
      if($fieldArray['import_data'] == '1'){

        $db = new db();

        if(!isset($_POST['mysqlinfo']['dbpassword']))
          $_POST['mysqlinfo']['dbpassword'] = '';
        $db->updateConnection($_POST['mysqlinfo']['host'], $_POST['mysqlinfo']['port'], $_POST['mysqlinfo']['dbname'], $_POST['mysqlinfo']['dbuser'], $_POST['mysqlinfo']['dbpassword'], 'utf8');

        $query = 'SELECT '.$db->escape(join(',',$createdFields)).' FROM '.$db->escape($table_name);
        echo $query;

        $rows = $db->shiftResult($db->query($query),$createdFields[0]);
        var_dump($rows);
        foreach($rows AS $rowFields){
          $fields = array();
          foreach($rowFields AS $field_name=>$field_value){
            if(!is_numeric($field_name)){
              echo $field_name.' : '.$field_value;
              $field_id = $fieldIds[$field_name];
              $fields[$field_id] = $field_value;
            }
          }


          echo $ouick_table->createRow($fields);
          var_dump($fields);
          
        }

        //start to import data;

      }
    }

  break;
  case 'datasets/create':
    $db = new db();
    $db->insert('datasets',array('title'=>$_POST['title']));
  break;
  case 'datasets/get':
    $db = new db();
    echo json_encode($db->shiftResult($db->query('SELECT * FROM datasets'),'id'));
  break;
}?>