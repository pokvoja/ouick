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
  public static function remove(){

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
    $result = $db->query("SELECT MAX(row) FROM field_values WHERE field_id IN (".implode(',',$this->getFieldIdArray()).")");

    return $result[0];
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

      //select fields for table
      $result['fields'] = $db->shiftResult($db->select('fields',array('table_id',$table['id'])),'table_id');

      $result['field_values'] = array();
      if(is_array($result['fields']))
      foreach($result['fields'] AS $table_field){
        if(is_array($table_field)){
          //select field values for field ordered by row
          $resultz = $db->shiftResult($db->select('field_values',array('field_id',$table_field['id']), null, array('row','DESC')), 'field_id');
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
  public $default_value;
  public function __construct($id=null){
    if($id)
      $this->id = $id;
  }
  public function save(){
    $values['table_id'] = $this->table_id;
    $values['type'] = $this->type;
    $values['title'] = $this->title;
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
    $ouick_field->save();
    echo $ouick_field->id;

  break;
  case'updateField':
    $ouick_field = new ouick_field($_POST['field_id']);
    $ouick_field->row = $_POST['row'];
    $ouick_field->value = $_POST['value'];
    echo $ouick_field->update();

  break;
  case'createRow':

    $ouick_table = new ouick_table($_POST['table_id']);
    $ouick_table->createRow($_POST['fields']);

  break;
  case'getFieldTypes':
    $db = new db();
    echo json_encode($db->shiftResult($db->query('SELECT * FROM `field_types`'),'id'));

  break;
  case 'insertTestFields':
    $i = 8;
    $db = new db();
    while($i < 64){

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
