<?php
include('inc/class_db.php');


class ouick_table{
  public $table_id;
  public $dataset_id;
  public $title;
  public function __construct($table_id=null){
    if(isset($table_id))
    $this->table_id = $table_id;
  }
  public function save(){
    $db = new db();
    $values['dataset_id'] = $this->dataset_id;
    $values['title'] = $this->title;
    $this->table_id = $db->insert('tables', $values);

  }
  public function remove(){
    $db = new db();
    $fields = $db->shiftResult($db->select('fields',array('table_id',$this->table_id)),'id');
    foreach($fields AS $field){
      $field_ids[] = $field['id'];
    }


    $query = 'DELETE FROM `fields` WHERE id IN ('.join(',',$field_ids).');';
    $query .= 'DELETE FROM `field_values` WHERE field_id IN ('.join(',',$field_ids).');';
    $query .=  "DELETE FROM `tables` WHERE id='".$this->table_id."'";

    return $db->query($query);
  }
  public function getFieldIdArray(){

    $db = new db();
    
    $result = [];
    foreach($db->shiftResult($db->select('fields', array('table_id', $this->table_id), array('id')), 'id') AS $field){
      $result[] = $field['id'];
    }
    return $result;
  }
  public function numberOfRows(){

    $db = new db();

    $query = "SELECT MAX(row) FROM field_values WHERE field_id IN (".implode(',',$this->getFieldIdArray()).")";

    $result = $db->query($query);

    return $result[0];
  }
  public function deleteRow($row_id){

    $db = new db();
    $query = "DELETE FROM field_values WHERE field_id IN (".implode(',',$this->getFieldIdArray()).") AND row=".(int)$row_id;
    $db->query($query);
    echo 1;
  }
  public function createRow($fields){

    //echo $this->table_id;
    $numberOfRows = $this->numberOfRows();
    $db = new db();
    //var_dump($fields);
    foreach($fields AS $field_id => $field_value){
      $field = array();
      $field['field_id'] = $field_id;
      $field['row'] = $numberOfRows+1;
      $field['value'] = $field_value;
      $field['timestamp'] = time();

      $db->insert('field_values', $field)."\n";
    };
    echo $numberOfRows;
  }
  public static function toJson($dataset){
    $db = new db();
    $result = array();
    $results = array();

    //get all tables from db
    $tables = $db->shiftResult($db->query('SELECT * FROM `tables` WHERE dataset_id='.(int)$dataset),'id');

    //loop all tables
    foreach($tables AS $table){
      $result['id'] = $table['id'];
      $result['title'] = $table['title'];
      $result['fields'] = array();
      $result['formulars'] = array();
      
      
      //select forms for table
      $forms = $db->shiftResult($db->select('forms',array('table_id',$table['id'])),'table_id');
      foreach($forms AS $form){
        /*$newField = array();
        foreach($fieldData AS $index=>$value)
          if(!is_numeric($index))
            $newField[$index] = $value;*/

        $result['formulars'][] = $form;
      }
      
      
      //select fields for table
      $tempFields = $db->shiftResult($db->select('fields',array('table_id',$table['id'])),'table_id');
      foreach($tempFields AS $fieldData){
        $newField = array();
        foreach($fieldData AS $index=>$value)
          if(!is_numeric($index))
            $newField[$index] = $value;

        $result['fields'][] = $newField;
      }
      $result['field_values'] = array();
      if(is_array($result['fields']))
      foreach($result['fields'] AS $table_field){
        if(is_array($table_field)){
          //select field values for field ordered by row
          $resultz = $db->shiftResult($db->select('field_values',array('field_id',$table_field['id']), array('field_id', 'row','value', 'timestamp'), array('row','DESC')), 'field_id');
          if(is_array($resultz))
            $result['field_values'] = array_merge($resultz, $result['field_values']);
        }
      }

      $results[] = $result;
    }

    return json_encode($results, true);
  }
}
class ouick_field{

  public $id;
  public $table_id;
  public $type;
  public $title;
  public $value;
  public $additional;
  public $default_value;
  public function __construct($id=null){
    if($id)
      $this->id = $id;
  }
  public function save(){
    $values['table_id'] = $this->table_id;
    $values['type'] = $this->type;
    $values['title'] = $this->title;
    $values['additional'] = $this->additional;
    $values['default_value'] = $this->default_value;

    $db = new db();
    $this->id = $db->insert('fields', $values);
    return $this->id;
  }
  public function update(){
      $db = new db();
      $field = array();
      $field['field_id'] = $this->id;
      $field['row'] = $this->row;
      $field['value'] = $this->value;
      $field['timestamp'] = time();

      return $db->insert('field_values', $field)."\n";
  }
  public static function remove(){

  }
  public static function changeFieldPostion(){

  }
}

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
  case'getFieldTypes':
    $db = new db();
    echo json_encode($db->shiftResult($db->query('SELECT * FROM `field_types`'),'id'));

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
}

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}
